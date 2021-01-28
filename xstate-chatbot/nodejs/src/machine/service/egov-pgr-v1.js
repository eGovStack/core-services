const fetch = require("node-fetch");
const config = require('../../env-variables');
const getCityAndLocality = require('./util/google-maps-util');
const localisationService = require('../util/localisation-service');
const urlencode = require('urlencode');
const dialog = require('../util/dialog');
const moment = require("moment-timezone");


class PGRService {

  async fetchMdmsData(tenantId, moduleName, masterName, filterPath) {
    var url = config.egovServices.egovServicesHost + config.egovServices.mdmsSearchPath;
    var request = {
      "RequestInfo": {},
      "MdmsCriteria": {
        "tenantId": tenantId,
        "moduleDetails": [
          {
            "moduleName": moduleName,
            "masterDetails": [
              {
                "name": masterName,
                "filter": filterPath
              }
            ]
          }
        ]
      }
    };
  
    var options = {
      method: 'POST',
      body: JSON.stringify(request),
      headers: {
          'Content-Type': 'application/json'
      }
    }
  
    let response = await fetch(url, options);
    let data = await response.json()
  
    return data["MdmsRes"][moduleName][masterName];
  }
  
  async fetchFrequentComplaints(tenantId) {
    let complaintTypes = await this.fetchMdmsData(tenantId, "RAINMAKER-PGR", "ServiceDefs", "$.[?(@.order && @.active == true)].serviceCode");
    let localisationPrefix = 'SERVICEDEFS.';
    let messageBundle = {};
    for(let complaintType of complaintTypes) {
      let message = localisationService.getMessageBundleForCode(localisationPrefix + complaintType.toUpperCase());
      messageBundle[complaintType] = message;
    }
    return {complaintTypes, messageBundle};
  }
  async fetchComplaintCategories(tenantId) {
    let complaintCategories = await this.fetchMdmsData(tenantId, "RAINMAKER-PGR", "ServiceDefs", "$.[?(@.active == true)].menuPath");
    complaintCategories = [...new Set(complaintCategories)];
    complaintCategories = complaintCategories.filter(complaintCategory => complaintCategory != "");   // To remove any empty category
    let localisationPrefix = 'SERVICEDEFS.';
    let messageBundle = {};
    for(let complaintCategory of complaintCategories) {
      let message = localisationService.getMessageBundleForCode(localisationPrefix + complaintCategory.toUpperCase());
      messageBundle[complaintCategory] = message;
    }
    return { complaintCategories, messageBundle };
  }
  async fetchComplaintItemsForCategory(category, tenantId) {
    let complaintItems = await this.fetchMdmsData(tenantId, "RAINMAKER-PGR", "ServiceDefs", "$.[?(@.active == true && @.menuPath == \"" + category + "\")].serviceCode");
    let localisationPrefix = 'SERVICEDEFS.';
    let messageBundle = {};
    for(let complaintItem of complaintItems) {
      let message = localisationService.getMessageBundleForCode(localisationPrefix + complaintItem.toUpperCase());
      messageBundle[complaintItem] = message;
    }
    return { complaintItems, messageBundle };
  }

  async getCityAndLocalityForGeocode(geocode, tenantId) {
    let latlng = geocode.substring(1, geocode.length - 1); // Remove braces
    let cityAndLocality = await getCityAndLocality(latlng);
    let { cities, messageBundle } = await this.fetchCities(tenantId);
    let matchedCity = null;
    let matchedCityMessageBundle = null;
    for(let city of cities) {
      let cityName = messageBundle[city]['en_IN'];
      if(cityName.toLowerCase() == cityAndLocality.city.toLowerCase()) {
        matchedCity = city;
        matchedCityMessageBundle = messageBundle[city];
        break;
      }
    }
    if(matchedCity) {
      let matchedLocality = null;
      let matchedLocalityMessageBundle = null;  
      let { localities, messageBundle } = await this.fetchLocalities(matchedCity);
      for(let locality of localities) {
        let localityName = messageBundle[locality]['en_IN'];
        if(localityName.toLowerCase() == cityAndLocality.locality.toLowerCase()) {
          matchedLocality = locality;
          matchedLocalityMessageBundle = messageBundle[locality];
          return {
            city: matchedCity,
            locality: matchedLocality,
            matchedCityMessageBundle: matchedCityMessageBundle,
            matchedLocalityMessageBundle: matchedLocalityMessageBundle
          };
        }
      }
      // Matched City found but no matching locality found
      return {
        city: matchedCity,
        matchedCityMessageBundle: matchedCityMessageBundle
      }
    } 
    return undefined;    // No matching city found
  }

  async fetchCitiesAndWebpageLink(tenantId,whatsAppBusinessNumber)
  {
    let {cities,messageBundle} = await this.fetchCities(tenantId);
    let link = await this.getCityExternalWebpageLink(tenantId,whatsAppBusinessNumber);
    return {cities,messageBundle,link};
  }

  async fetchCities(tenantId){
    let cities = await this.fetchMdmsData(tenantId, "tenant", "citymodule", "$.[?(@.module=='PGR.WHATSAPP')].tenants.*.code");
    let messageBundle = {};
    for(let city of cities) {
      let message = localisationService.getMessageBundleForCode(city);
      messageBundle[city] = message;
    }
    return {cities, messageBundle};
  }

  async getCityExternalWebpageLink(tenantId, whatsAppBusinessNumber) {
    var url = config.egovServices.externalHost + config.egovServices.cityExternalWebpagePath + '?tenantId=' + tenantId + '&phone=+91' + whatsAppBusinessNumber;
    var shorturl = await this.getShortenedURL(url);
    return shorturl;
  }

