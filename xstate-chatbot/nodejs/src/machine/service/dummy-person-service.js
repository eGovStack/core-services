class PersonService {
  async isHomeIsolatedPatient(mobileNumber) {
    return Math.random() > 0.7;
  }

  async fetchAllHomeIsolatedPatients() {
    return [];
  }
}

module.exports = new PersonService();
