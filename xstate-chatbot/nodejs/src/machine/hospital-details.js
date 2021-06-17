const { assign, actions } = require('xstate');
const moment = require('moment');
const dialog = require('./util/dialog');
const mediaUtil = require('./util/media');
const config = require('../env-variables');
const { messages, grammers } = require('./messages/hospital-details');
const { personService, bedsService } = require('./service/service-loader');

const hospitalFlow = {
  id: 'hospitalFlow',
  initial: 'nodalOfficer',
  onEntry: assign((context, event) => {
    context.slots.hospital = {};
    context.slots.previoushospitaldata = {};
  }),
  states: {
    nodalOfficer: {
      id: 'nodalOfficer',
      initial: 'process',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            context.slots.hospital.mobileNumber=context.user.mobileNumber;
            
          }),
          invoke: {
            src: (context, event) => bedsService.getHospitalsByMobileNumber(context.user.mobileNumber),
            onDone: [
              {
                cond: (context, event) => event.data.response == '1',
                actions: assign((context, event) => {
                  context.slots.hospital.confirmed_cases_on_oxygen_support_l2 = event.data.data[0].confirmed_cases_on_oxygen_support_l2;
                  context.slots.hospital.confirmed_cases_on_oxygen_without_support_l2 = event.data.data[0].confirmed_cases_on_oxygen_without_support_l2;
                  context.slots.hospital.suspected_cases_on_oxygen_support_l2 = event.data.data[0].suspected_cases_on_oxygen_support_l2;
                  context.slots.hospital.suspected_cases_on_oxygen_without_support_l2 = event.data.data[0].suspected_cases_on_oxygen_without_support_l2;
                  context.slots.hospital.discharged_covid_patients_l2 = event.data.data[0].discharged_covid_patients_l2;
                  context.slots.hospital.deaths_covid_patients_l2 = event.data.data[0].deaths_covid_patients_l2;
                  context.slots.hospital.hospital_level_Id = event.data.data[0].hospital_level_Id;
                  context.slots.hospital.bed_capacity_L2 = event.data.data[0].bed_capacity_L2;
                  context.slots.previoushospitaldata.confirmed_cases_on_oxygen_support_l2 = event.data.data[0].confirmed_cases_on_oxygen_support_l2;
                  context.slots.previoushospitaldata.confirmed_cases_on_oxygen_without_support_l2 = event.data.data[0].confirmed_cases_on_oxygen_without_support_l2;
                  context.slots.previoushospitaldata.suspected_cases_on_oxygen_support_l2 = event.data.data[0].suspected_cases_on_oxygen_support_l2;
                  context.slots.previoushospitaldata.suspected_cases_on_oxygen_without_support_l2 = event.data.data[0].suspected_cases_on_oxygen_without_support_l2;
                  context.slots.previoushospitaldata.discharged_covid_patients_l2 = event.data.data[0].discharged_covid_patients_l2;
                  context.slots.previoushospitaldata.deaths_covid_patients_l2 = event.data.data[0].deaths_covid_patients_l2;
                  context.slots.previoushospitaldata.id = event.data.data[0].hospital_id;
                  context.slots.previoushospitaldata.bed_capacity_L2 = event.data.data[0].bed_capacity_L2;
                  context.slots.previoushospitaldata.hospital_level_Id = event.data.data[0].hospital_level_Id;
                  context.slots.hospital.id = event.data.data[0].hospital_id;
                  context.slots.hospital.bed_capacity_icu_L3 = event.data.data[0].bed_capacity_icu_L3;
                  context.slots.hospital.bed_capacity_L3 = event.data.data[0].bed_capacity_L3;
                  context.slots.hospital.no_cases_on_icu_niv_without_venti_l3 = event.data.data[0].no_cases_on_icu_niv_without_venti_l3;
                  context.slots.hospital.discharged_covid_patients_without_venti_l3 = event.data.data[0].discharged_covid_patients_without_venti_l3;
                  context.slots.hospital.deaths_covid_patients_without_venti_l3 = event.data.data[0].deaths_covid_patients_without_venti_l3;
                  context.slots.hospital.no_cases_on_intubated_invasive_venti_l3 = event.data.data[0].no_cases_on_intubated_invasive_venti_l3;
                  context.slots.hospital.discharged_covid_patients_with_venti_l3 = event.data.data[0].discharged_covid_patients_with_venti_l3;
                  context.slots.hospital.deaths_covid_patients_with_venti_l3 = event.data.data[0].deaths_covid_patients_with_venti_l3;
                  context.slots.previoushospitaldata.bed_capacity_icu_L3 = event.data.data[0].bed_capacity_icu_L3;
                  context.slots.previoushospitaldata.bed_capacity_L3 = event.data.data[0].bed_capacity_L3;
                  context.slots.previoushospitaldata.no_cases_on_icu_niv_without_venti_l3 = event.data.data[0].no_cases_on_icu_niv_without_venti_l3;
                  context.slots.previoushospitaldata.discharged_covid_patients_without_venti_l3 = event.data.data[0].discharged_covid_patients_without_venti_l3;
                  context.slots.previoushospitaldata.deaths_covid_patients_without_venti_l3 = event.data.data[0].deaths_covid_patients_without_venti_l3;
                  context.slots.previoushospitaldata.no_cases_on_intubated_invasive_venti_l3 = event.data.data[0].no_cases_on_intubated_invasive_venti_l3;
                  context.slots.previoushospitaldata.discharged_covid_patients_with_venti_l3 = event.data.data[0].discharged_covid_patients_with_venti_l3;
                  context.slots.previoushospitaldata.deaths_covid_patients_with_venti_l3 = event.data.data[0].deaths_covid_patients_with_venti_l3;
                  dialog.sendMessage(context, dialog.get_message(messages.nodalOfficer.prompt, context.user.locale));
                }),
                target: '#hospitalTypeId',
              },
              {
                target: 'error',
              },
            ],
          },
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.noUserFetch.prompt, context.user.locale));
          }),
          always: 'prompt',
        },
      },
    },//Nodal Officer 
    hospitalTypeId: {
      id: 'hospitalTypeId',
      initial: 'process',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message;
            if (context.slots.previoushospitaldata.hospital_level_Id == '1') 
              message = dialog.get_message(messages.L2L3hospitalDetails, context.user.locale);
            else
              if (context.slots.previoushospitaldata.hospital_level_Id == '2') 
               message = dialog.get_message(messages.L2hospitalDetails, context.user.locale);
            else
              if (context.slots.previoushospitaldata.hospital_level_Id == '3') 
              message = dialog.get_message(messages.L3hospitalDetails, context.user.locale);
              
              dialog.sendMessage(context, message_3);
               
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            //context.slots.hospital.mobileNumber=context.user.mobileNumber;
            if (context.slots.previoushospitaldata.hospital_level_Id == '1') {
              let message = dialog.get_message(messages.L2L3hospitalDetails, context.user.locale);
              dialog.sendMessage(context, message);
              context.validMessage = true;
            }
            else
              if (context.slots.previoushospitaldata.hospital_level_Id == '2') {
                let message_2 = dialog.get_message(messages.L2hospitalDetails, context.user.locale);
                dialog.sendMessage(context, message_2);
                context.isValid = false;

              }
              else
                if (context.slots.previoushospitaldata.hospital_level_Id == '3') {
                  let message_3 = dialog.get_message(messages.L3hospitalDetails, context.user.locale);
                  dialog.sendMessage(context, message_3);
                  context.isValid = true;
                }
          }),
          always: [
            {
              cond: (context) => context.isValid == false,
              target: '#l2Hospital',
            },
            {
              cond: (context) => context.isValid == true,
              target: '#l3Hospital',
            },
            {
              cond: (context) => context.validMessage == true,
              target: '#l2l3Hospital',
            },
            {
              target: 'error',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.noUserFetch, context.user.locale), false);
          }),
          always: 'prompt',
        },
      },
    },//Hospital Type Id 1/2/3 
    l2Hospital: {
      id: 'l2Hospital',
      initial: 'process',
      states: {
      process: {
          onEntry: assign((context, event) => {
            if (new Date().getHours() >= 14 && new Date().getHours() <= 18) {
              context.isValid = true;
            } else {
              context.isValid = false;
            }
          }),
          always: [
            {
              cond: (context) => context.isValid == false,
              target: '#l2AvailableOxygenBeds',
            },
            {
              cond: (context) => context.isValid == true,
              target: '#l2HospitalUpdate',
            },
          ],
        },
      },
    },// L2 Hospital comparing time slots
    l2HospitalUpdate: {
      id: 'l2HospitalUpdate',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            context.grammer = grammers.binaryChoice.grammer;
            let message = dialog.get_message(messages.l2HospitalUpdate.prompt, context.user.locale);
            message += dialog.get_message(grammers.binaryChoice.prompt, context.user.locale);
            dialog.sendMessage(context, message);
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            context.intention = dialog.get_intention(context.grammer, event, true);
          }),
          invoke: {
            src: (context, event) => bedsService.getHospitalsByMobileNumber(context.slots.hospital.mobileNumber),
            onDone: [
              {
                cond: (context, event) => context.intention === 'YES',
                target: '#l2ConfirmedCOVIDPatientsOnOxygen',
              },
              {
                cond: (context, event) => context.intention === 'NO',
                target: '#l2UpdateExistingDetails',
              },
              {
                cond: (context, event) => context.intention === 'INTENTION_UKNOWN',
                target: 'error',
              },
            ],
          },
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.l2HospitalUpdate.error, context.user.locale), false);
          }),
          always: 'prompt',
        },
      },
    },// Consent for updating L2 Hospital Details
    l2UpdateExistingDetails: {
      id: 'l2UpdateExistingDetails',
      invoke: {
        src: (context) => bedsService.updatehospitaldata(context.slots.hospital),
        onDone: [
          {
            actions: assign((context, event) => {
              let message = dialog.get_message(messages.l2UpdateExistingDetails.prompt, context.user.locale);
              message += `\n`;
              message += dialog.get_message(messages.confirmedPreviousCOVIDPatientsOnOxygen.prompt, context.user.locale);
              message += `:: ${context.slots.previoushospitaldata.confirmed_cases_on_oxygen_support_l2}`;
              message += `\n`;
              message += dialog.get_message(messages.confirmedPreviousCOVIDPatientsWithoutOxygen.prompt, context.user.locale);
              message += `:: ${context.slots.previoushospitaldata.confirmed_cases_on_oxygen_without_support_l2}`;
              message += `\n`;
              message += dialog.get_message(messages.l2PreviousSuspectedCOVIDPatientsOnOxygen.prompt, context.user.locale);
              message += `:: ${context.slots.previoushospitaldata.suspected_cases_on_oxygen_support_l2}`;
              message += `\n`;
              message += dialog.get_message(messages.l2PreviousSuspectedCOVIDPatientsWithoutOxygen.prompt, context.user.locale);
              message += `:: ${context.slots.previoushospitaldata.suspected_cases_on_oxygen_without_support_l2}`;
              message += `\n`;
              message += dialog.get_message(messages.l2PreviousTotaldischargedCOVIDPatients.prompt, context.user.locale);
              message += `:: ${context.slots.previoushospitaldata.discharged_covid_patients_l2}`;
              message += `\n`;
              message += dialog.get_message(messages.confirmedPreviousCOVIDPatientsWithoutOxygen.prompt, context.user.locale);
              message += `:: ${context.slots.previoushospitaldata.confirmed_cases_on_oxygen_without_support_l2}`;
              message += `\n`;
              dialog.sendMessage(context, message);
            }),
            target: '#endstate',
          },
        ],

      },
    },//update L2 existing Details of hospital
    l2ConfirmedCOVIDPatientsOnOxygen: {
      id: 'l2ConfirmedCOVIDPatientsOnOxygen',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.confirmedPreviousCOVIDPatientsOnOxygen.prompt, context.user.locale);
            message += `\n :: ${context.slots.previoushospitaldata.confirmed_cases_on_oxygen_support_l2}`;
            message += `\n`;
            message += dialog.get_message(messages.confirmedCOVIDPatientsOnOxygen.prompt, context.user.locale);
            dialog.sendMessage(context, message);
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            const message = dialog.get_input(event, false);
            if (event.message.type == 'text') {
              const message = dialog.get_input(event, false);
              context.slots.hospital.confirmed_cases_on_oxygen_support_l2 = message;
              context.validMessage = true;
            } else {
              context.validMessage = false;
            }
          }),
          always: [
            {
              cond: (context) => context.validMessage == false,
              target: 'error',
            },
            {
              cond: (context) => context.validMessage == true,
              target: '#l2ConfirmedCOVIDPatientsWithoutOxygen',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.confirmedCOVIDPatientsOnOxygen.error, context.user.locale), false);
          }),
          always: 'prompt',
        },
      },
    },//Number of confirmed COVID Patients on oxygen Oxygen 
    l2ConfirmedCOVIDPatientsWithoutOxygen: {
      id: 'l2ConfirmedCOVIDPatientsWithoutOxygen',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.confirmedPreviousCOVIDPatientsWithoutOxygen.prompt, context.user.locale);
            message += `:: ${context.slots.previoushospitaldata.confirmed_cases_on_oxygen_without_support_l2}`;
            message += `\n`;
            message += dialog.get_message(messages.confirmedCOVIDPatientsWithoutOxygen.prompt, context.user.locale);
            dialog.sendMessage(context, message);
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            const message = dialog.get_input(event, false);
            if (event.message.type == 'text') {
              context.slots.hospital.confirmed_cases_on_oxygen_without_support_l2 = message;
              context.validMessage = true;
            } else {
              context.validMessage = false;
            }
          }),
          always: [
            {
              cond: (context) => context.validMessage,
              target: '#l2SuspectedCOVIDPatientsOnOxygen',
            },
            {
              target: 'error',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.confirmedCOVIDPatientsWithoutOxygen.error, context.user.locale), false);
          }),
          always: 'prompt',
        },
      },
    },//Number of confirmed COVID Patients without Oxygen 
    l2SuspectedCOVIDPatientsWithoutOxygen: {
      id: 'l2SuspectedCOVIDPatientsWithoutOxygen',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.l2PreviousSuspectedCOVIDPatientsWithoutOxygen.prompt, context.user.locale);
            message += `:: ${context.slots.previoushospitaldata.suspected_cases_on_oxygen_without_support_l2}`;
            message += `\n`;
            message += dialog.get_message(messages.l2SuspectedCOVIDPatientsWithoutOxygen.prompt, context.user.locale);
            dialog.sendMessage(context, message);
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            const message = dialog.get_input(event, false);
            if (event.message.type == 'text') {
              context.slots.hospital.suspected_cases_on_oxygen_without_support_l2 = message;
              context.validMessage = true;
            } else {
              context.validMessage = false;
            }
          }),
          always: [
            {
              cond: (context) => context.validMessage,
              target: '#l2TotaldischargedCOVIDPatients',
            },
            {
              target: 'error',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.l2SuspectedCOVIDPatientsWithoutOxygen.error, context.user.locale), false);
          }),
          always: 'prompt',
        },
      },
    },//Number of suspected COVID Patients without Oxygen
    l2TotaldischargedCOVIDPatients: {
      id: 'l2TotaldischargedCOVIDPatients',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.l2PreviousTotaldischargedCOVIDPatients.prompt, context.user.locale);
            message += `:: ${context.slots.previoushospitaldata.discharged_covid_patients_l2}`;
            message += `\n`;
            message += dialog.get_message(messages.l2TotaldischargedCOVIDPatients.prompt, context.user.locale);
            dialog.sendMessage(context, message);
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            const message = dialog.get_input(event, false);
            if (event.message.type == 'text') {
              const message = dialog.get_input(event, false);

              context.slots.hospital.discharged_covid_patients_l2 = message;
              context.validMessage = true;
            } else {
              context.validMessage = false;
            }
          }),
          always: [
            {
              cond: (context) => context.validMessage == false,
              target: 'error',
            },
            {
              cond: (context) => context.validMessage == true,
              target: '#l2TotalCOVIDdeaths',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.l2TotaldischargedCOVIDPatients.error, context.user.locale), false);
          }),
          always: 'prompt',
        },
      },
    },//Total discharged COVID patients till date 
    l2TotalCOVIDdeaths: {
      id: 'l2TotalCOVIDdeaths',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.l2PreviousTotalCOVIDdeaths.prompt, context.user.locale);
            message += `:: ${context.slots.previoushospitaldata.deaths_covid_patients_l2}`;
            message += `\n`;
            message += dialog.get_message(messages.l2TotalCOVIDdeaths.prompt, context.user.locale);
            dialog.sendMessage(context, message);
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            const message = dialog.get_input(event, false);
            if (event.message.type == 'text' && context.slots.previoushospitaldata.hospital_level_Id == '2') {
              context.slots.hospital.confirmed_cases_on_oxygen_without_support_l2 = message;
              context.validMessage = true;
            } else
              if (event.message.type == 'text' && context.slots.previoushospitaldata.hospital_level_Id == '1') {
                context.validMessage = false;
              }
          }),
          always: [
            {
              cond: (context) => context.validMessage == true,
              target: '#l2UpdateHospitalDetails',
            },
            {
              cond: (context) => context.validMessage == false,
              target: '#l3PatientsintubatedwithoutVentilator',
            },
            {
              target: 'error',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.l2TotalCOVIDdeaths.error, context.user.locale), false);
          }),
          always: 'prompt',
        },
      },

    },//Total COVID deaths till date 
    l2AvailableOxygenBeds: {
      id: 'l2AvailableOxygenBeds',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.l2previousAvailableL2OxygenBeds.prompt, context.user.locale);
            message += `\n`;
            message += dialog.get_message(messages.total.prompt, context.user.locale);
            message += `:: ${context.slots.previoushospitaldata.bed_capacity_L2}`;
            message += `\n`;
            message += dialog.get_message(messages.l2availableL2OxygenBeds.prompt, context.user.locale);
            dialog.sendMessage(context, message);
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            if (event.message.type == 'text' && context.slots.previoushospitaldata.hospital_level_Id == '2') {
              const message = dialog.get_input(event, false);
              context.slots.hospital.bed_vacant_L2 = message;
              context.validMessage = true;
            } else
              if (event.message.type == 'text' && context.slots.previoushospitaldata.hospital_level_Id == '1') {
                const message = dialog.get_input(event, false);
                context.validMessage = false;
                context.slots.hospital.bed_vacant_L2 = message;
              }
          }),
          always: [
            {
              cond: (context) => context.validMessage == true,
              target: '#l2HospitalUpdate',
            },
            {
              cond: (context) => context.validMessage == false,
              target: '#l3BedswithoutVentilators',
            },
            {
              target: 'error',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.l2TotalCOVIDdeaths.error, context.user.locale), false);
          }),
          always: 'prompt',
        },
      },
    },//Number of  available  L2 Oxygen beds 
    l2SuspectedCOVIDPatientsOnOxygen: {
      id: 'l2SuspectedCOVIDPatientsOnOxygen',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.l2PreviousSuspectedCOVIDPatientsOnOxygen.prompt, context.user.locale);
            message += `:: ${context.slots.previoushospitaldata.suspected_cases_on_oxygen_support_l2}`;
            message += `\n`;
            message += dialog.get_message(messages.l2SuspectedCOVIDPatientsOnOxygen.prompt, context.user.locale);
            dialog.sendMessage(context, message);
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            const message = dialog.get_input(event, false);
            if (event.message.type == 'text') {
              context.slots.hospital.suspected_cases_on_oxygen_support_l2 = message;
              context.validMessage = true;
            } else {
              context.validMessage = false;
            }
          }),
          always: [
            {
              cond: (context) => context.validMessage,
              target: '#l2SuspectedCOVIDPatientsWithoutOxygen',
            },
            {
              target: 'error',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.l2SuspectedCOVIDPatientsOnOxygen.error, context.user.locale), false);
          }),
          always: 'prompt',
        },
      },
    },//Number of suspected COVID Patients on Oxygen Support
    l2UpdateHospitalDetails: {
      id: 'l2UpdateHospitalDetails',
      invoke: {
        src: (context) => bedsService.updatehospitaldata(context.slots.hospital),
        onDone: [
          {
            actions: assign((context, event) => {
              let message = dialog.get_message(messages.l2SubmitDetails, context.user.locale);
              dialog.sendMessage(context, message);
            }),
            target: '#endstate',
          },
        ],

      },
    },//update L2 existing Details of hospital
    l3Hospital: {
      id: 'l3Hospital',
      initial: 'process',
      states: {
        process: {
          onEntry: assign((context, event) => {
            if (new Date().getHours() >= 14 && new Date().getHours() <= 18) {
              context.isValid = true;
            } else {
              context.isValid = false;
            }
          }),
          always: [
            {
              cond: (context) => context.isValid == false,
              target: '#l3BedswithoutVentilators',
            },
            {
              cond: (context) => context.isValid == true,
              target: '#l3PatientsintubatedwithoutVentilator',
            },
          ],
        },
      },
    },// L2 Hospital comparing time slots
    l3BedswithoutVentilators: {
      id: 'l3BedswithoutVentilators',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.l3PreviousBedswithoutVentilators.prompt, context.user.locale);
            message += `:: ${context.slots.previoushospitaldata.bed_capacity_L3}`;
            message += `\n`;
            message += dialog.get_message(messages.l3BedswithoutVentilators.prompt, context.user.locale);
            dialog.sendMessage(context, message);
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            if (event.message.type == 'text') {
              const message = dialog.get_input(event, false);
              context.slots.hospital.bed_vacant_L3 = message;
              context.validMessage = true;
            } else {
              context.validMessage = false;
            }
          }),
          always: [
            {
              cond: (context) => context.validMessage,
              target: '#l3BedswithVentilators',
            },
            {
              target: 'error',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.l2TotalCOVIDdeaths.error, context.user.locale), false);
          }),
          always: 'prompt',
        },
      },
    },//Number of available  L3 Beds without ventilators 
    l3BedswithVentilators: {
      id: 'l3BedswithVentilators',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.l3PreviousBedswithVentilators.prompt, context.user.locale);
            message += `:: ${context.slots.previoushospitaldata.bed_capacity_icu_L3}`;
            message += `\n`;
            message += dialog.get_message(messages.l3BedswithVentilators.prompt, context.user.locale);
            dialog.sendMessage(context, message);
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            if (event.message.type == 'text' && context.slots.previoushospitaldata.hospital_level_Id == '3') {
              const message = dialog.get_input(event, false);
              context.slots.hospital.bed_capacity_icu_L3 = message;
              context.validMessage = true;
            } else
              if (event.message.type == 'text' && context.slots.previoushospitaldata.hospital_level_Id == '1') {
                {
                  context.validMessage = false;
                }
              }
          }),
          always: [
            {
              cond: (context) => context.validMessage == true,
              target: '#l3PatientsintubatedwithoutVentilator',
            },
            {
              cond: (context) => context.validMessage == false,
              target: '#l2ConfirmedCOVIDPatientsOnOxygen',
            },
            {
              target: 'error',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.l2TotalCOVIDdeaths.error, context.user.locale), false);
          }),
          always: 'prompt',
        },
      },
    },//Number of available  L3 Beds with ventilators 
    l3PatientsintubatedwithoutVentilator: {
      id: 'l3PatientsintubatedwithoutVentilator',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.l3PreviousPatientsintubatedwithoutVentilator.prompt, context.user.locale);
            message += `:: ${context.slots.previoushospitaldata.no_cases_on_icu_niv_without_venti_l3}`;
            message += `\n`;
            message += dialog.get_message(messages.l3PatientsintubatedwithoutVentilator.prompt, context.user.locale);
            dialog.sendMessage(context, message);
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            if (event.message.type == 'text') {
              const message = dialog.get_input(event, false);
              context.slots.hospital.no_cases_on_icu_niv_without_venti_l3 = message;
              context.validMessage = true;
            } else {
              context.validMessage = false;
            }
          }),
          always: [
            {
              cond: (context) => context.validMessage,
              target: '#l3DischargedPatientswithoutVentilator',
            },
            {
              target: 'error',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.l2TotalCOVIDdeaths.error, context.user.locale), false);
          }),
          always: 'prompt',
        },
      },
    },//Number of COVID Patients intubated ( invasive ventilator) L3 ICU (without Ventilator)
    l3DischargedPatientswithoutVentilator: {
      id: 'l3DischargedPatientswithoutVentilator',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.l3PreviousDischargedPatientswithoutVentilator.prompt, context.user.locale);
            message += `:: ${context.slots.previoushospitaldata.discharged_covid_patients_without_venti_l3}`;
            message += `\n`;
            message += dialog.get_message(messages.l3DischargedPatientswithoutVentilator.prompt, context.user.locale);
            dialog.sendMessage(context, message);
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            if (event.message.type == 'text') {
              const message = dialog.get_input(event, false);
              context.slots.hospital.discharged_covid_patients_without_venti_l3 = message;
              context.validMessage = true;
            } else {
              context.validMessage = false;
            }
          }),
          always: [
            {
              cond: (context) => context.validMessage,
              target: '#l3TotalDeathswithoutVentilator',
            },
            {
              target: 'error',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.l2TotalCOVIDdeaths.error, context.user.locale), false);
          }),
          always: 'prompt',
        },
      },
    },//Total discharged COVID patients till date L3 ICU (without Ventilator)
    l3TotalDeathswithoutVentilator: {
      id: 'l3TotalDeathswithoutVentilator',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.l3PreviousTotalDeathswithoutVentilator.prompt, context.user.locale);
            message += `:: ${context.slots.previoushospitaldata.deaths_covid_patients_without_venti_l3}`;
            message += `\n`;
            message += dialog.get_message(messages.l3TotalDeathswithoutVentilator.prompt, context.user.locale);
            dialog.sendMessage(context, message);
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            if (event.message.type == 'text') {
              const message = dialog.get_input(event, false);
              context.slots.hospital.deaths_covid_patients_without_venti_l3 = message;
              context.validMessage = true;
            } else {
              context.validMessage = false;
            }
          }),
          always: [
            {
              cond: (context) => context.validMessage,
              target: '#l3PatientsICUwithVentilator',
            },
            {
              target: 'error',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.l2TotalCOVIDdeaths.error, context.user.locale), false);
          }),
          always: 'prompt',
        },
      },
    },//Total COVID deaths till date L3 ICU (without Ventilator)
    l3PatientsICUwithVentilator: {
      id: 'l3PatientsICUwithVentilator',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.l3PreviousPatientsICUwithVentilator.prompt, context.user.locale);
            message += `:: ${context.slots.previoushospitaldata.no_cases_on_intubated_invasive_venti_l3}`;
            message += `\n`;
            message += dialog.get_message(messages.l3PatientsICUwithVentilator.prompt, context.user.locale);
            dialog.sendMessage(context, message);
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            if (event.message.type == 'text') {
              const message = dialog.get_input(event, false);
              context.slots.hospital.no_cases_on_intubated_invasive_venti_l3 = message;
              context.validMessage = true;
            } else {
              context.validMessage = false;
            }
          }),
          always: [
            {
              cond: (context) => context.validMessage,
              target: '#l3DischargedPatientswithVentilator',
            },
            {
              target: 'error',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.l2TotalCOVIDdeaths.error, context.user.locale), false);
          }),
          always: 'prompt',
        },
      },
    },//Number of COVID patients on ICU/NIV/CPAP/BPAP/HFNO  L3 ICU (With Ventilator)
    l3DischargedPatientswithVentilator: {
      id: 'l3DischargedPatientswithVentilator',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.l3PreviousDischargedPatientswithVentilator.prompt, context.user.locale);
            message += `:: ${context.slots.previoushospitaldata.discharged_covid_patients_with_venti_l3}`;
            message += `\n`;
            message += dialog.get_message(messages.l3DischargedPatientswithVentilator.prompt, context.user.locale);
            dialog.sendMessage(context, message);
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            if (event.message.type == 'text') {
              const message = dialog.get_input(event, false);
              context.slots.hospital.discharged_covid_patients_with_venti_l3 = message;
              context.validMessage = true;
            } else {
              context.validMessage = false;
            }
          }),
          always: [
            {
              cond: (context) => context.validMessage,
              target: '#l3DeathswithVentilator',
            },
            {
              target: 'error',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.l2TotalCOVIDdeaths.error, context.user.locale), false);
          }),
          always: 'prompt',
        },
      },
    },//Total discharged COVID patients till date  L3 ICU (With Ventilator)
    l3DeathswithVentilator: {
      id: 'l3DeathswithVentilator',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.l3PreviousDeathswithVentilator.prompt, context.user.locale);
            message += `:: ${context.slots.previoushospitaldata.deaths_covid_patients_with_venti_l3}`;
            message += `\n`;
            message += dialog.get_message(messages.l3DeathswithVentilator.prompt, context.user.locale);
            dialog.sendMessage(context, message);
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            if (event.message.type == 'text') {
              const message = dialog.get_input(event, false);
              context.slots.hospital.deaths_covid_patients_with_venti_l3 = message;
              context.validMessage = true;
            } else {
              context.validMessage = false;
            }
          }),
          always: [
            {
              cond: (context) => context.validMessage,
              target: '#l2UpdateHospitalDetails',
            },
            {
              target: 'error',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.l2TotalCOVIDdeaths.error, context.user.locale), false);
          }),
          always: 'prompt',
        },
      },
    },//Total COVID deaths till date  L3 ICU (With Ventilator)
    l2l3Hospital: {
      id: 'l2l3Hospital',
      initial: 'process',
      states: {
        process: {
          onEntry: assign((context, event) => {
            if (new Date().getHours() >= 14 && new Date().getHours() <= 18) {
              context.isValid = true;
            } else {
              context.isValid = false;
            }
          }),
          always: [
            {
              cond: (context) => context.isValid == false,
              target: '#l2AvailableOxygenBeds',
            },
            {
              cond: (context) => context.isValid == true,
              target: '#l3BedswithoutVentilators',
            },
          ],
        },
      },
    },// L2L3 Hospital comparing time slots

  },
};

module.exports = hospitalFlow;
