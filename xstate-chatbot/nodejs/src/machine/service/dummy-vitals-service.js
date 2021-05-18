const moment = require('moment');

class VitalsService {

  async addVitals(user, vitals) {
    console.log(JSON.stringify(vitals));
  }

  async addPatient(user, patientDetails) {
    console.log(JSON.stringify(patientDetails));
  }

}

module.exports = new VitalsService();