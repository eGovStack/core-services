const fetch = require("node-fetch");
const config = require("../../env-variables");

class PersonService {
  /**
   * Method to check if a patient is in hoemIsolation based on their given mobilenumber
   *
   * @param {*} mobileNumber
   */
  async isHomeIsolatedPatient(mobileNumber) {
    let url = config.covaApiConfigs.covaProdUrl.concat(
      config.covaApiConfigs.isHomeIsolatedSuffix
    );

    let headers = {
      "Content-Type": "application/json",
      Authorization: config.covaApiConfigs.covaAuthorization,
    };

    var urlSearchParams = new URLSearchParams();
    urlSearchParams.append("MobileNumber", mobileNumber);
    urlSearchParams.append("Token", '');

    let requestBody = {
      Token: config.covaApiConfigs.covaAuthToken,
      MobileNumber: mobileNumber,
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
      console.error(`Cova responded with ${JSON.stringify(responseBody)}`);
    }
    return true;
  }

  async fetchAllHomeIsolatedPatients() {}
}

module.exports = new PersonService();
