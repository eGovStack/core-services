const moment = require('moment');

class VitalsService {
  async addVitals(user, vitals, patientDetails) {
    console.log(JSON.stringify(vitals));
  }

  async getMoAuthorization(rmoMobileNumber) {
    return { flag: true, msg: 'RMO Present', id: null };
  }

  async getMoSubmitReport(caseid, mophone, remarks, specRequire, hospRequire) {
    return {
      flag: true,
      msg: 'Status Updated',
      id: null,
    };
  }

  async getPatientDetailsFromSrfId(srfId) {
    return {
      flag: true,
      msg: 'Patient Present',
      list: [
        {
          case_id: 17294,
          submissionDate: '2021-06-01',
          district_id: 3,
          districtPojo: {
            district_id: 3,
            district_name: 'BATHINDA',
            status: null,
          },
          town_id: 1,
          townPojo: {
            town_id: 1,
            district_id: 1,
            districtPojo: {
              district_id: 1,
              district_name: 'AMRITSAR',
              status: null,
            },
            town_name: 'Ajnala (NP)',
            town_code: null,
            status: 0,
          },
          thesil_id: 1,
          thesilPojo: {
            thesil_id: 1,
            district_id: 1,
            districtPojo: {
              district_id: 1,
              district_name: 'AMRITSAR',
              status: null,
            },
            thesil_name: 'Ajnala',
            thesil_code: null,
            status: 0,
          },
          village_id: 1,
          villagePojo: {
            village_id: 1,
            thesil_id: 13,
            thesilPojo: {
              thesil_id: 13,
              district_id: 6,
              districtPojo: {
                district_id: 6,
                district_name: 'FAZILKA',
                status: null,
              },
              thesil_name: 'Abohar',
              thesil_code: null,
              status: 0,
            },
            village_name: 'Dhaba kokrian',
            village_code: '',
            status: 0,
          },
          rmo_id: 1,
          rmoPojo: {
            rmo_id: 1,
            name: 'dr upasana ',
            contactno: '9872199709',
            district_id: 21,
            districtPojo: {
              district_id: 21,
              district_name: 'SAS NAGAR /MOHALI',
              status: null,
            },
            thesil_id: 56,
            thesilPojo: {
              thesil_id: 56,
              district_id: 21,
              districtPojo: {
                district_id: 21,
                district_name: 'SAS NAGAR /MOHALI',
                status: null,
              },
              thesil_name: 'Derabassi',
              thesil_code: null,
              status: 0,
            },
            village_id: 2869,
            villagePojo: {
              village_id: 2869,
              thesil_id: 56,
              thesilPojo: {
                thesil_id: 56,
                district_id: 21,
                districtPojo: {
                  district_id: 21,
                  district_name: 'SAS NAGAR /MOHALI',
                  status: null,
                },
                thesil_name: 'Derabassi',
                thesil_code: null,
                status: 0,
              },
              village_name: 'Chachroli',
              village_code: '',
              status: 0,
            },
            status: '1',
            maxPatientCount: 10,
            assignPatientCount: 0,
            createDate: '2021-05-23',
          },
          rmoAssignedStatus: 'none',
          isHospitalizationRequired: null,
          isSpecializationRequired: null,
          uniqueId: '9121647',
          laboratory_name: null,
          updated_sync_date: null,
          clinical_updated_on: null,
          srf_Id: '916900088470',
          final_result_sample: null,
          date_of_sample_tested: null,
          symptoms: null,
          patient_date_of_sample_received: null,
          patient_date_of_sample_collection: null,
          patient_state_residence: null,
          patient_age_type: null,
          age_info: null,
          patient_Id: null,
          symptoms_status: null,
          patient_name: 'VIVEK GOYAL',
          patient_age: '25',
          patient_gender: 'MALE',
          patient_address: '473 MODAL TOWN BATHINDA PUNJAB',
          contact_number: '9671300009',
          status: '0',
          area: 'none',
          hospitalizationRemarks: null,
          specializationRemarks: null,
          hospitalizationStatus: null,
          specializationStatus: null,
          hospitalizationCreateDate: null,
          specializationCreateDate: null,
          isolation_Start_Date: '2021-05-31',
          confirmation_Date: '2021-05-31',
        },
      ],
      count: 0,
      active_count: 0,
      deactive_count: 0,
      selectedlist: null,
    };
  }

  async addPatient(user, patientDetails) {
    console.log(JSON.stringify(patientDetails));
  }

  // async getPatientDetailsFromSrfId(srfId) {
  //   return {"response":1,"sys_message":"success","data":[{"Response":"1","mobile_no":"9123123123","patient_name":"","flag":"WHATSPP-PM","patient_Id":"123"}]};
  // }

  async getPatientDetailsFromMobileNumber(mobileNumber) {
    return {
      response: 1,
      sys_message: 'success',
      data: [{
        MASTER_ID: '2066248', MASTER_NAME: 'RENU BALA', com_status: '0', fateh_kit_delivered: 'NO',
      }, {
        MASTER_ID: '2102986', MASTER_NAME: 'GURDIAL SINGH SO BALVIR SINGH', com_status: '1', fateh_kit_delivered: 'YES',
      }],
    };
  }

  async getPatientDetailsFromMobileNumber(mobileNumber) {
    return {
      response: 1,
      sys_message: 'success',
      data: [{
        MASTER_ID: '2066248', MASTER_NAME: 'RENU BALA', com_status: '0', fateh_kit_delivered: 'NO',
      }, {
        MASTER_ID: '2102986', MASTER_NAME: 'GURDIAL SINGH SO BALVIR SINGH', com_status: '1', fateh_kit_delivered: 'YES',
      }],
    };
  }
}

module.exports = new VitalsService();
