const moment = require('moment');

class VitalsService {

  async addVitals(user, vitals) {
    console.log(JSON.stringify(vitals));
  }

  async addPatient(user, patientDetails) {
    console.log(JSON.stringify(patientDetails));
  }

  async isValidSrfId(srfId) {
    return false;
  }

}

module.exports = new VitalsService();