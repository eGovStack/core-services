const moment = require('moment');

class VitalsService {

  async addVitals(user, vitals) {
    console.log(JSON.stringify(vitals));
  }

  async addPatient(user, patientDetails) {
    console.log(JSON.stringify(patientDetails));
  }

  async getPatientDetailsFromSrfId(srfId) {
    return {"response":1,"sys_message":"success","data":[{"Response":"1","mobile_no":"9123123123","patient_name":"","flag":"WHATSPP-PM","patient_Id":"123"}]};
  }

}

module.exports = new VitalsService();