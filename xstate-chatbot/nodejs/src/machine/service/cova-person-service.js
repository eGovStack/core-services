const fetch = require('node-fetch');
const config = require('../../env-variables');

class PersonService {
  /**
   * Method to check if a patient is in hoemIsolation based on their given mobilenumber
   *
   * @param {*} mobileNumber
   */
  async isHomeIsolatedPatient(mobileNumber) {
    const url = config.covaApiConfigs.cova2Url.concat(
      config.covaApiConfigs.isHomeIsolatedSuffix,
    );

    const headers = {
      'Content-Type': 'application/json',
      Authorization: config.covaApiConfigs.covaAuthorization,
    };

    const requestBody = {
      patient_mobile: mobileNumber,
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
        return true;
      }
      return false;
    }
    const responseBody = await response.json();
    console.error(`Cova (isHomeIsolatedPatient API) responded with ${JSON.stringify(responseBody)}`);

    return false;
  }

  async fetchAllHomeIsolatedPatients() {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: config.covaApiConfigs.covaReminderAuthorization,
    };
    const requestBody = {
      timestamp: '',
      filter_type: 'all',
      data_type: 'P',
    };
    const requestOptions = {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    };
    const url = config.covaApiConfigs.covaReminderUrl.concat(
      config.covaApiConfigs.covaReminderSuffix,
    );
    const response = await fetch(url, requestOptions);
    let data;
    if (response.status == 200) {
      data = await response.json();
    } else {
      const responseBody = await response.json();
      console.error(`Cova (fetchAllHomeIsolatedPatients API) responded with ${JSON.stringify(responseBody)}`);
    }
    return data;
  }
}

module.exports = new PersonService();
