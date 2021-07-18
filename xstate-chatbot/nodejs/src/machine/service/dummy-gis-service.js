const fetch = require('node-fetch');
const config = require('../../env-variables');

class GisService {
  async getGisDetailsFromMobileNumber(mobileNumber) {
    return {
      success: 1,
      message: '',
      response:
      {
        user_id: '1',
        mobile_no: '9876543210',
        role: 'surveyor',
        role_id: '0',
        ulb_id: '701',
        created_date: '2021-07-01 00:00:00',
        last_login: '2021-07-05 14:26:25',
        status: '1'
      }
    };
  }

  async getPropertyFromPropertyId(propertyId) {
    return {
      success: 1,
      message: '',
      response:
      {
        id: '65528',
        DateOfSurvey: '16-5-2017',
        OwnerName: 'SURAJSINGH',
        FatherName: 'MANGURAM',
        ContactNumber: '9815027233',
        TypeOfId: 'NA',
        IdNumber: 'NA',
        PID: '12663',
        OldHouseNo: '770-1',
        Sector: '4',
        WardNumber: '8',
        RoadOrStreet: 'KISHANPURAROAD',
        MohallaOrColony: 'NEW BALDEVNAGAR',
        NoOfFloors: 'G+1',
        LandUseDetail: 'COMMERCIAL-RESIDENTAL',
        LandUseCategory: 'SHOP-HOUSE',
        TypeOfProperty: 'PRIVATE',
        TypeOfConstruction: 'PUCCA',
        Since: '2013',
        TotalLandArea: '4.75MARLE K',
        AreaInSqft: 'NA',
        ConstructedArea: '983 SQ FT',
        ResidentialArea: '898 SQ FT',
        CommercialArea: '85 SQFT',
        IndustrialArea: 'NA',
        MobileTower: 'NO',
        WaterConnection: 'YES',
        Period: '2013',
        NoOfWaterConnection: '1',
        SewageConnection: 'YES',
        Period1: '2013',
        PropertyTax: 'NA',
        GroundWater: 'NO',
        RainWaterHarvesting: 'NO',
        TubeWell: 'NO',
        Remarks: '',
        SurveyerName: '',
        UID: 'S04-12663'
      }
    };
  }

  async addPropertyDetails(propertyDetails) {
    return { success: 1, message: '', response: '8' };
  }
  
  async updatePropertyDetails(propertyDetails) {
    return { success: 1, message: '', response: '2' };
  }

  async getFileForFileStoreId(filestoreId) {
    return null;

  }
}

module.exports = new GisService();