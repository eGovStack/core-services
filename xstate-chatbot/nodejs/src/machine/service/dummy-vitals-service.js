class VitalsService {

  async addVitals(user, vitals) {
    console.log(JSON.stringify(vitals));
  }

}

module.exports = new VitalsService();