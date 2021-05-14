class PersonService {

  async isHomeIsolatedPatient(mobileNumber) {
    return true;
  }

  async fetchAllHomeIsolatedPatients() {
    return [];
  }

}

module.exports = new PersonService();