const moment = require('moment');

class VitalsService {

  async addVitals(user, vitals) {
    console.log(JSON.stringify(vitals));
  }

  async getCitiesAndMessageBundle() {
    let keys = [ 'pb.jalandhar', 'pb.amritsar' ];
    let messageBundle = {
      'pb.jalandhar': {
        en_IN: 'Jalandhar',
      },
      'pb.amritsar': {
        en_IN: 'Amritsar',
      },
    };
    return { keys, messageBundle };
  }

  async addPatient(user, patientDetails) {
    console.log(JSON.stringify(patientDetails));
  }

}

module.exports = new VitalsService();