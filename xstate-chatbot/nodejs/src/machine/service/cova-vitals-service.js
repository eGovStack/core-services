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
    urlSearchParams.append("Comorbidities",     vitals.comorbidities);
    urlSearchParams.append("FluLikeSymptoms",   symptoms.has("flu"));
    urlSearchParams.append("LossOfSmellTaste",  symptoms.has("lostSmellTaste"));
    urlSearchParams.append("RespiratoryIssues", symptoms.has("respiratoryIssues"));
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