  async fetchLocalitiesAndWebpageLink(tenantId,whatsAppBusinessNumber)
  {
    let {localities,messageBundle} = await this.fetchLocalities(tenantId);
    let link = await this.getLocalityExternalWebpageLink(tenantId,whatsAppBusinessNumber);
    return {localities,messageBundle,link};
  }

  async getLocalityExternalWebpageLink(tenantId, whatsAppBusinessNumber) {
    var url = config.egovServices.externalHost + config.egovServices.localityExternalWebpagePath + '?tenantId=' + tenantId + '&phone=+91' + whatsAppBusinessNumber;
    var shorturl = await this.getShortenedURL(url);
    return shorturl;
  }

  async fetchLocalities(tenantId) {
    let moduleName = 'egov-location';
    let masterName = 'TenantBoundary';
    let filterPath = '$.[?(@.hierarchyType.code=="ADMIN")].boundary.children.*.children.*.children.*';

    let boundaryData = await this.fetchMdmsData(tenantId, moduleName, masterName, filterPath);
    let localities = [];
    for(let i = 0; i < boundaryData.length; i++) {
      localities.push(boundaryData[i].code);
    }
    let localitiesLocalisationCodes = [];
    for(let locality of localities) {
      let localisationCode = tenantId.replace('.', '_').toUpperCase() + '_ADMIN_' + locality;
      localitiesLocalisationCodes.push(localisationCode);
    }
    let localisedMessages = await localisationService.getMessagesForCodesAndTenantId(localitiesLocalisationCodes, tenantId);
    let messageBundle = {};
    for(let locality of localities) {
      let localisationCode = tenantId.replace('.', '_').toUpperCase() + '_ADMIN_' + locality;
      messageBundle[locality] = localisedMessages[localisationCode]
    }
    return { localities, messageBundle };
  }

  async preparePGRResult(responseBody,locale){
    let serviceWrappers = responseBody.serviceWrappers;
    var results = {};
    results['ServiceWrappers'] = [];
    let localisationPrefix = 'SERVICEDEFS';

    let complaintLimit = config.pgrUseCase.complaintSearchLimit;

    if(serviceWrappers.length < complaintLimit)
        complaintLimit = serviceWrappers.length;
    var count =0;

    for(let serviceWrapper of serviceWrappers){
      if(count<complaintLimit){
        let mobileNumber = serviceWrapper.services.citizen.mobileNumber;
        let serviceRequestId = serviceWrapper.services.serviceRequestId;
        let complaintURL = await this.makeCitizenURLForComplaint(serviceRequestId,mobileNumber);
        let serviceCode = localisationService.getMessageBundleForCode(localisationPrefix + serviceWrapper.service.serviceCode.toUpperCase());
        let filedDate = serviceWrapper.services.auditDetails.createdTime;
        filedDate = moment(filedDate).tz(config.timeZone).format(config.dateFormat);
        let applicationStatus = localisationService.getMessageBundleForCode( serviceWrapper.service.applicationStatus);
        var data ={
          complaintType: dialog.get_message(serviceCode,locale),
          complaintNumber: serviceRequestId,
          filedDate: filedDate,
          complaintStatus: dialog.get_message(applicationStatus,locale),
          complaintLink: complaintURL
        }
        count ++;
        results['ServiceWrappers'].push(data);
      }
      else{
        break;
      }
      return results['ServiceWrappers'];
    }
  }

  async persistComplaint(user,slots,extraInfo) {
    let requestBody = JSON.parse(pgrv1CreateRequestBody);

    let authToken = user.authToken;
    let mobileNumber = user.mobileNumber;
    let userId = user.userId;
    let complaintType = slots.complaintType;
    let locality = slots.locality;
    let city = slots.city;

    requestBody["RequestInfo"]["authToken"] = authToken;
    requestBody["services"]["addressDetail"]["city"] = city;
    requestBody["services"]["serviceCode"] = complaintType;
    requestBody["services"]["addressDetail"]["locality"] = locality;

    var url = config.egovServices.egovServicesHost+config.egovServices.pgrCreateEndpoint;

    var options = {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
          'Content-Type': 'application/json'
      }
    }

    let response = await fetch(url, options);


    let results;
    if(response.status === 200) {
      let responseBody = await response.json();
      results = await this.preparePGRResult(responseBody,user.locale);
    } else {
      console.error('Error in fetching the bill');
      return undefined;
    }
    return results[0];
  }

  async fetchOpenComplaints(user){
    let requestBody={
      RequestInfo:{
        authToken: user.authToken
      }
    };

    var url = config.egovServices.egovServicesHost + config.egovServices.pgrSearchEndpoint;
    url = url + '?tenantId' + config.rootTenantId;
    url += '&' ;
    url +=  'mobileNumber=' + user.mobileNumber;

    let options = {
      method: 'POST',
      origin: '*',
      headers:{
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    }
    let response = await fetch(url,options);
    let results;
    if(response.status==200)
    {
      let responseBody = await response.json();
      results = await this.preparePGRResult(responseBody,user.locale);
    }
    else
    {
      console.error('Error in fetching bills');
      return undefined;
    }
    return results;
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


  async makeCitizenURLForComplaint(serviceRequestId, mobileNumber){
    let encodedPath = urlencode(serviceRequestId, 'utf8');
    //change the below url as per the PGR-V1 complaint page. Contact frontend developer 
    let url = config.egovServices.externalHost + "citizen/otpLogin?mobileNo=" + mobileNumber + "&redirectTo=digit-ui/citizen/pgr/complaints/" + encodedPath;
    let shortURL = await this.getShortenedURL(url);
    return shortURL;
  }

  
}

module.exports = new PGRService();
