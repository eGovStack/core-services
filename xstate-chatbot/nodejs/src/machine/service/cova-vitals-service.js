const fetch = require("node-fetch");
const config = require("../../env-variables");

class VitalsService {

  async addVitals(user, vitals) {

    let symptoms = vitals.symptoms;
    let url = config.covaApiConfigs.covaProdUrl.concat(
      config.covaApiConfigs.isHomeIsolatedSuffix
    );

    let headers = {
      "Content-Type": "application/json",
      Authorization: config.covaApiConfigs.covaAuthorization,
    };

    var urlSearchParams = new URLSearchParams();

    urlSearchParams.append("Token",             config.covaApiConfigs.covaAuthToken);
    urlSearchParams.append("mobile_no",         user.mobileNumber);
    urlSearchParams.append("pulserate",         vitals.pulse);
    urlSearchParams.append("spo2level",         vitals.spo2);
    urlSearchParams.append("current_temp",      vitals.temprature);
    urlSearchParams.append("Comorbidities",     symptoms.comorbidities);
    urlSearchParams.append("FluLikeSymptoms",   symptoms.fluLikeSymptoms);
    urlSearchParams.append("LossOfSmellTaste",  symptoms.lossOfSmellTaste);
    urlSearchParams.append("RespiratoryIssues", symptoms.respiratoryIssues);
    urlSearchParams.append("NeedsDoctorCall",   vitals.NeedsDoctorCall);
    urlSearchParams.append("Remarks",           vitals.remarks);

    var request = {
      method: "POST",
      headers: headers,
      body: urlSearchParams,
    };

    await fetch(url, request);
  }
}

module.exports = new VitalsService();
