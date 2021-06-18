const fetch = require('node-fetch');
const config = require('../../env-variables');

class BedsService {

  async getHospitalsByMobileNumber(mobileNumber) {

    const url = config.covaApiConfigs.cova2Url.concat(
      config.covaApiConfigs.getHospitalsByMobileNumber,
    );
    const headers = {
      'Content-Type': 'application/json',
      Authorization: config.covaApiConfigs.covaAuthorization,
    };

    const requestBody = {
      nodal_no: mobileNumber,
    };

    const request = {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    };

    const response = await fetch(url, request);

    if (response.status == 200) {
      const data = await response.json();

      if (data.response == 1) {
        console.log(`Hospital details info fetched succesfully : ${data.sys_message}`);
      } else {
        console.log(`Hospital details info fetched failure : ${data.sys_message}`);
      }
      return data;

    } else {
      const responseBody = await response.json();
      console.error(`Cova (getHospitalsByMobileNumber) responded with ${JSON.stringify(responseBody)}`);
    }

  }

  async updatehospitaldata(hospital) {
    let url = config.covaApiConfigs.covaUrlHospital.concat(
      config.covaApiConfigs.updateHospitalById,
    );
    let headers = {
      'Content-Type': 'application/json',
      Authorization: config.covaApiConfigs.covaAuthorization,
    };
    let requestBody = {
      hospital_Id: hospital.id,
      hospital_type_Id: '3',
      hospital_level_Id: hospital.hospital_level_Id,
      bed_capacity_L2: hospital.bed_capacity_L2,
      bed_vacant_L2: hospital.bed_vacant_L2,
      confirmed_cases_on_oxygen_with_support_l2: hospital.confirmed_cases_on_oxygen_support_l2,
      confirmed_cases_on_oxygen_without_support_l2: hospital.confirmed_cases_on_oxygen_without_support_l2,
      suspected_cases_on_oxygen_support_l2: hospital.suspected_cases_on_oxygen_support_l2,
      suspected_cases_on_oxygen_without_support_l2: hospital.suspected_cases_on_oxygen_without_support_l2,
      discharged_covid_patients_l2: hospital.discharged_covid_patients_l2,
      deaths_covid_patients_l2: hospital.deaths_covid_patients_l2,
      bed_capacity_L3: hospital.bed_capacity_L3,
      bed_vacant_L3: hospital.bed_vacant_L3,
      no_cases_on_icu_niv_without_venti_l3: hospital.no_cases_on_icu_niv_without_venti_l3,
      discharged_covid_patients_without_venti_l3: hospital.discharged_covid_patients_without_venti_l3,
      deaths_covid_patients_without_venti_l3: hospital.deaths_covid_patients_without_venti_l3,
      bed_capacity_icu_L3: hospital.bed_capacity_icu_L3,
      bed_vacant_L3_ICU: hospital.bed_vacant_L3_ICU,
      no_cases_on_intubated_invasive_venti_l3: hospital.no_cases_on_intubated_invasive_venti_l3,
      discharged_covid_patients_with_venti_l3: hospital.discharged_covid_patients_with_venti_l3,
      deaths_covid_patients_with_venti_l3: hospital.deaths_covid_patients_with_venti_l3,

    };
    const request = {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    };

    const response = await fetch(url, request);
    if (response.status == 200) {
      const data = await response.json();
      if (data.response == 1) {
        console.log('Hospital data Updated Or Report Submitted  successfully with Cova.');
      } else {
        console.error(`Error while updating hospital data or report to Cova. Message: ${responseBody.sys_message}`);
      }
      return data;

    } else {
      const responseBody = await response.json();
      console.error(`Error while updating hospital data or reports to Cova.\nStatus: ${response.status}; Response: ${JSON.stringify(responseBody)}`);
    }

  }
}

module.exports = new BedsService();
