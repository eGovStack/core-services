const config = require('../../env-variables');
const valueFirst = require('../../channel/value-first');        // TODO: import channel
const fetch = require("node-fetch");
const dialog = require('../util/dialog');
const userService = require('../../session/user-service');
const chatStateRepository = require('../../session/repo');
const localisationService = require('../util/localisation-service');
const telemetry = require('../../session/telemetry');

const consumerGroupOptions = require('../../session/kafka/kafka-consumer-group-options');

const kafka = require('kafka-node');

class PaymentStatusUpdateEventFormatter{

  constructor() {
    let topicList = [];
    topicList.push(config.billsAndReceiptsUseCase.pgUpdateTransaction);
    topicList.push(config.billsAndReceiptsUseCase.paymentUpdateTopic);
    let consumerGroup = new kafka.ConsumerGroup(consumerGroupOptions, topicList);
    let self = this;
    consumerGroup.on('message', function(message) {
      console.log('PaymentStatusUpdateEventFormatter-->message received-->topic name: '+ message.topic);
        if(message.topic === config.billsAndReceiptsUseCase.paymentUpdateTopic) {
          let paymentRequest = JSON.parse(message.value);
          console.log('PaymentStatusUpdateEventFormatter-->paymentUpdateTopic message received-->topic name: '+ message.topic);
          console.log(JSON.stringify(paymentRequest));
          if(paymentRequest.Payment.additionalDetails && paymentRequest.Payment.additionalDetails.isWhatsapp){
            console.log('isWhatsapp: true');

            self.paymentStatusMessage(paymentRequest)
            .then(() => {
                console.log("payment message sent to citizen");        // TODO: Logs to be removed
            })
            .catch(error => {
                console.error('error while sending event message');
                console.error(error.stack || error);
            });

          }

        }

        if(message.topic === config.billsAndReceiptsUseCase.pgUpdateTransaction){
          console.log('PaymentStatusUpdateEventFormatter--> pgUpdateTransaction message received-->topic name: '+ message.topic);
          let transactionRequest = JSON.parse(message.value);
          console.log(JSON.stringify(transactionRequest));
          let status = transactionRequest.Transaction.txnStatus;

          if(status === 'FAILURE' && transactionRequest.Transaction.additionalDetails.isWhatsapp){
              self.prepareTransactionFailedMessage(transactionRequest)
              .then(() => {
                console.log("transaction failed message sent to citizen");        // TODO: Logs to be removed
              })
              .catch(error => {
                console.error('error while sending event message');
                console.error(error.stack || error);
            });
          } 
        }

    });
}

