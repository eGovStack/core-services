const moment = require('moment');

class BedsService {

  async getHospitalById(user) {
    return {
      "response": 1,
      "sys_message": "success",
      "data": [
          {
              hospital_id: '435',
              bed_capacity_L2: '100',
              bed_capacity_L3: '0',
              updated_date: '06/15/2021  3:03PM',
              bed_vacant_L2: '0',
              bed_vacant_L3: '0',
              hospital_level_Id: '2',
              bed_capacity_icu_L3: '0',
              bed_vacant_L3_ICU: '0',
              is_icu_l3_flag: 'N',
              confirmed_cases_on_oxygen_support_l2: '44',
              confirmed_cases_on_oxygen_without_support_l2: '44',
              suspected_cases_on_oxygen_support_l2: '44',
              suspected_cases_on_oxygen_without_support_l2: '44',
              no_cases_on_intubated_invasive_venti_l3: '0',
              no_cases_on_icu_niv_without_venti_l3: '0',
              discharged_covid_patients_l2: '44',
              deaths_covid_patients_l2: '44',
              discharged_covid_patients_with_venti_l3: '0',
              deaths_covid_patients_with_venti_l3: '0',
              discharged_covid_patients_without_venti_l3: '0',
              deaths_covid_patients_without_venti_l3: '0',
              time_2_6_flag: '1'
          }
      ]
   };
  }

  async updatehospitaldata(hospital) {
    console.log(JSON.stringify(hospital));
  }

}

module.exports = new BedsService();
