const fetch = require("node-fetch");
const config = require("../../env-variables");

class PersonService {
  /**
   * Method to check if a patient is in hoemIsolation based on their given mobilenumber
   *
   * @param {*} mobileNumber
   */
  async isHomeIsolatedPatient(mobileNumber) {
    let url = config.covaApiConfigs.cova2Url.concat(
      config.covaApiConfigs.isHomeIsolatedSuffix
    );

    let headers = {
      "Content-Type": "application/json",
      Authorization: config.covaApiConfigs.covaAuthorization,
    };

    let requestBody = {
      patient_mobile: mobileNumber,
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
        return true;
      } else {
        return false;
      }
    } else {
      let responseBody = await response.json();
      console.error(`Cova (isHomeIsolatedPatient API) responded with ${JSON.stringify(responseBody)}`);
    }
    return false;
  }

  async fetchAllHomeIsolatedPatients() {
    let headers = {
      "Content-Type": "application/json",
      Authorization: config.covaApiConfigs.covaReminderAuthorization,
    };
    let requestBody = {
      timestamp: "",
      filter_type: "all",
      data_type: "P"
    };
    var requestOptions = {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(requestBody),
    };
    let url = config.covaApiConfigs.covaReminderUrl.concat(
      config.covaApiConfigs.covaReminderSuffix
    );
    let response = await fetch(url, requestOptions)
    var data;
    if(response.status == 200) {
      data = await response.json();
      console.log(data, "dataaa");
    } else {
      let responseBody = await response.json();
      console.error(`Cova (fetchAllHomeIsolatedPatients API) responded with ${JSON.stringify(responseBody)}`);
    }
    return data;
  }
}

module.exports = new PersonService();