  async paymentStatusMessage(request){
    console.log('In paymentStatusMessage');
    let payment = request.Payment;
    let locale = config.supportedLocales.split(',');
    locale = locale[0];
    let user = await userService.getUserForMobileNumber(payment.mobileNumber, config.rootTenantId);
    let userId = user.userId;
    let chatState = await chatStateRepository.getActiveStateForUserId(userId);
    if(chatState)
      locale = chatState.context.user.locale;
  
    if(payment.additionalDetails && payment.additionalDetails.isWhatsapp){
      let tenantId = payment.tenantId;
      tenantId = tenantId.split(".")[0]; 

      let businessService = payment.paymentDetails[0].businessService;
      let consumerCode    = payment.paymentDetails[0].bill.consumerCode;
      let isOwner = true;
      let key;
      if(businessService === 'TL')
        key = 'tradelicense-receipt';

      else if(businessService === 'PT'){
        key = 'property-receipt';
        isOwner = await this.getPTOwnerDetails(consumerCode, payment.tenantId, payment.mobileNumber, user.authToken);
      }
      
      else if(businessService === 'WS' || businessService === 'SW'){
        key = 'ws-onetime-receipt';
        isOwner = await this.getWnsOwnerDeatils(consumerCode, payment.tenantId, businessService, payment.mobileNumber, user.authToken);
      }

      else
        key = 'consolidatedreceipt';
   

      let pdfUrl = config.egovServices.egovServicesHost + 'pdf-service/v1/_create';
      pdfUrl = pdfUrl + '?key='+key+ '&tenantId=' + tenantId;

      let msgId = request.RequestInfo.msgId.split('|');
      msgId = msgId[0] + '|' + locale; 

      let requestBody = {
        RequestInfo: {
          authToken: user.authToken,
          msgId: msgId,
          userInfo: user.userInfo
        },
        Payments:[]
      };
      requestBody.Payments.push(payment);
      console.log("Before PT receipt custom changes: " + JSON.stringify(requestBody));

      if(businessService === 'PT'){
        this.ptreceipt(requestBody);
      }
      console.log("After PT receipt custom changes: " + JSON.stringify(requestBody));
      console.log("URL: "+ pdfUrl);
      console.log("user token: "+ user.authToken);

      let options = {
        method: 'POST',
        origin: '*',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
      let response = await fetch(pdfUrl, options);
      console.log(response);
      if(response.status == 201){
        let responseBody = await response.json();
        let user = {
          mobileNumber: payment.mobileNumber
        };
        let extraInfo = {
          whatsAppBusinessNumber: config.whatsAppBusinessNumber.slice(2),
          fileName: key
        };

        if(isOwner){
          chatState.context.bills.paidBy = 'OWNER'
        }
        else
          chatState.context.bills.paidBy = 'OTHER'

        let active = !chatState.done;
        await chatStateRepository.updateState(user.userId, active, JSON.stringify(chatState), new Date().getTime());

        let waitMessage = [];
        var messageContent = {
          output: dialog.get_message(messageBundle.wait,locale),
          type: "text"
        };
        waitMessage.push(messageContent);
        await valueFirst.sendMessageToUser(user, waitMessage, extraInfo);

        let message = [];
        var pdfContent = {
          output: responseBody.filestoreIds[0],
          type: "pdf"
        };
        message.push(pdfContent);
        await valueFirst.sendMessageToUser(user, message, extraInfo);

        let payBillmessage = [];
        let templateContent = await this.prepareSucessMessage(payment, locale, isOwner);
        payBillmessage.push(templateContent);
        await new Promise(resolve => setTimeout(resolve, 3000));
        await valueFirst.sendMessageToUser(user, payBillmessage, extraInfo);

        if(!isOwner){
          /*let question = dialog.get_message(messageBundle.registration,locale);
          question = question.replace('{{consumerCode}}',consumerCode);
          let localisationCode = "BILLINGSERVICE_BUSINESSSERVICE_"+businessService;
          let localisationMessages = await localisationService.getMessageBundleForCode(localisationCode);
          let service = dialog.get_message(localisationMessages,locale)
          question = question.replace('{{service}}', service.toLowerCase());*/

          let question = dialog.get_message(messageBundle.endStatement,locale);
          var registrationMessage = {
            output: question,
            type: "text"
          };

          await new Promise(resolve => setTimeout(resolve, 3000));
          await valueFirst.sendMessageToUser(user, [registrationMessage], extraInfo);
        }
        telemetry.log(userId, 'payment', {message : {type: "whatsapp payment", status: "success", businessService: businessService, consumerCode: consumerCode,transactionNumber: payment.transactionNumber, locale: user.locale}});
      }
    }

  }

convertEpochToDate (dateEpoch ) {
    const dateFromApi = new Date(dateEpoch);
    let month = dateFromApi.getMonth() + 1;
    let day = dateFromApi.getDate();
    let year = dateFromApi.getFullYear();
    month = (month > 9 ? "" : "0") + month;
    day = (day > 9 ? "" : "0") + day;
    return `${day}/${month}/${year}`;
  };


  ptreceipt(payloadReceiptDetails)
{
  let assessmentYear="",assessmentYearForReceipt="";
      let count=0;
      if(payloadReceiptDetails.Payments[0].paymentDetails[0].businessService=="PT"){
          let arrearRow={};  let arrearArray=[];
  let roundoff=0,tax=0,firecess=0,cancercess=0,penalty=0,rebate=0,interest=0,usage_exemption=0,special_category_exemption=0,adhoc_penalty=0,adhoc_rebate=0,total=0;
          payloadReceiptDetails.Payments[0].paymentDetails[0].bill.billDetails.map(element => {

          if(element.amount >0 || element.amountPaid>0)
          { count=count+1;
            let toDate=this.convertEpochToDate(element.toPeriod).split("/")[2];
            let fromDate=this.convertEpochToDate(element.fromPeriod).split("/")[2];
            assessmentYear=assessmentYear==""?fromDate+"-"+toDate+"(Rs."+element.amountPaid+")":assessmentYear+","+fromDate+"-"+toDate+"(Rs."+element.amountPaid+")";
         assessmentYearForReceipt=fromDate+"-"+toDate;
    element.billAccountDetails.map(ele => {
    if(ele.taxHeadCode == "PT_TAX")
    {tax=ele.adjustedAmount;}
    else if(ele.taxHeadCode == "PT_TIME_REBATE")
    {rebate=ele.adjustedAmount;}
    else if(ele.taxHeadCode == "PT_CANCER_CESS")
    {cancercess=ele.adjustedAmount;}
    else if(ele.taxHeadCode == "PT_FIRE_CESS")
    {firecess=ele.adjustedAmount;}
    else if(ele.taxHeadCode == "PT_TIME_INTEREST")
    {interest=ele.adjustedAmount;}
    else if(ele.taxHeadCode == "PT_TIME_PENALTY")
    {penalty=ele.adjustedAmount;}
    else if(ele.taxHeadCode == "PT_OWNER_EXEMPTION")
    {special_category_exemption=ele.adjustedAmount;}
    else if(ele.taxHeadCode == "PT_ROUNDOFF")
    {roundoff=ele.adjustedAmount;}
    else if(ele.taxHeadCode == "PT_UNIT_USAGE_EXEMPTION")
    {usage_exemption=ele.adjustedAmount;}
    else if(ele.taxHeadCode == "PT_ADHOC_PENALTY")
    {adhoc_penalty=ele.adjustedAmount;}
    else if(ele.taxHeadCode == "PT_ADHOC_REBATE")
    {adhoc_rebate=ele.adjustedAmount;}
    //total=total+ele.adjustedAmount;
    });
  arrearRow={
  "year":assessmentYearForReceipt,
  "tax":tax,
  "firecess":firecess,
  "cancercess":cancercess,
  "penalty":penalty,
  "rebate": rebate,
  "interest":interest,
  "usage_exemption":usage_exemption,
  "special_category_exemption": special_category_exemption,
  "adhoc_penalty":adhoc_penalty,
  "adhoc_rebate":adhoc_rebate,
  "roundoff":roundoff,
  "total":element.amountPaid
  };
  arrearArray.push(arrearRow);
            }
          });
        if(count==0){  total=0;
          let index=payloadReceiptDetails.Payments[0].paymentDetails[0].bill.billDetails.length;
          let toDate=this.convertEpochToDate( payloadReceiptDetails.Payments[0].paymentDetails[0].bill.billDetails[0].toPeriod).split("/")[2];
          let fromDate=this.convertEpochToDate( payloadReceiptDetails.Payments[0].paymentDetails[0].bill.billDetails[0].fromPeriod).split("/")[2];
          assessmentYear=assessmentYear==""?fromDate+"-"+toDate:assessmentYear+","+fromDate+"-"+toDate;
          assessmentYearForReceipt=fromDate+"-"+toDate;
          payloadReceiptDetails.Payments[0].paymentDetails[0].bill.billDetails[0].billAccountDetails.map(ele => {
            if(ele.taxHeadCode == "PT_TAX")
            {tax=ele.adjustedAmount;}
            else if(ele.taxHeadCode == "PT_TIME_REBATE")
            {rebate=ele.adjustedAmount;}
            else if(ele.taxHeadCode == "PT_CANCER_CESS")
            {cancercess=ele.adjustedAmount;}
            else if(ele.taxHeadCode == "PT_FIRE_CESS")
            {firecess=ele.adjustedAmount;}
            else if(ele.taxHeadCode == "PT_TIME_INTEREST")
            {interest=ele.adjustedAmount;}
            else if(ele.taxHeadCode == "PT_TIME_PENALTY")
            {penalty=ele.adjustedAmount;}
            else if(ele.taxHeadCode == "PT_OWNER_EXEMPTION")
            {special_category_exemption=ele.adjustedAmount;}
            else if(ele.taxHeadCode == "PT_ROUNDOFF")
            {roundoff=ele.adjustedAmount;}
            else if(ele.taxHeadCode == "PT_UNIT_USAGE_EXEMPTION")
            {usage_exemption=ele.adjustedAmount;}
            else if(ele.taxHeadCode == "PT_ADHOC_PENALTY")
            {adhoc_penalty=ele.adjustedAmount;}
            else if(ele.taxHeadCode == "PT_ADHOC_REBATE")
            {adhoc_rebate=ele.adjustedAmount;}
            total=total+ele.adjustedAmount;
            });
          arrearRow={
          "year":assessmentYearForReceipt,
          "tax":tax,
          "firecess":firecess,
          "cancercess":cancercess,
          "penalty":penalty,
          "interest":interest,
          "usage_exemption":usage_exemption,
          "special_category_exemption": special_category_exemption,
          "adhoc_penalty":adhoc_penalty,
          "adhoc_rebate":adhoc_rebate,
          "roundoff":roundoff,
          "total":total
          };
          arrearArray.push(arrearRow);
        }
          const details = {
            "assessmentYears": assessmentYear,
        "arrearArray":arrearArray
            }
            payloadReceiptDetails.Payments[0].paymentDetails[0].additionalDetails=details; 
        }
    }
  async prepareSucessMessage(payment, locale, isOwner){
    let templateList;
    let params=[];
    if(isOwner){
      templateList =  config.valueFirstWhatsAppProvider.valuefirstNotificationOwnerBillSuccessTemplateid.split(',');
      params.push(payment.transactionNumber);
    }
    else{
      if(payment.paymentDetails[0].businessService === 'PT')
        templateList =  config.valueFirstWhatsAppProvider.valuefirstNotificationOtherPTBillSuccessTemplateid.split(',');

      if(payment.paymentDetails[0].businessService === 'WS' || payment.paymentDetails[0].businessService === 'SW')
        templateList =  config.valueFirstWhatsAppProvider.valuefirstNotificationOtherWSBillSuccessTemplateid.split(',');
      
        params.push(payment.paymentDetails[0].bill.consumerCode);
        params.push(payment.transactionNumber);
    }
    let localeList   =  config.supportedLocales.split(',');
    let localeIndex  =  localeList.indexOf(locale);

    let templateId;
    if(templateList[localeIndex])
      templateId = templateList[localeIndex];
    else
      templateId = templateList[0];


    var templateContent = {
      output: templateId,
      type: "template",
      params: params
    };
    
    return templateContent;
  }

  async prepareTransactionFailedMessage(request){
    let locale = config.supportedLocales.split(',');
    locale = locale[0];
    let payerUser = await userService.getUserForMobileNumber(request.Transaction.user.mobileNumber, config.rootTenantId);
    let chatState = await chatStateRepository.getActiveStateForUserId(payerUser.userId);
    if(chatState)
      locale = chatState.context.user.locale;

    let transactionNumber = request.Transaction.txnId;
    let consumerCode = request.Transaction.consumerCode;
    let businessService = request.Transaction.module;
    /*
    let tenantId = request.Transaction.tenantId;
    let link = await this.getPaymentLink(consumerCode,tenantId,businessService,locale);*/

    let user = {
      mobileNumber: request.Transaction.user.mobileNumber
    };

    let extraInfo = {
      whatsAppBusinessNumber: config.whatsAppBusinessNumber.slice(2),
    };

    let message = [];
    let template = dialog.get_message(messageBundle.paymentFail,locale);
    template = template.replace('{{transaction_number}}',transactionNumber);
    //template = template.replace('{{link}}',link);
    message.push(template);
    await valueFirst.sendMessageToUser(user, message,extraInfo);
    telemetry.log(payerUser.userId, 'payment', {message : {type: "whatsapp payment", status: "failed", businessService: businessService, consumerCode: consumerCode,transactionNumber: transactionNumber, locale: locale}});
  }

  /*async getShortenedURL(finalPath){
    var url = config.egovServices.egovServicesHost + config.egovServices.urlShortnerEndpoint;
    var request = {};
    request.url = finalPath; 
    var options = {
      method: 'POST',
      body: JSON.stringify(request),
      headers: {
        'Content-Type': 'application/json'
      }
    }
    let response = await fetch(url, options);
    let data = await response.text();
    return data;
  }
  
  async getPaymentLink(consumerCode,tenantId,businessService,locale){
    var UIHost = config.egovServices.externalHost;
    var paymentPath = config.egovServices.msgpaylink;
    paymentPath = paymentPath.replace(/\$consumercode/g,consumerCode);
    paymentPath = paymentPath.replace(/\$tenantId/g,tenantId);
    paymentPath = paymentPath.replace(/\$businessservice/g,businessService);
    paymentPath = paymentPath.replace(/\$redirectNumber/g,"+"+config.whatsAppBusinessNumber);
    paymentPath = paymentPath.replace(/\$locale/g,locale);
    var finalPath = UIHost + paymentPath;
    var link = await this.getShortenedURL(finalPath);
    return link;
  }*/

  async getWnsOwnerDeatils(consumerCode, tenantId, businessService, mobileNumber, authToken){
    let requestBody = {
      RequestInfo: {
        authToken: authToken
      }
    };

    let options = {
      method: 'POST',
      origin: '*',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    };

    let url = config.egovServices.externalHost;    
    if(businessService === 'WS'){
      url = url + config.egovServices.waterConnectionSearch;
    }
    if(businessService === 'SW'){
      url = url + config.egovServices.sewerageConnectionSearch;;
    }

    url = url + '&tenantId='+tenantId;
    url = url + '&connectionNumber='+consumerCode;
    let response = await fetch(url,options);
    let searchResults;
    
    if(response.status === 200) {
      searchResults = await response.json();
      let connectionHolders;
      let propertyId;

      if(businessService === 'WS'){
        connectionHolders = searchResults.WaterConnection[0].connectionHolders
        propertyId = searchResults.WaterConnection[0].propertyId;
      }
      if(businessService === 'SW'){
        connectionHolders = searchResults.SewerageConnections[0].connectionHolders
        propertyId = searchResults.SewerageConnections[0].propertyId;
      }

      let isMobileNumberPresent = await this.getPTOwnerDetails(propertyId, tenantId, mobileNumber, authToken);
      if(isMobileNumberPresent)
        return true;
      
      if(connectionHolders != null){
        for(let connectionHolder of connectionHolders){
          if(connectionHolder.mobileNumber === mobileNumber)
            return true;
        }
      }
    }
    return false;
  }

  async getPTOwnerDetails(propertyId, tenantId, mobileNumber, authToken){

    let isMobileNumberPresent = false;

    let requestBody = {
      RequestInfo: {
        authToken: authToken
      }
    };

    let options = {
      method: 'POST',
      origin: '*',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    };

    let url = config.egovServices.externalHost + 'property-services/property/_search';
    url = url + '?tenantId='+tenantId;
    url = url + '&propertyIds='+propertyId;
    let response = await fetch(url,options);
    let searchResults;
    
    if(response.status === 200) {
      searchResults = await response.json();
      let ownerList = searchResults.Properties[0].owners;

      for(let owner of ownerList){
        if(owner.mobileNumber === mobileNumber)
          isMobileNumberPresent = true;
      }
    }
    return isMobileNumberPresent;
  }

}


let messageBundle = {
  paymentSucess:{
    en_IN: "Bill Payment Successful ✅\n\nYour transaction number is {{transaction_number}}.\n\nYou can download the payment receipt from above.\n\n[Payment receipt in PDF format is attached with message]\n\nWe are happy to serve you 😃",
    hi_IN: "बिल भुगतान सफल ✅\n\nआपका ट्रांजेक्शन नंबर है: {{transaction_number}}.\n\nYou can download the payment receipt from above.\n\n[Payment receipt in PDF format is attached with message]\n\nWe are happy to serve you 😃",
    hi_IN: "धन्यवाद😃! आपने mSeva पंजाब के माध्यम से अपने बिल का सफलतापूर्वक भुगतान किया है। आपका ट्रांजेक्शन नंबर {{transaction_number}} है। \n\n कृपया अपने संदर्भ के लिए संलग्न रसीद प्राप्त करें।"
  },
  paymentFail:{
    en_IN: "Sorry 😥!  The Payment Transaction has failed due to authentication failure.\n\nYour transaction reference number is {{transaction_number}}.\n\nTo go back to the main menu, type and send mseva.",
    hi_IN: "क्क्षमा करें 😥! प्रमाणीकरण विफलता के कारण भुगतान लेनदेन विफल हो गया है।\n\nआपकी लेन-देन संदर्भ संख्या {{transaction_number}} है।\n\nमुख्य मेनू पर वापस जाने के लिए, टाइप करें और mseva भेजें।",
    pa_IN: "ਮਾਫ ਕਰਨਾ 😥! ਪ੍ਰਮਾਣਿਕਤਾ ਅਸਫਲ ਹੋਣ ਕਾਰਨ ਭੁਗਤਾਨ ਸੌਦਾ ਅਸਫਲ ਹੋ ਗਿਆ ਹੈ.\n\nਤੁਹਾਡਾ ਲੈਣ-ਦੇਣ ਦਾ ਹਵਾਲਾ ਨੰਬਰ {{transaction_number}} ਹੈ.\n\nਮੁੱਖ ਮੀਨੂੰ ਤੇ ਵਾਪਸ ਜਾਣ ਲਈ, ਟਾਈਪ ਕਰੋ ਅਤੇ ਮੇਲ ਭੇਜੋ."
  },
  wait:{
    en_IN: "Please wait while your receipt is being generated.",
    hi_IN: "कृपया प्रतीक्षा करें जब तक आपकी रसीद तैयार की जा रही है।.",
    pa_IN: "ਕਿਰਪਾ ਕਰਕੇ ਉਡੀਕ ਕਰੋ ਜਦੋਂ ਤੁਹਾਡੀ ਰਸੀਦ ਤਿਆਰ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ."
  },
  registration:{
    en_IN: 'If you want to receive {{service}} bill alerts for {{consumerCode}} on this mobile number type and send *1*\n\nElse type and send *2*',
    hi_IN: 'यदि आप इस मोबाइल नंबर प्रकार पर {{उपभोक्ता कोड}} के लिए बिल अलर्ट प्राप्त करना चाहते हैं और भेजें *1*\n\nअन्यथा टाइप करें और *2* भेजें'
  },
  endStatement:{
    en_IN: "👉 To go back to the main menu, type and send mseva.",
    hi_IN: '👉 मुख्य मेनू पर वापस जाने के लिए, टाइप करें और mseva भेजें।',
    pa_IN: '👉 ਮੁੱਖ ਮੀਨੂੰ ਤੇ ਵਾਪਸ ਜਾਣ ਲਈ, ਟਾਈਪ ਕਰੋ ਅਤੇ ਮੇਲ ਭੇਜੋ.'
  }

};

let paymentStatusUpdateEvents = new PaymentStatusUpdateEventFormatter();

module.exports = paymentStatusUpdateEvents;
