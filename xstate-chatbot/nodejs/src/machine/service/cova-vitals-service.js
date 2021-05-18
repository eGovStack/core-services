const fetch = require("node-fetch");
const config = require("../../env-variables");

class VitalsService {

  async addVitals(user, vitals) {

    let symptoms = vitals.symptoms;
    let extra = {
      diabetes: symptoms.diabetes,
    };
    let url = config.covaApiConfigs.covaProdUrl.concat(
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
    // Dummy Content of patient Details
    //{"name":"asd","age":12,"gender":"male","district":"27","address":"asds","symptomsDate":"2021-05-16T18:30:00.000Z","covidPositiveDate":"2021-05-17T18:30:00.000Z"}
    // Dates are object Date and not strings 

    // TODO Make API call to Cova
  }

}

module.exports = new VitalsService();
