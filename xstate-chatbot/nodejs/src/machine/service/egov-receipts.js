const config = require('../../env-variables');
const fetch = require("node-fetch");
const moment = require("moment-timezone");

class ReceiptService {

    getSupportedServicesAndMessageBundle() {
        let services = [ 'WS', 'PT', 'TL', 'FNOC', 'BPA' ];
        let messageBundle = {
          WS: {
            en_IN: 'Water and Sewerage Bill'
          },
          PT: {
            en_IN: 'Property Tax'
          },
          TL: {
            en_IN: 'Trade License Fees'
          },
          FNOC: {
            en_IN: 'Fire NOC Fees'
          },
          BPA: {
            en_IN: 'Building Plan Scrutiny Fees'
          }
        }
    
        return { services, messageBundle };
    }
    getSearchOptionsAndMessageBundleForService(service) {
        let messageBundle = {
          mobile: {
            en_IN: 'Search 🔎 using another Mobile No.📱'
          },
          connectionNumber: {
            en_IN: 'Search 🔎 using Connection No.'
          },
          consumerNumber: {
            en_IN: 'Search 🔎 using Consumer Number'
          },
          propertyId: {
            en_IN: 'Search 🔎 using Property ID'
          },
          tlApplicationNumber: {
            en_IN: 'Search 🔎 using Trade License Application Number'
          },
          nocApplicationNumber: {
            en_IN: 'Search 🔎 using NOC Application Number'
          },
          bpaApplicationNumber: {
            en_IN: 'Search 🔎 using BPA Application Number'
          }
        }
        let searchOptions = [];
        if(service === 'WS') {
          searchOptions = [ 'mobile', 'connectionNumber', 'consumerNumber' ];
        }
        else if(service === 'PT') {
          searchOptions = [ 'mobile', 'propertyId', 'consumerNumber' ];
        } 
        else if(service === 'TL') {
          searchOptions = [ 'mobile', 'tlApplicationNumber' ];
        } 
        else if(service === 'FNOC') {
          searchOptions = [ 'mobile', 'nocApplicationNumber' ];
        } 
        else if(service === 'BPA') {
          searchOptions = [ 'mobile', 'bpaApplicationNumber' ];
        }
        return { searchOptions, messageBundle };
    }
    getOptionAndExampleMessageBundle(service, searchParamOption) {
      let option,example;

      if(searchParamOption === 'mobile'){
        option = {
          en_IN: 'Mobile Number'
        };
        example = {
          en_IN: 'Do not use +91 or 0 before mobile number.'
        }
      }
  
      if(searchParamOption === 'consumerNumber'){
        option = {
          en_IN: 'Consumer Number'
        };
        example = {
          en_IN: ' '
        }
      }
  
      if(searchParamOption === 'connectionNumber'){
        option = {
          en_IN: 'Connection Number'
        };
        example = {
         en_IN: ' '
        }
      }
  
      if(searchParamOption === 'propertyId'){
        option = {
          en_IN: 'Property ID'
        };
        example = {
         en_IN: ' '
        }
      }
  
      if(searchParamOption === 'tlApplicationNumber'){
        option = {
          en_IN: 'Trade License Application Number'
        };
        example = {
         en_IN: ' '
        }
      }
  
      if(searchParamOption === 'nocApplicationNumber'){
        option = {
          en_IN: 'Fire Noc Application Number'
        };
        example = {
         en_IN: ' '
        }
      }
  
      if(searchParamOption === 'bpaApplicationNumber'){
        option = {
          en_IN: 'BPA Application Number'
        };
        example = {
         en_IN: ' '
        }
      }
  
      
      return { option, example };
    }
    validateparamInput(service, searchParamOption, paramInput) {
        if(searchParamOption === 'mobile') {
          let regexp = new RegExp('^[0-9]{10}$');
          return regexp.test(paramInput)
        }
        return true;
    }    

