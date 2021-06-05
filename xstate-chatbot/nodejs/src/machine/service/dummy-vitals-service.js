const moment = require('moment');

class VitalsService {

  async addVitals(user, vitals,patientDetails) {
    console.log(JSON.stringify(vitals));
  }

  async addPatient(user, patientDetails) {
    console.log(JSON.stringify(patientDetails));
  }

  async getPatientDetailsFromSrfId(srfId) {
    return {"response":1,"sys_message":"success","data":[{"Response":"1","mobile_no":"9123123123","patient_name":"","flag":"WHATSPP-PM","patient_Id":"123"}]};
  }

  async getPatientDetailsFromMobileNumber(mobileNumber) {return { "response": 1,"sys_message": "success","data": [{ "MASTER_ID": "2066248","MASTER_NAME": "RENU BALA","com_status": "0","fateh_kit_delivered": "NO"},{"MASTER_ID": "2102986","MASTER_NAME": "GURDIAL SINGH SO BALVIR SINGH","com_status": "1","fateh_kit_delivered": "YES"}] };
  }

   }

module.exports = new VitalsService();