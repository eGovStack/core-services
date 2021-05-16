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
    urlSearchParams.append("Token", config.covaApiConfigs.covaAuthToken);

    var request = {
      method: "POST",
      headers: headers,
      body: urlSearchParams,
    };

    let response;

    return await fetch(url, request)
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        console.log('The resposne from homeIsolation response : ' + json);
        let response = JSON.parse(json);
        if(response == 1)
        return true;
        else return false;
      }).catch(err => console.log('The error msg for homeIsolation : ' + err));
  }

  async fetchAllHomeIsolatedPatients() {}
}

module.exports = new PersonService();