    async preparePaymentResult(responseBody,isMultipleRecords){
      let results=responseBody.Payments;
      let receiptLimit = config.receiptSearchLimit;

      if(results.length < receiptLimit)
        receiptLimit = results.length;
      
      var Payments = {};
      Payments['Payments'] = [];
      var count =0;
      var lookup=[];

      let self = this;
      for(let result of results) {
        if(count<receiptLimit && (!lookup.includes(result.paymentDetails[0].bill.consumerCode) || isMultipleRecords)){
          var transactionDate = moment(result.transactionDate).tz(config.timeZone).format(config.dateFormat);
          var consumerCode = result.paymentDetails[0].bill.consumerCode;
          var tenantId= result.tenantId;
          var receiptNumber = result.paymentDetails[0].receiptNumber;
          var businessService = result.paymentDetails[0].businessService;
          var mobileNumber = result.mobileNumber;
          var data={
            service: businessService,
            id: consumerCode,
            locality: 'Ajit Nagar', //to do
            city: 'Phagwara', //to do
            amount: result.totalDue,
            date: transactionDate,
            transactionNumber: result.transactionNumber,
            receiptDocumentLink: await this.receiptDownloadLink(consumerCode,tenantId,receiptNumber,businessService,mobileNumber)
          }
          Payments['Payments'].push(data);
          lookup.push(consumerCode);
          count=count+1;
        }
      }
      
      return Payments['Payments'];
      
    }

    async findreceipts(user,service){ 
      let requestBody = {
        RequestInfo: {
          authToken: user.authToken
        }
      };
       var searchEndpoint = config.collectonServicSearchEndpoint;
       searchEndpoint= searchEndpoint.replace(/\$module/g,service);
      let paymentUrl = config.externalHost + searchEndpoint;
      paymentUrl =  paymentUrl + '?tenantId=' + config.rootTenantId;
      
      if(user.hasOwnProperty('paramOption') && (user.paramOption!=null) ){
        
        if(user.paramOption=='mobile')
        paymentUrl +='&mobileNumber='+user.paramInput;

        if(user.paramOption=='consumerNumber' || user.paramOption == 'tlApplicationNumber' || user.paramOption == 'nocApplicationNumber'
          || user.paramOption=='bpaApplicationNumber' || user.paramOption=='connectionNumber' || user.paramOption=='propertyId')
              paymentUrl +='&consumerCodes='+user.paramInput;
      }
      else{
        paymentUrl+='&';
        paymentUrl +='mobileNumber='+user.mobileNumber;
      }

      let options = {
        method: 'POST',
        origin: '*',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }

      let response = await fetch(paymentUrl,options);
      let results;
      if(response.status === 200) {
        let responseBody = await response.json();
        results=await this.preparePaymentResult(responseBody,false);
      } else {
        console.error('Error in fetching the bill');
        return undefined;
      }

      return results;
    }

    async fetchReceiptsForParam(user, service, searchParamOption, paraminput) {
        if(searchParamOption)
          user.paramOption=searchParamOption;
        if(paraminput)  
          user.paramInput=paraminput;
        return await this.findreceipts(user,service);
    }

    async multipleRecordReceipt(user,service,consumerCodes){ 
      
      let requestBody = {
        RequestInfo: {
          authToken: user.authToken
        }
      };

      var searchEndpoint = config.collectonServicSearchEndpoint;
      searchEndpoint= searchEndpoint.replace(/\$module/g,service);
      let paymentUrl = config.collectonServiceHost + searchEndpoint;
      paymentUrl =  paymentUrl + '?tenantId=' + config.rootTenantId;
      paymentUrl+='&';
      paymentUrl +='consumerCodes='+consumerCodes;

      let options = {
        method: 'POST',
        origin: '*',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }

      let response = await fetch(paymentUrl,options);
      let results;
      if(response.status === 200) {
        let responseBody = await response.json();
        results=await this.preparePaymentResult(responseBody,true);
      } else {
        console.error('Error in fetching the bill');
        return undefined;
      }

      return results;
      
    }

    async getShortenedURL(finalPath)
    {
      var urlshortnerHost = config.externalHost;
      var url = urlshortnerHost + 'egov-url-shortening/shortener';
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

    async receiptDownloadLink(consumerCode,tenantId,receiptNumber,businessService,mobileNumber)
    {
      var UIHost = config.externalHost;
      var paymentPath = config.receiptdownladlink;
      paymentPath = paymentPath.replace(/\$consumercode/g,consumerCode);
      paymentPath = paymentPath.replace(/\$tenantId/g,tenantId);
      paymentPath = paymentPath.replace(/\$receiptnumber/g,receiptNumber)
      paymentPath = paymentPath.replace(/\$businessservice/g,businessService);
      paymentPath = paymentPath.replace(/\$mobilenumber/g,mobileNumber);
      var finalPath = UIHost + paymentPath;
      var link = await this.getShortenedURL(finalPath);
      return link;
    }

  }
module.exports = new ReceiptService();