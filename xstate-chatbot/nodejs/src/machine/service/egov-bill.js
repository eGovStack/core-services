const config = require('../../env-variables');
const fetch = require("node-fetch");
const moment = require("moment-timezone");
class BillService {

  constructor() {
    this.services = [];
    let supportedModules = config.billSupportedModules.split(',');
    for(let module of supportedModules) {
      this.services.push(module.trim());
    }
  }

  getSupportedServicesAndMessageBundle() {
    let services = this.services;
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
      FIRENOC: {
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
        en_IN: 'Search 🔎 using Mobile No.📱'
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
    } else if(service === 'PT') {
      searchOptions = [ 'mobile', 'propertyId', 'consumerNumber' ];
    } else if(service === 'TL') {
      searchOptions = [ 'mobile', 'tlApplicationNumber' ];
    } else if(service === 'FIRENOC') {
      searchOptions = [ 'mobile', 'nocApplicationNumber' ];
    } else if(service === 'BPA') {
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

  validateParamInput(service, searchParamOption, paramInput) {
    var state=config.rootTenantId;
    state=state.toUpperCase();

    if(searchParamOption === 'mobile') {
      let regexp = new RegExp('^[0-9]{10}$');
      return regexp.test(paramInput);
    }

    if(searchParamOption === 'consumerNumber' || searchParamOption === 'propertyId' || searchParamOption === 'connectionNumber'){
        if(service === 'PT'){
          let regexp = new RegExp(state+'-PT-\\d{4}-\\d{2}-\\d{2}-\\d+$');
          return regexp.test(paramInput);
        }
        if(service === 'WS'){
          //todo
          let regexp = new RegExp('WS/\\d{3}/\\d{4}-\\d{2}/\\d+$');
          return regexp.test(paramInput);
        }
    }
    

    if(searchParamOption === 'tlApplicationNumber'){
        let regexp = new RegExp(state+'-TL-\\d{4}-\\d{2}-\\d{2}-\\d+$');
        return regexp.test(paramInput);
    }

    if(searchParamOption === 'nocApplicationNumber'){
      let regexp = new RegExp(state+'-FN-\\d{4}-\\d{2}-\\d{2}-\\d+$');
      return regexp.test(paramInput);
    }

    if(searchParamOption === 'bpaApplicationNumber'){
      let regexp = new RegExp(state+'-BP-\\d{4}-\\d{2}-\\d{2}-\\d+$');
      return regexp.test(paramInput);
    }
    return true;
  }


  async prepareBillResult(responseBody){
    let results=responseBody.Bill;
    let billLimit = config.billSearchLimit;

    if(results.length < billLimit)
      billLimit = results.length;

    var Bills = {};
    Bills['Bills'] = [];
    var count =0;

    let self = this;
    for(let result of results){
      if(result.status=='ACTIVE' && result.totalAmount!=0 && count<billLimit){
        let dueDate = moment(result.billDetails[result.billDetails.length-1].expiryDate).tz(config.timeZone).format(config.dateFormat);
        let fromMonth = new Date(result.billDetails[result.billDetails.length-1].fromPeriod).toLocaleString('en-IN', { month: 'short' });
        let toMonth = new Date(result.billDetails[result.billDetails.length-1].toPeriod).toLocaleDateString('en-IN', { month: 'short' });
        let fromBillYear = new Date(result.billDetails[result.billDetails.length-1].fromPeriod).getFullYear();
        let toBillYear = new Date(result.billDetails[result.billDetails.length-1].toPeriod).getFullYear();
        let billPeriod = fromMonth+" "+fromBillYear+"-"+toMonth+" "+toBillYear;
        let tenantId= result.tenantId;
        let link = await self.getPaymentLink(result.consumerCode,tenantId,result.businessService);
        
        var data={
          service: result.businessService,
          id: result.consumerCode,
          secondaryInfo: 'Ajit Nagar,  Phagwara', //to do
          dueAmount: result.totalAmount,
          dueDate: dueDate,
          period: billPeriod,
          paymentLink: link
        }
        Bills['Bills'].push(data);
        count = count + 1;
      } 
  }

  return Bills['Bills'];  
  }

  async searchBillsForUser(user, locale) {

    let requestBody = {
      RequestInfo: {
        authToken: user.authToken
      }
    };

    let billUrl = config.externalHost + config.billServiceSearchPath;
    billUrl = billUrl + '?tenantId=' + config.rootTenantId;
    

    if(user.hasOwnProperty('paramOption') && (user.paramOption!=null) ){
      if(user.paramOption=='mobile')
        billUrl +='&mobileNumber='+user.paramInput;

      if(user.paramOption=='consumerNumber' || user.paramOption == 'tlApplicationNumber' || user.paramOption == 'nocApplicationNumber'
      || user.paramOption=='bpaApplicationNumber' || user.paramOption=='connectionNumber' || user.paramOption=='propertyId')
        billUrl +='&consumerCode='+user.paramInput;

      billUrl +='&businessService='+user.service;
    }
    else{
      billUrl+='&';
      billUrl +='mobileNumber='+user.mobileNumber;
    }

    let options = {
      method: 'POST',
      origin: '*',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    }
    
    let response = await fetch(billUrl, options);
    let results,totalBillSize=0,pendingBillSize=0;

    if(response.status === 201) {
      let responseBody = await response.json();
      results=await this.prepareBillResult(responseBody);
      totalBillSize=responseBody.Bill.length;
      pendingBillSize=results.length;
      
    } 
    /*else {
      console.error('Error in fetching the bill');
      return undefined;
    }*/
    
    if(totalBillSize==0){
      return {                        
        totalBills: 0,             // mobile number not linked with any bills
        pendingBills: undefined
      }
    }
    else if(pendingBillSize==0){
      return {
        totalBills: 2,              // No pending, but previous bills do exist
        pendingBills: undefined     // This is so that user doesn't get message saying 'your mobile number is not linked', but rather a message saying 'No pending dues'
      } 
    }
    else{
      return {
        pendingBills: results,      // Pending bills exist
        totalBills: pendingBillSize
      }
    }


  }

  async fetchBillsForUser(user,service,locale){
    let billSupportedBussinessService;

    if(service){
      if(service === 'WS')
      billSupportedBussinessService = ['WS','SW'];
      if(service === 'BPA')
        billSupportedBussinessService = ['BPA.LOW_RISK_PERMIT_FEE', 'BPA.NC_APP_FEE', 'BPA.NC_SAN_FEE', 'BPA.NC_OC_APP_FEE', 'BPA.NC_OC_SAN_FEE'];
    }
    else
      billSupportedBussinessService = ['WS','SW', 'PT', 'TL', 'FIRENOC', 'BPA.LOW_RISK_PERMIT_FEE', 'BPA.NC_APP_FEE', 'BPA.NC_SAN_FEE', 'BPA.NC_OC_APP_FEE', 'BPA.NC_OC_SAN_FEE'];

    let billResults={
        pendingBills:[],
        totalBills:0
    };

    let self = this;

    for(let service of billSupportedBussinessService){
      user.service = service;

      if(!user.hasOwnProperty('paramOption') || (user.paramOption==null) ){
        user.paramOption = 'mobile';
        user.paramInput = user.mobileNumber;
      }
      let results = await self.searchBillsForUser(user);
      if(results.totalBills !=0 && results.pendingBills){
        billResults.pendingBills = billResults.pendingBills.concat(results.pendingBills);
        billResults.totalBills = billResults.totalBills + results.totalBills;
      }
    }  
    
    if(billResults.totalBills === 0 ||  billResults.pendingBills.length === 0){
      return {                        
        totalBills: 0,
        pendingBills: undefined
      }
      
    }

    let finalResult = [];
    let billLimit = config.billSearchLimit;

    if(billResults.pendingBills.length < billLimit)
      billLimit = billResults.pendingBills.length;

    for(var i=0; i<billLimit; i++)
      finalResult = finalResult.concat(billResults.pendingBills[i]); 


      return {
        pendingBills: finalResult,      // Pending bills exist
        totalBills: billLimit
      }
  }

  async fetchBillsForParam(user, service, paramOption, paramInput) {
      user.service=service;
      user.paramOption=paramOption;
      user.paramInput=paramInput;

      let billsForUser;
      if(service === 'WS' || service === 'BPA')
        billsForUser = await this.fetchBillsForUser(user,service);
      else
        billsForUser = await this.searchBillsForUser(user);

      return billsForUser.pendingBills;
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

  async getPaymentLink(consumerCode,tenantId,businessService)
  {
    var UIHost = config.externalHost;
    var paymentPath = config.msgpaylink;
    paymentPath = paymentPath.replace(/\$consumercode/g,consumerCode);
    paymentPath = paymentPath.replace(/\$tenantId/g,tenantId);
    paymentPath = paymentPath.replace(/\$businessservice/g,businessService);
    paymentPath = paymentPath.replace(/\$redirectNumber/g,"+"+config.whatsAppBusinessNumber);
    var finalPath = UIHost + paymentPath;
    var link = await this.getShortenedURL(finalPath);
    return link;
  }

}
module.exports = new BillService();
