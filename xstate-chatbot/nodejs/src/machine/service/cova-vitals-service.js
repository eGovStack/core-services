const fetch = require('node-fetch');
const config = require('../../env-variables');

class VitalsService {
  async addVitals(user, vitals, patientDetails) {
    let mobile;
    let url;
    let headers;
    let requestBody;
    if (patientDetails.rrt === 'NO') { // CITIZEN
      mobile = user.mobileNumber;
      url = config.covaApiConfigs.covaUrl.concat(
        config.covaApiConfigs.updateSelfInspectionSuffix,
      );
      const { symptoms } = vitals;
      const extra = {
        diabetes: symptoms.diabetes,
      };

      headers = {
        'Content-Type': 'application/json',
        Authorization: config.covaApiConfigs.covaAuthorization,
      };

      requestBody = {
        Token: config.covaApiConfigs.covaAuthToken,
        mobile_no: mobile,
        current_temp: vitals.temperature.toString(),
        pulserate: vitals.pulse.toString(),
        spo2level: vitals.spo2.toString(),
        LossOfSmellTaste: symptoms.lossOfSmellTaste,
        FluLikeSymptoms: symptoms.fluLikeSymptoms,
        RespiratoryIssues: symptoms.respiratoryIssues,
        Comorbidities: symptoms.comorbidities,
        NeedsDoctorCall: 'NO',
        Remarks: JSON.stringify(extra),
        srf_Id: vitals.srfId,
      };
    } else {
      mobile = user.mobileNumber; // RRT

      url = config.covaApiConfigs.covaUrl.concat(
        config.covaApiConfigs.submitData,
      );

      headers = {
        'Content-Type': 'application/json',
        Authorization: config.covaApiConfigs.covaAuthorization,
      };

      requestBody = {
        RespiratoryIssues: vitals.symptoms.respiratoryIssues,
        Comorbidities: vitals.symptoms.comorbidities,
        ComHeart: vitals.symptoms.ComHeart,
        LossOfSmellTaste: vitals.symptoms.lossOfSmellTaste,
        inspection_type: 'P',
        FluLikeSymptoms: vitals.symptoms.fluLikeSymptoms,
        ComDiabetic: vitals.symptoms.diabetes,
        ComKidney: vitals.symptoms.ComKidney,
        spo2level: vitals.spo2,
        logitude: vitals.longitude,
        latitude: vitals.latitude,
        role_Id: '0',
        ComCancer: vitals.symptoms.ComCancer,
        ComStatus: 1,
        type_info: '',
        ComOthers: '',
        question_2: '',
        question_1: '',
        question_3: '',
        IdspId: patientDetails.MASTER_ID,
        quaranitined_Id: '',
        registered_date: '',
        pulserate: vitals.pulse,
        district_Id: '',
        current_temp: vitals.temperature,
        arrival_at_home: '',
        NeedsDoctorCall: '',
        FatehKitsDelivered: vitals.symptoms.FatehKitsDelivered,
        base64: '',
        srf_Id: '',
        data_source_type: patientDetails.data_source_type,

      };
    }

    const request = {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    };

    const response = await fetch(url, request);
    if (response.status == 200) {
      const responseBody = await response.json();
      if (responseBody.response == 1) {
        console.log('Vitals registered Or Report Submitted  successfully with Cova.');
      } else {
        console.error(`Error while registering vitals or report to Cova. Message: ${responseBody.sys_message}`);
      }
    } else {
      const responseBody = await response.json();
      console.error(`Error while registering vitals or reports to Cova.\nStatus: ${response.status}; Response: ${JSON.stringify(responseBody)}`);
    }
  }

