const fetch = require('node-fetch');
const config = require('../../env-variables');
const FormData = require('form-data');
var fs = require('fs');
const geturl = require('url');
var path = require("path");
const axios = require('axios');

class MVService {

  async getMVDetailsFromMobileNumber(mobileNumber) {
    const url = config.covaApiConfigs.getMVByMobileNumber.concat(
      config.covaApiConfigs.getMVLogin,
    );

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
      if (data.response == 1) {
        console.log('MV Fetch data through Mobile Number.');
      } else {
        console.error(`Error while fetching MV data through Mobile Number.\nStatus: ${data.success}; Response: ${JSON.stringify(data.message)}`);
      }
      return data;
    } else {
      const responseBody = await response.json();
      console.error(`Error while fetching MV data through Mobile Number.\nStatus: ${data.success}; Response: ${JSON.stringify(data.message)}`);
    }
  }

  async submitMVLocation(mvlocationdetail) {

    const url = config.covaApiConfigs.getMVByMobileNumber.concat(
      config.covaApiConfigs.submitPostStartReport,
    );
    // const url = 'https://pmidcprojects.punjab.gov.in/API/chatbox/postStartReport';
    var formdata = new FormData();
    formdata.append("user_id", mvlocationdetail.user_id);
    formdata.append("latitude", mvlocationdetail.latitude);
    formdata.append("longitude", mvlocationdetail.longitude);

    var requestOptions = {
      method: 'POST',
      body: formdata,
      redirect: 'follow'
    };

    const response = await fetch(url, requestOptions);
    if (response.status == 200) {
      const data = await response.json();
      if (data.response == 1) {
        console.log('MV Submit Intermediate data.');
      } else {
        console.error(`Error while MV Submit Intermediate data (Location only).\nStatus: ${data.success}; Response: ${JSON.stringify(data.message)}`);
      }
      return data;
    } else {
      const responseBody = await response.json();
      console.error(`Error while MV Submit Intermediate data (Location only).\nStatus: ${data.success}; Response: ${JSON.stringify(data.message)}`);
    }
  }

  async submitMVLocationImage(mvlocationdetail) {

    const url = config.covaApiConfigs.getMVByMobileNumber.concat(
      config.covaApiConfigs.submitPostIntermediateReport,
    );
    var formdata = new FormData();
    formdata.append("user_id", mvlocationdetail.user_id);
    formdata.append("latitude", mvlocationdetail.latitude);
    formdata.append("longitude", mvlocationdetail.longitude);
    if (mvlocationdetail.image) {
      let filestoreId = await this.getFileForFileStoreId(mvlocationdetail.image);
      formdata.append('image', filestoreId);
    }

    var requestOptions = {
      method: 'POST',
      body: formdata,
      redirect: 'follow'
    };

    const response = await fetch(url, requestOptions);
    if (response.status == 200) {
      const data = await response.json();
      if (data.response == 1) {
        console.log('MV Submit Intermediate data (Location and Image).');
      } else {
        console.error(`Error while MV Submit Intermediate data (Location and Image).\nStatus: ${data.success}; Response: ${JSON.stringify(data.message)}`);
      }
      return data;
    } else {
      const responseBody = await response.json();
      console.error(`Error while MV Submit Intermediate data (Location and Image).\nStatus: ${data.success}; Response: ${JSON.stringify(data.message)}`);
    }
  }

  async submitEndDayReport(mvreportdetail) {

    const url = config.covaApiConfigs.getMVByMobileNumber.concat(
      config.covaApiConfigs.submitPostEndReport,
    );

    var formdata = new FormData();
    formdata.append("user_id", mvreportdetail.user_id);
    formdata.append("no_of_households", mvreportdetail.noofHouseholds);
    formdata.append("training_conducted", mvreportdetail.trainingConducted);
    formdata.append("no_of_participants", mvreportdetail.noOfParticipantsInTraining);
    formdata.append("visit_to_school", mvreportdetail.visitSchoolOrReligiousInstitution);
    formdata.append("visit_to_mrf", mvreportdetail.visitMRFOrProcessingUnit);
    formdata.append("any_other_work", mvreportdetail.otherWork);

    var requestOptions = {
      method: 'POST',
      body: formdata,
      redirect: 'follow'
    };

    const response = await fetch(url, requestOptions);
    if (response.status == 200) {
      const data = await response.json();
      console.log(data.response.user_id)
      if (data.response == 1) {
        console.log('MV Submit Intermediate data.');
      } else {
        console.error(`Error while MV Submit Intermediate data.\nStatus: ${data.success}; Response: ${JSON.stringify(data.message)}`);
      }
      return data;
    } else {
      const responseBody = await response.json();
      console.error(`Error while MV Submit Intermediate data.\nStatus: ${data.success}; Response: ${JSON.stringify(data.message)}`);
    }
  }

  async getFileForFileStoreId(filestoreId) {

    let url = config.egovServices.egovServicesHost + config.egovServices.egovFilestoreServiceDownloadEndpoint;

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

  async downloadImage(url, filename) {
    const writer = fs.createWriteStream(filename);

    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    })
  }

  async fileStoreAPICall(fileName, fileData, tenantId) {

    var url = config.egovServices.egovServicesHost + config.egovServices.egovFilestoreServiceUploadEndpoint;
    url = url + '&tenantId=' + tenantId;
    var form = new FormData();
    form.append("file", fileData, {
      filename: fileName,
      contentType: "image/jpg"
    });
    let response = await axios.post(url, form, {
      headers: {
        ...form.getHeaders()
      }
    });

    var filestore = response.data;
    return filestore['files'][0]['fileStoreId'];
  }

}

module.exports = new MVService();
