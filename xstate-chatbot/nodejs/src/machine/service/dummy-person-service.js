class PersonService {

  async isHomeIsolatedPatient(mobileNumber) {
    return Math.random() > 0.5;
  }

  async fetchAllHomeIsolatedPatients() {
    return [];
  }

}

module.exports = new PersonService();