  async addPatient(user, patientDetails) {
    if (patientDetails.srfId) {
      // Validate SRF ID is 13 digit number
      const valid = /^\d{13}$/.test(patientDetails.srfId);
      console.log(`Valid: ${valid}`);
      if (!valid) patientDetails.srfId = null;
    }

    const url = config.covaApiConfigs.cova2Url.concat(
      config.covaApiConfigs.addPatientSuffix,
    );

    const headers = {
      'Content-Type': 'application/json',
      Authorization: config.covaApiConfigs.covaAuthorization,
    };

    let genderId = 3;
    if (patientDetails.gender.toLowerCase() == 'male') {
      genderId = 1;
    } else if (patientDetails.gender.toLowerCase() == 'female') {
      genderId = 2;
    }

    const requestBody = {
      patient_name: patientDetails.name,
      patient_age: patientDetails.age,
      patient_mobile: user.mobileNumber,
      gender_Id: genderId,
      district_Id: patientDetails.district,
      address: patientDetails.address,
      symptom_start_date: patientDetails.symptomsDate,
      covid_positive_date: patientDetails.covidPositiveDate,
      srf_id: patientDetails.srfId,
    };

    const request = {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    };

    const response = await fetch(url, request);

    if (response.status == 200) {
      const data = await response.json();
      if (data.response == 1) {
        console.log(`pateint info added succesfully : ${data.sys_message}`);
      } else {
        console.log(`patient info addition failure : ${data.sys_message}`);
      }
    } else {
      const responseBody = await response.json();
      console.error(`Cova (Add Patient API) responded with ${JSON.stringify(responseBody)}`);
    }
  }

  async getPatientDetailsFromSrfId(srfId) {
    const url = config.covaApiConfigs.covidApiSuffix.concat(
      config.covaApiConfigs.covidApiSrfid.concat(srfId),
    );
    const response = await fetch(url);

    if (response.status == 200) {
      const data = await response.json();
      return data;
    }
    const responseBody = await response.json();
    console.error(`Cova (SRFId API) responded with ${JSON.stringify(responseBody)}`);
    return { response: 0 };
  }

  async getMoAuthorization(rmoMobileNumber) {
    const url = config.covaApiConfigs.covidApiSuffix.concat(
      config.covaApiConfigs.covidApiRmoAuth.concat(rmoMobileNumber),
    );

    const response = await fetch(url);
    if (response.status == 200) {
      const data = await response.json();
      return data;
    }
    const responseBody = await response.json();
    console.error(`Cova (RmoAuthorization API) responded with ${JSON.stringify(responseBody)}`);
    return { response: 0 };
  }

  async getMoSubmitReport(caseid, mophone, remarks, specRequire, hospRequire) {
    let url;
    if (specRequire == 'yes') {
      url = config.covaApiConfigs.covidApiSuffix.concat(
        config.covaApiConfigs.covidApiSpecializationNeed.concat(caseid).concat('/').concat(mophone)
          .concat('/')
          .concat(specRequire)
          .concat('/')
          .concat(remarks),
      );
    } else
    if (hospRequire == 'yes') {
      url = config.covaApiConfigs.covidApiSuffix.concat(
        config.covaApiConfigs.covidApiHospitalNeed.concat(caseid).concat('/').concat(mophone)
          .concat('/')
          .concat(hospRequire)
          .concat('/')
          .concat(remarks),
      );
    }
    const response = await fetch(url);
    if (response.status == 200) {
      const data = await response.json();
      return data;
    }
    const responseBody = await response.json();
    console.error(`Cova (RmoAuthorization API) responded with ${JSON.stringify(responseBody)}`);
    return { response: 0 };
  }

  async getPatientDetailsFromMobileNumber(mobileNumber) {
    const url = config.covaApiConfigs.covaUrl.concat(
      config.covaApiConfigs.isDataBasedMobileNo,
    );
    const headers = {
      'Content-Type': 'application/json',
      Authorization: config.covaApiConfigs.covaAuthorization,
    };

    const requestBody = {
      MobileNumber: mobileNumber.toString(),
    };

    const request = {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    };

    const response = await fetch(url, request);
    if (response.status == 200) {
      const data = await response.json();
      return data;
    }
    const responseBody = await response.json();
    console.error(`Cova (MOBNo API) responded with ${JSON.stringify(responseBody)}`);
    return { response: 0 };
  }

  async getPatientDetailsFromMobileNumber(mobileNumber) {
    const url = config.covaApiConfigs.covaUrl.concat(
      config.covaApiConfigs.isDataBasedMobileNo,
    );
    const headers = {
      'Content-Type': 'application/json',
      Authorization: config.covaApiConfigs.covaAuthorization,
    };

    const requestBody = {
      MobileNumber: mobileNumber.toString(),
    };

    const request = {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    };

    const response = await fetch(url, request);
    if (response.status == 200) {
      const data = await response.json();
      // console.log(data.data);
      return data;
    }
    const responseBody = await response.json();
    console.error(`Cova (MOBNo API) responded with ${JSON.stringify(responseBody)}`);
    return { response: 0 };
  }
}

module.exports = new VitalsService();
