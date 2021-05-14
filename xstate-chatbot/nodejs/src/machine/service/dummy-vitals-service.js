class VitalsService {

  async addVitals(vitals) {
    console.log(JSON.stringify(vitals));
  }

}

module.exports = new VitalsService();