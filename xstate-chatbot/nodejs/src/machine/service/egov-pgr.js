const fetch = require("node-fetch");
const config = require('../../env-variables');
const getCityAndLocality = require('./util/google-maps-util');
const localisationService = require('../util/localisation-service');

let pgrCreateRequestBody = "{\"RequestInfo\":{\"authToken\":\"\",\"userInfo\":{}},\"service\":{\"tenantId\":\"\",\"serviceCode\":\"\",\"description\":\"\",\"accountId\":\"\",\"source\":\"whatsapp\",\"address\":{\"landmark\":\"\",\"city\":\"\",\"geoLocation\":{},\"locality\":{\"code\":\"\"}}},\"workflow\":{\"action\":\"APPLY\",\"verificationDocuments\":[]}}";

class PGRService {

  async fetchMdmsData(tenantId, moduleName, masterName, filterPath) {
    var mdmsHost = config.mdmsHost;
    var url = mdmsHost + 'egov-mdms-service/v1/_search';
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
    return cityAndLocality;
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

  getCityExternalWebpageLink(tenantId, whatsAppBusinessNumber) {
    return config.externalHost + config.cityExternalWebpagePath + '?tenantId=' + tenantId + '&phone=' + whatsAppBusinessNumber;
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

  getLocalityExternalWebpageLink(tenantId, whatsAppBusinessNumber) {
    return config.externalHost + config.localityExternalWebpagePath + '?tenantId=' + tenantId + '&phone=' + whatsAppBusinessNumber;
  }

  async persistComplaint(user,slots,extraInfo) {
    let requestBody = JSON.parse(pgrCreateRequestBody);

    let authToken = user.authToken;
    let mobileNumber = user.mobileNumber;
    let userId = user.userId;
    let complaintType = slots.complaint;
    let locality = slots.locality;
    let city = slots.city;
    let userInfo = user.userInfo;

    requestBody["RequestInfo"]["authToken"] = authToken;
    requestBody["RequestInfo"]["userInfo"] = userInfo;
    requestBody["service"]["tenantId"] = city;
    requestBody["service"]["address"]["city"] = city;
    requestBody["service"]["address"]["locality"]["code"] = locality;
    requestBody["service"]["serviceCode"] = complaintType;
    requestBody["service"]["accountId"] = userId;

    var url = config.pgrServiceHost+config.pgrCreateEndpoint;

    var options = {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
          'Content-Type': 'application/json'
      }
    }

    let response = await fetch(url, options);
    let data = await response.json();

    return data;
  }
  
}

module.exports = new PGRService();