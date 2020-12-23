const fetch = require("node-fetch");
const config = require('../../env-variables');
const getCityAndLocality = require('./util/google-maps-util');
const localisationService = require('../util/localisation-service');

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
  
  async fetchFrequentComplaints() {
    let complaintTypes = await this.fetchMdmsData(config.rootTenantId, "RAINMAKER-PGR", "ServiceDefs", "$.[?(@.order && @.active == true)].serviceCode");
    let localisationPrefix = 'SERVICEDEFS.';
    let messageBundle = {};
    for(let complaintType of complaintTypes) {
      let message = localisationService.getMessageBundleForCode(localisationPrefix + complaintType.toUpperCase());
      messageBundle[complaintType] = message;
    }
    return {complaintTypes, messageBundle};
  }
  async fetchComplaintCategories() {
    let complaintCategories = await this.fetchMdmsData(config.rootTenantId, "RAINMAKER-PGR", "ServiceDefs", "$.[?(@.active == true)].menuPath");
    complaintCategories = [...new Set(complaintCategories)];
    let localisationPrefix = 'SERVICEDEFS.';
    let messageBundle = {};
    for(let complaintCategory of complaintCategories) {
      let message = localisationService.getMessageBundleForCode(localisationPrefix + complaintCategory.toUpperCase());
      messageBundle[complaintCategory] = message;
    }
    return { complaintCategories, messageBundle };
  }
  async fetchComplaintItemsForCategory(category) {
    let complaintItems = await this.fetchMdmsData(config.rootTenantId, "RAINMAKER-PGR", "ServiceDefs", "$.[?(@.active == true && @.menuPath == \"" + category + "\")].serviceCode");
    let localisationPrefix = 'SERVICEDEFS.';
    let messageBundle = {};
    for(let complaintItem of complaintItems) {
      let message = localisationService.getMessageBundleForCode(localisationPrefix + complaintItem.toUpperCase());
      messageBundle[complaintItem] = message;
    }
    return { complaintItems, messageBundle };
  }

  async getCityAndLocalityForGeocode(geocode) {
    let latlng = geocode.substring(1, geocode.length - 1); // Remove braces
    let cityAndLocality = await getCityAndLocality(latlng);
    return cityAndLocality;
  }

  async fetchCities(){
    let cities = await this.fetchMdmsData(config.rootTenantId, "tenant", "citymodule", "$.[?(@.module=='PGR.WHATSAPP')].tenants.*.code");
    let messageBundle = {};
    for(let city of cities) {
      let message = localisationService.getMessageBundleForCode(city);
      messageBundle[city] = message;
    }
    return {cities, messageBundle};
  }

  getCityExternalWebpageLink() {
    return config.externalHost + config.cityExternalWebpagePath + '?tenantId=' + config.rootTenantId + '&phone=' + config.whatsAppBusinessNumber;
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
    console.log(localisedMessages);
    let messageBundle = {};
    for(let locality of localities) {
      let localisationCode = tenantId.replace('.', '_').toUpperCase() + '_ADMIN_' + locality;
      messageBundle[locality] = localisedMessages[localisationCode]
    }
    console.log(messageBundle);
    return { localities, messageBundle };
  }

  getLocalityExternalWebpageLink(tenantId) {
    return config.externalHost + config.localityExternalWebpagePath + '?tenantId=' + tenantId + '&phone=' + config.whatsAppBusinessNumber;
  }

  async persistComplaint(slots) {
    
  }
  
}

module.exports = new PGRService();