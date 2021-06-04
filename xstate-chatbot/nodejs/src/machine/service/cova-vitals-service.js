const fetch = require("node-fetch");
const config = require("../../env-variables");

class VitalsService {

  async addVitals(user, vitals) {
    let mobile;
    if(vitals.mobile_no) {             // RRT
      mobile = vitals.mobile_no;
    } else {                        // Citizen
      mobile = user.mobileNumber;
    }
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
    if(patientDetails.srfId) {
      // Validate SRF ID is 13 digit number
      const valid = /^\d{13}$/.test(patientDetails.srfId);
      console.log(`Valid: ${valid}`);
      if(!valid)
        patientDetails.srfId = null;
    }
    
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

  async getPatientDetailsFromSrfId(srfId) {
    let url = config.covaApiConfigs.covaReminderUrl.concat(
      config.covaApiConfigs.isDataBasedSrfid
    );

    let headers = {
      "Content-Type": "application/json",
      Authorization: config.covaApiConfigs.covaAuthorization,
    };

    let requestBody = {
      srf_id: srfId.toString(),
    };

    var request = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(requestBody),
    };

    let response = await fetch(url, request);
    if(response.status == 200) {
      let data = await response.json();
      return data;
    } else {
      let responseBody = await response.json();
      console.error(`Cova (SRFId API) responded with ${JSON.stringify(responseBody)}`);
      return { response: 0 };
    }
  }

}

 module.exports = new VitalsService();
