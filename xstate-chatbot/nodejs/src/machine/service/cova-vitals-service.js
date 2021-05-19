const fetch = require("node-fetch");
const config = require("../../env-variables");
const moment = require('moment-timezone');

class VitalsService {

  async addVitals(user, vitals) {

    let symptoms = vitals.symptoms;
    let extra = {
      diabetes: symptoms.diabetes,
    };
    let url = config.covaApiConfigs.covaUrl.concat(
      config.covaApiConfigs.updateSelfInspectionSuffix
    );

    let headers = {
      "Content-Type": "application/json",
      Authorization: config.covaApiConfigs.covaAuthorization,
    };

    let requestBody = {
      Token: config.covaApiConfigs.covaAuthToken,
      mobile_no: user.mobileNumber,
      current_temp: vitals.temperature.toString(),
      pulserate: vitals.pulse.toString(),
      spo2level: vitals.spo2.toString(),
      LossOfSmellTaste: symptoms.lossOfSmellTaste,
      FluLikeSymptoms: symptoms.fluLikeSymptoms,
      RespiratoryIssues: symptoms.respiratoryIssues,
      Comorbidities: symptoms.comorbidities,
      NeedsDoctorCall: 'NO',
      Remarks: JSON.stringify(extra),
    };

    var request = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(requestBody),
    };

    let response = await fetch(url, request);
    if(response.status) {
      let responseBody = await response.json();
      if(responseBody.response == 1) {
        console.log('Vitals registered successfully with Cova.');
      } else {
        console.error(`Error while registering vitals to Cova. Message: ${responseBody.sys_message}`);
      }
    } else {
      let responseBody = await response.json();
      console.error(`Error while registering vitals to Cova.\nStatus: ${response.status}; Response: ${JSON.stringify(responseBody)}`);
    }
  }

  async addPatient(user, patientDetails) {
    
    let url = config.covaApiConfigs.cova2Url.concat(
      config.covaApiConfigs.addPatientSuffix
    );

    let headers = {
      "Content-Type": "application/json",
      Authorization: config.covaApiConfigs.covaAuthorization,
    };

    let genderId = 3;
    if(patientDetails.gender.toLowerCase() == 'male'){
      genderId = 1;
    }else if(patientDetails.gender.toLowerCase() == 'female'){
      genderId = 2;
    }

    let requestBody = {
      patient_age: patientDetails.age,
      patient_mobile: user.mobileNumber,
      gender_Id: genderId,
      district_Id: patientDetails.district, 
      address: patientDetails.address,
      symptom_start_date: patientDetails.symptomsDate.format('YYYY-MM-DD HH:MM:SS').toString(),
      covid_positive_date: patientDetails.covidPositiveDate.format('YYYY-MM-DD HH:MM:SS').toString(),
    };

    var request = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(requestBody),
    };

    let response = await fetch(url, request)
    
    if(response.status == 200) {
      let data = await response.json();
      if(data.response == 1) {
        console.log('pateint info added succesfully : ' + data.sys_message);
      } else {
        console.log('patient info addition failure : ' + data.sys_message);
      }
    } else {
      let responseBody = await response.json();
      console.error(`Cova (Add Patient API) responded with ${JSON.stringify(responseBody)}`);
    }
  }

}

module.exports = new VitalsService();
