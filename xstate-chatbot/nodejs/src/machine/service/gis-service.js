const fetch = require('node-fetch');
const config = require('../../env-variables');
const FormData = require('form-data');

class GisService {

  async getGisDetailsFromMobileNumber(mobileNumber) {
    const url = config.covaApiConfigs.getGISByMobileNumber;
    var formdata = new FormData();
    formdata.append("mobile_no", mobileNumber);

    var requestOptions = {
      method: 'POST',
      body: formdata,
      redirect: 'follow'
    };

    const response = await fetch(url, requestOptions);
    if (response.status == 200) {
      const data = await response.json();
      if (data.success == 1) {
        console.log('GIS Validation data through Mobile Number.');
      } else {
        console.error(`Error while fetching GIS Validation data through Mobile Number.\nStatus: ${data.success}; Response: ${JSON.stringify(data.message)}`);
      }
      return data;
    } else {
      const responseBody = await response.json();
      console.error(`Error while fetching GIS Validation data .\nStatus: ${data.success}; Response: ${JSON.stringify(data.message)}`);
    }
  }

  async getPropertyFromPropertyId(propertyId) {

    const url = config.covaApiConfigs.getPropertyByPropertId;
    const formdata = new FormData();
    formdata.append('UID', propertyId.toString());

    const requestOptions = {
      method: 'POST',
      body: formdata,
      redirect: 'follow',
    };

    const response = await fetch(url, requestOptions);

    if (response.status == 200) {
      const data = await response.json();

      if (data.success == 1) {
        console.log(`Property Details fetched succesfully : ${data.message}`);
        return data;
      }
      console.log(`Property Details fetched failure : ${data.message}`);
      return data;
    } else {
      const responseBody = await response.json();
      console.error(`Property Details fetched API responded with ${JSON.stringify(responseBody)}`);
    }
  }

  async addPropertyDetails(propertyDetails) {
    console.log(propertyDetails)
    const url = config.covaApiConfigs.addedNewProperty;
    const formdata = new FormData();
    formdata.append('UserId', propertyDetails.user_id);
    formdata.append('ParcelID', propertyDetails.tempId);
    formdata.append('OldHouseNo', propertyDetails.houseNo);
    formdata.append('BlockNo', propertyDetails.blockNo);
    formdata.append('ContactNo', propertyDetails.contactNo);
    formdata.append('PropertyUse', propertyDetails.typeOfProperty);
    formdata.append('NoOfFloors', propertyDetails.noOfFloors);
    formdata.append('WaterConnection', propertyDetails.waterConnection);
    formdata.append('SewerageConnection', propertyDetails.sewageConnection);
    formdata.append('PropertyTax', propertyDetails.propertyId);
    formdata.append('OwnersName', propertyDetails.ownerName);

    if(propertyDetails.image){
      let filestoreId = await this.getFileForFileStoreId(propertyDetails.image);
      var content = {
        documentType: "PHOTO",
        filestoreId:filestoreId
      };
      formdata.append('image', content);
    }
    console.log(formdata)
    
    const requestOptions = {
      method: 'POST',
      body: formdata,
      redirect: 'follow',
    };

    const response = await fetch(url, requestOptions);

    if (response.status == 200) {
      const data = await response.json();

      if (data.success == 1) {
        console.log(`New Property added succesfully in property database : ${data.message}`);
        return data;
      }
      console.log(`New Property addition failure : ${data.message}`);
      return data;
    } else {
      const responseBody = await response.json();
      console.error(`API responded with ${JSON.stringify(responseBody)}`);
    }
  }

  async updatePropertyDetails(propertyDetails) {

    const url = config.covaApiConfigs.updateNewProperty;
    const formdata = new FormData();
    console.log(propertyDetails)
    formdata.append('UID', propertyDetails.UID);
    formdata.append('UserId', propertyDetails.user_id);
    formdata.append('ParcelID', propertyDetails.user_id);
    formdata.append('OldHouseNo', propertyDetails.OldHouseNo);
    formdata.append('BlockNo', propertyDetails.blockNo);
    formdata.append('ContactNo', propertyDetails.contactNo);
    formdata.append('PropertyUse', propertyDetails.typeOfProperty);
    formdata.append('NoOfFloors', propertyDetails.noOfFloors);
    formdata.append('WaterConnection', propertyDetails.waterConnection);
    formdata.append('SewerageConnection', propertyDetails.sewageConnection);
    formdata.append('PropertyTax', propertyDetails.propertyTax);
    formdata.append('OwnersName', propertyDetails.ownerName);
    formdata.append('add_id', propertyDetails.user_id);

    const requestOptions = {
      method: 'POST',
      body: formdata,
      redirect: 'follow',
    };

    const response = await fetch(url, requestOptions);

    if (response.status == 200) {
      const data = await response.json();

      if (data.success == 1) {
        console.log(`Property update succesfully in property database : ${data.message}`);
        return data;
      }
      console.log(`Property update addition failure : ${data.message}`);
      return data;
    } else {
      const responseBody = await response.json();
      console.error(`API responded with ${JSON.stringify(responseBody)}`);
    }
  }
  
  async getFileForFileStoreId(filestoreId) {
    let url = config.egovServices.egovServicesHost + config.egovServices.egovFilestoreServiceDownloadEndpoint;
    url = `${url}?`;
    url = `${url}tenantId=${config.rootTenantId}`;
    url = `${url}&`;
    url = `${url}fileStoreIds=${filestoreId}`;

    const options = {
      method: 'GET',
      origin: '*',
    };

    let response = await fetch(url, options);
    response = await (response).json();
    const fileURL = response.fileStoreIds[0].url.split(',');
    let fileName = geturl.parse(fileURL[0]);
    fileName = path.basename(fileName.pathname);
    fileName = fileName.substring(13);
    await this.downloadImage(fileURL[0].toString(), fileName);
    const file = fs.readFileSync(fileName, 'base64');
    fs.unlinkSync(fileName);
    return file;
  }

}

module.exports = new GisService();
