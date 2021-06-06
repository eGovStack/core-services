const fetch = require("node-fetch");
const config = require("../../env-variables");

class VitalsService {

  async addVitals(user, vitals,patientDetails) {
    let mobile;
    let url;
    let headers;
    let requestBody;
    if(patientDetails.rrt==='NO') {              // CITIZEN
      mobile = user.mobileNumber;
      url = config.covaApiConfigs.covaUrl.concat(
        config.covaApiConfigs.updateSelfInspectionSuffix
      );
    let symptoms = vitals.symptoms;
    let extra = {
       diabetes: symptoms.diabetes,
        };
   

    headers = {
      "Content-Type": "application/json",
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
      mobile = user.mobileNumber;             // RRT

       url = config.covaApiConfigs.covaUrl.concat(
        config.covaApiConfigs.submitData
      );
  
      headers = {
        "Content-Type": "application/json",
        Authorization: config.covaApiConfigs.covaAuthorization,
      };
  


    requestBody = {
        RespiratoryIssues: vitals.symptoms.respiratoryIssues,
        Comorbidities: vitals.symptoms.comorbidities,
        ComHeart: vitals.symptoms.ComHeart,
        LossOfSmellTaste: vitals.symptoms.lossOfSmellTaste,
        inspection_type: "R",
        FluLikeSymptoms: vitals.symptoms.fluLikeSymptoms,
        ComDiabetic: vitals.symptoms.diabetes,
        ComKidney: vitals.symptoms.ComKidney,
        spo2level: vitals.spo2,
        logitude: "",
        latitude: "",
        role_Id: "0",
        ComCancer: vitals.symptoms.ComCancer,
        ComStatus: 1,
        type_info: "",
        ComOthers: "",
        question_2: "",
        question_1: "",
        question_3: "",
        IdspId: "",
        quaranitined_Id: "",
        registered_date: "",
        pulserate: vitals.pulse,
        district_Id: "",
        current_temp: vitals.temperature,
        arrival_at_home: "",
        NeedsDoctorCall: "",
        FatehKitsDelivered: vitals.symptoms.FatehKitsDelivered,
        base64: ""
  
      };
  


    }

    var request = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(requestBody),
    };

    let response = await fetch(url, request);
    if(response.status == 200) {
      let responseBody = await response.json();
      if(responseBody.response == 1) {
        console.log('Vitals registered Or Report Submitted  successfully with Cova.');
      } else {
        console.error(`Error while registering vitals or report to Cova. Message: ${responseBody.sys_message}`);
      }
    } else {
      let responseBody = await response.json();
      console.error(`Error while registering vitals or reports to Cova.\nStatus: ${response.status}; Response: ${JSON.stringify(responseBody)}`);
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
    let url = config.covaApiConfigs.covidApiSuffix.concat(
      config.covaApiConfigs.covidApiSrfid.concat(srfId)
    );
    let response = await fetch(url);

    if(response.status == 200) {
      let data = await response.json();
      return data;
    } else {
      let responseBody = await response.json();
      console.error(`Cova (SRFId API) responded with ${JSON.stringify(responseBody)}`);
      return { response: 0 };
    }
  }

  async getMoAuthorization(rmoMobileNumber) {
    let url = config.covaApiConfigs.covidApiSuffix.concat(
      config.covaApiConfigs.covidApiRmoAuth.concat(rmoMobileNumber)
    );

    let response = await fetch(url);
    if(response.status == 200) {
      let data = await response.json();
      return data;
    } else {
      let responseBody = await response.json();
      console.error(`Cova (RmoAuthorization API) responded with ${JSON.stringify(responseBody)}`);
      return { response: 0 };
    }
  }
  async getMoSubmitReport(caseid,mophone,remarks,specRequire,hospRequire) {
    let url;
    if(specRequire=='yes')
    {
     url = config.covaApiConfigs.covidApiSuffix.concat(
      config.covaApiConfigs.covidApiSpecializationNeed.concat(caseid).concat('/').concat(mophone)
      .concat('/').concat(specRequire).concat('/').concat(remarks)
    );
    }
    else
    if(hospRequire=='yes')
    {
     url = config.covaApiConfigs.covidApiSuffix.concat(
      config.covaApiConfigs.covidApiHospitalNeed.concat(caseid).concat('/').concat(mophone)
      .concat('/').concat(hospRequire).concat('/').concat(remarks)
    );
    }
    let response = await fetch(url);
    if(response.status == 200) {
      let data = await response.json();
      return data;
    } else {
      let responseBody = await response.json();
      console.error(`Cova (RmoAuthorization API) responded with ${JSON.stringify(responseBody)}`);
      return { response: 0 };
    }
  }

  async getPatientDetailsFromMobileNumber(mobileNumber) {
        let url = config.covaApiConfigs.covaUrl.concat(
      config.covaApiConfigs.isDataBasedMobileNo
    );
    let headers = {
      "Content-Type": "application/json",
       Authorization: config.covaApiConfigs.covaAuthorization,
         };

    let requestBody = {
      MobileNumber: mobileNumber.toString(),
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
      console.error(`Cova (MOBNo API) responded with ${JSON.stringify(responseBody)}`);
      return { response: 0 };
    }
  }
}

 module.exports = new VitalsService();
