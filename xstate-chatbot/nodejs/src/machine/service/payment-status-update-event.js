const config = require('../../env-variables');
const valueFirst = require('../../channel/value-first');        // TODO: import channel
const fetch = require("node-fetch");
const dialog = require('../util/dialog');

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
        if(message.topic === config.billsAndReceiptsUseCase.paymentUpdateTopic) {
          let paymentRequest = JSON.parse(message.value);

          if(paymentRequest.Payment.additionalDetails && paymentRequest.Payment.additionalDetails.isWhatsapp){

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
          let transactionRequest = JSON.parse(message.value);
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
    let payment = request.Payment;
  
    if(payment.additionalDetails && payment.additionalDetails.isWhatsapp){
      let tenantId = payment.tenantId;
      tenantId = tenantId.split(".")[0]; 

      let businessService = payment.paymentDetails[0].businessService;
      let key;
      if(businessService === 'TL')
        key = 'tradelicense-receipt';

      else if(businessService === 'PT')
        key = 'property-receipt';
      
      else if(businessService === 'WS' || businessService === 'SW')
        key = 'ws-onetime-receipt';

      else
        key = 'consolidatedreceipt';
   

      let pdfUrl = config.egovServices.externalHost + 'pdf-service/v1/_create';
      pdfUrl = pdfUrl + '?key='+key+ '&tenantId=' + tenantId;

      let requestBody = {
        RequestInfo: {
          authToken: request.RequestInfo.authToken
        },
        Payments:[]
      };
      requestBody.Payments.push(payment);

      let options = {
        method: 'POST',
        origin: '*',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
      let response = await fetch(pdfUrl, options);
      if(response.status == 201){
        let responseBody = await response.json();
        let user = {
          mobileNumber: payment.mobileNumber
        };
        let extraInfo = {
          whatsAppBusinessNumber: config.whatsAppBusinessNumber.slice(2),
          fileName: key
        };

        let messages = await this.prepareSucessMessage(payment,responseBody.filestoreIds[0]);
    
        await valueFirst.sendMessageToUser(user, messages,extraInfo);
      }
    }

  }

  async prepareSucessMessage(payment,filestoreId){
    let message=[];
    let locale = "en_IN";
    let template = dialog.get_message(messageBundle.paymentSucess,locale);
    template = template.replace('{{transaction_number}}',payment.transactionNumber);

    var content = {
      output:template,
      type: "text"
    };
    message.push(content);

    var pdfContent = {
      output: filestoreId,
      type: "pdf"
    };
    message.push(pdfContent);

    return message;
  }

  async prepareTransactionFailedMessage(request){
    let transactionNumber = request.Transaction.txnId;
    let consumerCode = request.Transaction.consumerCode;
    let tenantId = request.Transaction.tenantId;
    let businessService = request.Transaction.module;
    let link = await this.getPaymentLink(consumerCode,tenantId,businessService);

    let user = {
      mobileNumber: request.Transaction.user.mobileNumber
    };

    let extraInfo = {
      whatsAppBusinessNumber: config.whatsAppBusinessNumber.slice(2),
    };

    let message = [];
    let locale = "en_IN";
    let template = dialog.get_message(messageBundle.paymentFail,locale);
    template = template.replace('{{transaction_number}}',transactionNumber);
    template = template.replace('{{link}}',link);
    message.push(template);
    await valueFirst.sendMessageToUser(user, message,extraInfo);
  }

  async getShortenedURL(finalPath){
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
  
  async getPaymentLink(consumerCode,tenantId,businessService){
    var UIHost = config.egovServices.externalHost;
    var paymentPath = config.egovServices.msgpaylink;
    paymentPath = paymentPath.replace(/\$consumercode/g,consumerCode);
    paymentPath = paymentPath.replace(/\$tenantId/g,tenantId);
    paymentPath = paymentPath.replace(/\$businessservice/g,businessService);
    paymentPath = paymentPath.replace(/\$redirectNumber/g,"+"+config.whatsAppBusinessNumber);
    var finalPath = UIHost + paymentPath;
    var link = await this.getShortenedURL(finalPath);
    return link;
  }

}

let messageBundle = {
  paymentSucess:{
    en_IN: "Thank you😃! You have successfully paid your bill through mSeva Punjab. Your transaction number is {{transaction_number}}.\n\nPlease find attached receipt for your reference.\n"
  },
  paymentFail:{
    en_IN: "Sorry😥! The Payment Transaction has failed due to authentication failure. Your transaction reference number is {{transaction_number}}.\nIf the amount is debited from your account please give us 2-3 hours to get confirmation on payment.\nIf the amount is  not deducted from your account you can retry using the following payment link:\n{{link}}"
  }

};

let paymentStatusUpdateEvents = new PaymentStatusUpdateEventFormatter();

module.exports = paymentStatusUpdateEvents;
