const { assign, actions } = require('xstate');
const moment = require('moment');
const dialog = require('./util/dialog');
const mediaUtil = require('./util/media');
const config = require('../env-variables');
const { messages, grammers } = require('./messages/vitals');
const { personService, vitalsService } = require('./service/service-loader');

const vitalsFlow = {
  id: 'vitalsFlow',
  initial: 'isHomeIsolatedPatient',
  onEntry: assign((context, event) => {
    context.slots.vitals = {};
    context.slots.person = {};
  }),
  states: {
    rmoMobileNumber: {
      id: 'rmoMobileNumber',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.rmoMobileNumber.prompt, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            context.message = dialog.get_input(event, false);
          }),
          invoke: {
            src: (context, event) => vitalsService.getMoAuthorization(context.message),
            onDone: [
              {
                cond: (context, event) => event.data.flag == true,
                actions: assign((context, event) => {
                  console.log(event.data.flag);
                  context.slots.person.mobileNumber = context.message;
                  context.message = undefined;
                }),
                target: '#rmoSrfId',
              },
              {
                target: 'error',
              },
            ],
          },
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.rmoMobileNumber.error), false);
          }),
          always: 'prompt',
        },
      },
    },
    rmoSrfId: {
      id: 'rmoSrfId',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.rmoSrfId.prompt, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            context.message = dialog.get_input(event, false);
          }),
          invoke: {
            src: (context, event) => vitalsService.getPatientDetailsFromSrfId(context.message),
            onDone: [
              {
                actions: assign((context, event) => {
                  context.slots.person.caseId = event.data.list[0].case_id;
                  context.message = undefined;
                  dialog.sendMessage(context, dialog.get_message(messages.rmoMobileNumber.success, context.user.locale), false);
                }),
                target: '#rmoActionToPerformed',
              },
              {
                target: 'error',
              },
            ],
          },
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.rmoSrfId.error), false);
          }),
          always: 'prompt',
        },
      },
    },
    rmoActionToPerformed: {
      id: 'rmoActionToPerformed',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.rmoActionToPerformed.prompt, context.user.locale);
            console.log(message);
            const { prompt, grammer } = dialog.constructListPromptAndGrammer(messages.rmoActionToPerformed.options.list, messages.rmoActionToPerformed.options.messageBundle, context.user.locale);
            context.grammer = grammer;
            message += prompt;
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
          always: [
            {
              cond: (context) => context.intention == 'specializedAdvice',
              actions: assign((context, event) => {
                context.slots.person.isSpecializationRequired = 'yes';
                context.slots.person.isHospitalizationRequired = 'no';
                context.slots.person.isPatientStable='no';
              }),
              target: '#doctorRemark',

            },
            {
              cond: (context) => context.intention == 'hospitalization',
              actions: assign((context, event) => {
                context.slots.person.isHospitalizationRequired = 'yes';
                context.slots.person.isSpecializationRequired = 'no';
                context.slots.person.isPatientStable='no';
              }),
              target: '#doctorRemark',
            },
            ,
            {
              cond: (context) => context.intention == 'patientStable',
              actions: assign((context, event) => {
                context.slots.person.isHospitalizationRequired = 'no';
                context.slots.person.isSpecializationRequired = 'no';
                context.slots.person.isPatientStable='yes';

              }),
              target: '#doctorRemark',
            },
            {
              target: 'error',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.optionsRetry, context.user.locale), false);
          }),
          always: 'prompt',
        },
      },
    },
    doctorRemark: {
      id: 'doctorRemark',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.doctorRemark.prompt, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            context.message = dialog.get_input(event, false);
            console.log(context.message);
            console.log(context.slots.person.isSpecializationRequired);
          }),
          invoke: {
            src: (context, event) => vitalsService.getMoSubmitReport(context.slots.person.caseId, context.slots.person.mobileNumber,
              context.message, context.slots.person.isSpecializationRequired, context.slots.person.isHospitalizationRequired,context.slots.person.isPatientStable),
            onDone: [
              {
                actions: assign((context, event) => {
                  context.slots.person.caseId = context.message;
                  context.persons = event.data;

                  const mediaMessage = mediaUtil.createMediaMessage(`${config.staticMediaPath}/controlRoom_contact_numbers`, 'jpeg', undefined, '');
                  dialog.sendMessage(context, dialog.get_message(messages.moReportSubmit, context.user.locale), false);
                  dialog.sendMessage(context, mediaMessage);
                }),
                target: '#endstate',
              },
              {
                target: 'error',
              },
            ],
          },
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.noUserFound, context.user.locale), false);
          }),
          always: 'prompt',
        },
      },
    },
    rrtLocation: {
      id: 'rrtLocation',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            const mediaMessage = mediaUtil.createMediaMessage(`${config.staticMediaPath}/location_sharing_info`, 'jpeg', undefined, '');
            dialog.sendMessage(context, mediaMessage, false);
            dialog.sendMessage(context, dialog.get_message(messages.rrtLocation.prompt, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },

        process: {
          onEntry: assign((context, event) => {
            if (event.message.type === 'location') {
              const str = event.message.input.toString().substring(1, event.message.input.length - 1);
              const latlong = str.split(',');
              const latitude = latlong[0];
              const longitude = latlong[1];
              input = `(${latitude},${longitude})`;
              context.slots.vitals.longitude = longitude;
              context.slots.vitals.latitude = latitude;
              context.isValid = true;
            } else {
              context.isValid = false;
            }
          }),
          always: [
            {
              cond: (context) => context.isValid == false,
              target: 'error',
            },
            {
              target: '#rrtMobileNumber',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.rrtLocation.error, context.user.locale), false);
          }),
          always: 'prompt',
        },
      },
    },
    rrtMobileNumber: {
      id: 'rrtMobileNumber',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
          //  dialog.sendMessage(context, dialog.get_message(messages.rrtMobileNumber.prompt, context.user.locale));
            // let mediaMessage = mediaUtil.createMediaMessage(`${config.staticMediaPath}/pulse_oximeter`, 'jpeg', context.user.locale, '');
            // dialog.sendMessage(context, mediaMessage, false);
            dialog.sendMessage(context, dialog.get_message(messages.rrtMobileNumber.prompt, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            context.message = dialog.get_input(event, false);
          }),
          invoke: {
            src: (context, event) => vitalsService.getPatientDetailsFromMobileNumber(context.message),
            onDone: [
              {
                cond: (context, event) => event.data.data === null,
                actions: assign((context, event) => {
                  context.persons = event.data;
                }),
                target: 'error',
              },
              {
                cond: (context, event) => event.data.data.length >= 1,
                actions: assign((context, event) => {
                  context.persons = event.data;
                }),
                target: '#selectPerson',
              },
              {
                target: 'error',
              },
            ],
          },
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.noUserFound, context.user.locale), false);
          }),
          always: 'prompt',
        },
      },
    },
    selectPerson: {
      id: 'selectPerson',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.selectPerson, context.user.locale);
            const grammer = [];
            context.slots.person = {};
            for (let i = 0; i < event.data.data.length; i++) {
              const person = event.data.data[i];

              const grammerItem = { intention: event.data.data[i], recognize: [(i + 1).toString()] };

              grammer.push(grammerItem);
              message += `\n${i + 1}. ${event.data.data[i].MASTER_NAME}`;
            }
            context.grammer = grammer;
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
          always: [
            {
              cond: (context) => context.intention == dialog.INTENTION_UNKOWN,
              target: 'error',
            },
            {
              actions: assign((context, event) => {
                context.slots.person.MASTER_ID = context.intention.MASTER_ID;
                context.slots.person.com_status = context.intention.com_status;
                context.slots.person.fateh_kit_delivered = context.intention.fateh_kit_delivered;
                context.slots.person.data_source_type = context.intention.data_source_type;
                context.slots.person.rrt = 'YES';
              }),
              target: '#temperature',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.optionsRetry, context.user.locale), false);
          }),
          always: 'prompt',
        },
      },
    },
    isHomeIsolatedPatient: {
      id: 'isHomeIsolatedPatient',
      invoke: {
        src: (context) => personService.isHomeIsolatedPatient(context.user.mobileNumber),
        onDone: [
          {
            cond: (context, event) => event.data == false,
            actions: assign((context, event) => {
              dialog.sendMessage(context, dialog.get_message(messages.notHomeIsolatedPatient, context.user.locale), false);
              context.slots.person.com_status = '0';
              context.slots.person.fateh_kit_delivered = 'NO';
              context.slots.person.data_source_type ='';
              context.slots.person.rrt = 'NO';
            }),
            target: '#registerPatient',
          },
          {
            target: '#temperature',
          },
        ],
      },
    },
    registerPatient: {
      id: 'registerPatient',
      initial: 'personName',
      onEntry: assign((context, event) => {
        context.slots.registerPatient = {};
      }),
      states: {
        personName: {
          id: 'personName',
          initial: 'prompt',
          states: {
            prompt: {
              onEntry: assign((context, event) => {
                dialog.sendMessage(context, dialog.get_message(messages.registerPatient.personName.prompt, context.user.locale));
              }),
              on: {
                USER_MESSAGE: 'process',
              },
            },
            process: {
              onEntry: assign((context, event) => {
                const message = dialog.get_input(event, false);
                if (event.message.type == 'text' && message.length < 100 && /^[ A-Za-z]+$/.test(message.trim())) {
                  context.slots.registerPatient.name = message;
                  context.validMessage = true;
                } else {
                  context.validMessage = false;
                }
              }),
              always: [
                {
                  cond: (context) => context.validMessage,
                  target: '#personAge',
                },
                {
                  target: 'error',
                },
              ],
            },
            error: {
              onEntry: assign((context, event) => {
                dialog.sendMessage(context, dialog.get_message(messages.registerPatient.personName.error, context.user.locale), false);
              }),
              always: 'prompt',
            },
          },
        }, // personName
        personAge: {
          id: 'personAge',
          initial: 'prompt',
          states: {
            prompt: {
              onEntry: assign((context, event) => {
                let message = dialog.get_message(messages.registerPatient.personAge.prompt, context.user.locale);
                message = message.replace('{{name}}', context.slots.registerPatient.name);
                dialog.sendMessage(context, message);
              }),
              on: {
                USER_MESSAGE: 'process',
              },
            },
            process: {
              onEntry: assign((context, event) => {
                if (event.message.type == 'text') {
                  const age = parseInt(dialog.get_input(event, false));
                  if (age > 0 && age < 120) {
                    context.slots.registerPatient.age = age;
                    context.validMessage = true;
                    return;
                  }
                }
                context.validMessage = false;
              }),
              always: [
                {
                  cond: (context) => context.validMessage,
                  target: '#personGender',
                },
                {
                  target: 'error',
                },
              ],
            },
            error: {
              onEntry: assign((context, event) => {
                dialog.sendMessage(context, dialog.get_message(messages.registerPatient.personAge.error, context.user.locale), false);
              }),
              always: 'prompt',
            },
          },
        }, // personAge
        personGender: {
          id: 'personGender',
          initial: 'prompt',
          states: {
            prompt: {
              onEntry: assign((context, event) => {
                const { grammer, prompt } = dialog.constructListPromptAndGrammer(messages.registerPatient.personGender.options.list, messages.registerPatient.personGender.options.messageBundle, context.user.locale);
                context.grammer = grammer;
                const message = `${dialog.get_message(messages.registerPatient.personGender.prompt, context.user.locale)}\n${prompt}`;
                dialog.sendMessage(context, message);
              }),
              on: {
                USER_MESSAGE: 'process',
              },
            },
            process: {
              onEntry: assign((context, event) => {
                context.intention = dialog.get_intention(context.grammer, event);
              }),
              always: [
                {
                  cond: (context) => context.intention == dialog.INTENTION_UNKOWN,
                  target: 'error',
                },
                {
                  actions: assign((context, event) => {
                    context.slots.registerPatient.gender = context.intention;
                  }),
                  target: '#district',
                },
              ],
            },
            error: {
              onEntry: assign((context, event) => {
                dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.optionsRetry, context.user.locale), false);
              }),
              always: 'prompt',
            },
          },
        }, // personGender
        district: {
          id: 'district',
          initial: 'prompt',
          states: {
            prompt: {
              onEntry: assign((context, event) => {
                const districts = messages.registerPatient.district.prompt.options;
                const { prompt, grammer } = dialog.constructListPromptAndGrammer(districts.list, districts.messageBundle, context.user.locale);
                let message = dialog.get_message(messages.registerPatient.district.prompt.preamble, context.user.locale);
                message += prompt;
                context.grammer = grammer;
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
              always: [
                {
                  cond: (context) => context.intention == dialog.INTENTION_UNKOWN,
                  target: 'error',
                },
                {
                  actions: assign((context, event) => {
                    context.slots.registerPatient.district = context.intention;
                  }),
                  target: '#address',
                },
              ],
            },
            error: {
              onEntry: assign((context, event) => {
                dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.retry, context.user.locale), false);
              }),
              always: 'prompt',
            },
          },
        },
        address: {
          id: 'address',
          initial: 'prompt',
          states: {
            prompt: {
              onEntry: assign((context, event) => {
                dialog.sendMessage(context, dialog.get_message(messages.registerPatient.address.prompt, context.user.locale));
              }),
              on: {
                USER_MESSAGE: 'process',
              },
            },
            process: {
              onEntry: assign((context, event) => {
                context.slots.registerPatient.address = dialog.get_input(event, false);
              }),
              always: '#symptomsDate',
            },
          },
        },
        symptomsDate: {
          id: 'symptomsDate',
          initial: 'prompt',
          states: {
            prompt: {
              onEntry: assign((context, event) => {
                dialog.sendMessage(context, dialog.get_message(messages.registerPatient.symptomsDate.prompt, context.user.locale));
              }),
              on: {
                USER_MESSAGE: 'process',
              },
            },
            process: {
              onEntry: assign((context, event) => {
                const input = dialog.get_input(event);
                const date = moment(input, 'D/M/YY', true);
                context.isValid = date.isValid();
                if (context.isValid) {
                  context.slots.registerPatient.symptomsDate = date.format('YYYY-MM-DD HH:MM:SS').toString();
                }
              }),
              always: [
                {
                  cond: (context) => context.isValid == false,
                  target: 'error',
                },
                {
                  target: '#covidPositiveDate',
                },
              ],
            },
            error: {
              onEntry: assign((context, event) => {
                dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.retry, context.user.locale), false);
              }),
              always: 'prompt',
            },
          },
        },
        covidPositiveDate: {
          id: 'covidPositiveDate',
          initial: 'prompt',
          states: {
            prompt: {
              onEntry: assign((context, event) => {
                dialog.sendMessage(context, dialog.get_message(messages.registerPatient.covidPositiveDate.prompt, context.user.locale));
              }),
              on: {
                USER_MESSAGE: 'process',
              },
            },
            process: {
              onEntry: assign((context, event) => {
                const input = dialog.get_input(event);
                const date = moment(input, 'D/M/YY', true);
                context.isValid = date.isValid();
                if (context.isValid) {
                  context.slots.registerPatient.covidPositiveDate = date.format('YYYY-MM-DD HH:MM:SS').toString();
                }
              }),
              always: [
                {
                  cond: (context) => context.isValid == false,
                  target: 'error',
                },
                {
                  target: '#registerPatientSrfId',
                },
              ],
            },
            error: {
              onEntry: assign((context, event) => {
                dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.retry, context.user.locale), false);
              }),
              always: 'prompt',
            },
          },
        },
        registerPatientSrfId: {
          id: 'registerPatientSrfId',
          initial: 'prompt',
          states: {
            prompt: {
              onEntry: assign((context, event) => {
                dialog.sendMessage(context, dialog.get_message(messages.registerPatient.registerPatientSrfId.prompt, context.user.locale));
              }),
              on: {
                USER_MESSAGE: 'process',
              },
            },
            process: {
              onEntry: assign((context, event) => {
                context.slots.registerPatient.srfId = dialog.get_input(event);
              }),
              always: '#addPatient',
            },
          },
        },
        addPatient: {
          id: 'addPatient',
          invoke: {
            src: (context) => vitalsService.addPatient(context.user, context.slots.registerPatient),
            onDone: {
              actions: assign((context, event) => {
                dialog.sendMessage(context, dialog.get_message(messages.registerPatient.registeredPatientSuccess, context.user.locale), false);
              }),
              target: '#temperature',
            },
          },
        },
      },
    },
    temperature: {
      id: 'temperature',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.temperature.prompt, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            const input = dialog.get_input(event);
            const temperature = parseFloat(input);
            if (temperature >= 92 && temperature <= 108) {
              context.isValid = true;
              context.slots.vitals.temperature = temperature;
            } else {
              context.isValid = false;
            }
          }),
          always: [
            {
              cond: (context) => context.isValid == false,
              target: 'error',
            },
            {
              target: '#pulse',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.temperature.error, context.user.locale), false);
          }),
          always: 'prompt',
        },
      },
    }, // temperature
    pulse: {
      id: 'pulse',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.pulse.prompt, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            const pulse = parseInt(dialog.get_input(event));
            if (pulse >= 10 && pulse <= 500) {
              context.isValid = true;
              context.slots.vitals.pulse = pulse;
            } else {
              context.isValid = false;
            }
          }),
          always: [
            {
              cond: (context) => context.isValid == false,
              target: 'error',
            },
            {
              target: '#spo2',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.retry, context.user.locale), false);
          }),
          always: 'prompt',
        },
      },
    }, // pulse
    spo2: {
      id: 'spo2',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            const mediaMessage = mediaUtil.createMediaMessage(`${config.staticMediaPath}/pulse_oximeter`, 'jpeg', context.user.locale, '');
            dialog.sendMessage(context, mediaMessage, false);
            dialog.sendMessage(context, dialog.get_message(messages.spo2.prompt, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            const spo2 = parseInt(dialog.get_input(event));
            if (spo2 >= 0 && spo2 <= 100) {
              context.isValid = true;
              context.slots.vitals.spo2 = spo2;
            } else {
              context.isValid = false;
            }
          }),
          always: [
            {
              cond: (context) => context.isValid == false,
              target: 'error',
            },
            {
              target: '#symptoms',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.retry, context.user.locale), false);
          }),
          always: 'prompt',
        },
      },
    }, // spo2
    symptoms: {
      id: 'symptoms',
      initial: 'lossOfSmellTaste',
      onEntry: assign((context, event) => {
        context.slots.vitals.symptoms = {};
      }),
      states: {
        lossOfSmellTaste: {
          id: 'lossOfSmellTaste',
          initial: 'prompt',
          states: {
            prompt: {
              onEntry: assign((context, event) => {
                context.grammer = grammers.binaryChoice.grammer;
                let message = dialog.get_message(messages.symptoms.lossOfSmellTaste.prompt, context.user.locale);
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
              always: [
                {
                  cond: (context) => context.grammer == dialog.INTENTION_UNKOWN,
                  target: 'error',
                },
                {
                  actions: assign((context, event) => {
                    context.slots.vitals.symptoms.lossOfSmellTaste = context.intention;
                  }),
                  target: '#fluLikeSymptoms',
                },
              ],
            },
            error: {
              onEntry: assign((context, event) => {
                dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.optionsRetry, context.user.locale), false);
              }),
              always: 'prompt',
            },
          },
        },
        fluLikeSymptoms: {
          id: 'fluLikeSymptoms',
          initial: 'prompt',
          states: {
            prompt: {
              onEntry: assign((context, event) => {
                context.grammer = grammers.binaryChoice.grammer;
                let message = dialog.get_message(messages.symptoms.fluLikeSymptoms.prompt, context.user.locale);
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
              always: [
                {
                  cond: (context) => context.grammer == dialog.INTENTION_UNKOWN,
                  target: 'error',
                },
                {
                  actions: assign((context, event) => {
                    context.slots.vitals.symptoms.fluLikeSymptoms = context.intention;
                  }),
                  target: '#respiratoryIssues',
                },
              ],
            },
            error: {
              onEntry: assign((context, event) => {
                dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.optionsRetry, context.user.locale), false);
              }),
              always: 'prompt',
            },
          },
        },
        respiratoryIssues: {
          id: 'respiratoryIssues',
          initial: 'prompt',
          states: {
            prompt: {
              onEntry: assign((context, event) => {
                context.grammer = grammers.binaryChoice.grammer;
                let message = dialog.get_message(messages.symptoms.respiratoryIssues.prompt, context.user.locale);
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
              always: [
                {
                  cond: (context) => context.grammer == dialog.INTENTION_UNKOWN,
                  target: 'error',
                },
                {
                  actions: assign((context, event) => {
                  context.slots.vitals.symptoms.respiratoryIssues = context.intention;
                  }),
                  target: '#comorbidities'
                  
                },
                ],
            },
            error: {
              onEntry: assign((context, event) => {
                dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.optionsRetry, context.user.locale), false);
              }),
              always: 'prompt',
            },
          },
        },
        comorbidities: {
          id: 'comorbidities',
          initial: 'prompt',
          states: {
            prompt: {
              onEntry: assign((context, event) => {
                context.grammer = grammers.binaryChoice.grammer;
                let message = dialog.get_message(messages.symptoms.comorbidities.prompt, context.user.locale);
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
              always: [
                {
                  cond: (context) => context.grammer == dialog.INTENTION_UNKOWN,
                  target: 'error',
                },
                {
                  cond: (context, event) => context.intention === 'YES',
                  actions: assign((context, event) => {
                    context.slots.vitals.symptoms.comorbidities = context.intention;
                    context.slots.vitals.symptoms.ComHeart = 'NO';
                    context.slots.vitals.symptoms.ComKidney = 'NO';
                    context.slots.vitals.symptoms.ComCancer = 'NO';
                  }),
                  target: '#heartrelated',
                },
                {
                  actions: assign((context, event) => {
                    context.slots.vitals.symptoms.comorbidities = context.intention;
                  }),
                  target: '#diabetes',
                },
              ],
            },
            error: {
              onEntry: assign((context, event) => {
                dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.optionsRetry, context.user.locale), false);
              }),
              always: 'prompt',
            },
          },
        },
        diabetes: {
          id: 'diabetes',
          initial: 'prompt',
          states: {
            prompt: {
              onEntry: assign((context, event) => {
                context.grammer = grammers.binaryChoice.grammer;
                let message = dialog.get_message(messages.symptoms.diabetes.prompt, context.user.locale);
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
              always: [
                {
                  cond: (context) => context.grammer == dialog.INTENTION_UNKOWN,
                  target: 'error',
                },
                {
                  cond: (context, event) => context.slots.person.fateh_kit_delivered === 'YES',
                  actions: assign((context, event) => {
                    context.slots.vitals.symptoms.diabetes = context.intention;
                  }),
                  target: '#addVitals',
                },
                {
                  cond: (context, event) => context.slots.person.fateh_kit_delivered === 'NO',
                  actions: assign((context, event) => {
                    context.slots.vitals.symptoms.diabetes = context.intention;
                  }),
                  target: '#fatehKitDelivery',
                },
                {
                  actions: assign((context, event) => {
                    context.slots.vitals.symptoms.diabetes = context.intention;
                  }),
                  target: '#addVitals',
                },

              ],
            },
            error: {
              onEntry: assign((context, event) => {
                dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.optionsRetry, context.user.locale), false);
              }),
              always: 'prompt',
            },
          },
        },
        fatehKitDelivery: {
          id: 'fatehKitDelivery',
          initial: 'prompt',
          states: {
            prompt: {
              onEntry: assign((context, event) => {
                context.grammer = grammers.binaryChoice.grammer;
                let message = dialog.get_message(messages.fatehkit.prompt, context.user.locale);
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
              always: [
                {
                  cond: (context) => context.grammer == dialog.INTENTION_UNKOWN,
                  target: 'error',
                },
                {
                  actions: assign((context, event) => {
                    context.slots.vitals.symptoms.FatehKitsDelivered = context.intention;
                  }),
                  target: '#addVitals',
                },
              ],
            },
            error: {
              onEntry: assign((context, event) => {
                dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.optionsRetry, context.user.locale), false);
              }),
              always: 'prompt',
            },
          },
        },
        heartrelated: {
          id: 'heartrelated',
          initial: 'prompt',
          states: {
            prompt: {
              onEntry: assign((context, event) => {
                context.grammer = grammers.binaryChoice.grammer;
                let message = dialog.get_message(messages.heartrelated.prompt, context.user.locale);
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
              always: [
                {
                  cond: (context) => context.grammer == dialog.INTENTION_UNKOWN,
                  target: 'error',
                },
                {
                  actions: assign((context, event) => {
                    context.slots.vitals.symptoms.ComHeart = context.intention;
                  }),
                  target: '#kidneyrelated',
                },
              ],
            },
            error: {
              onEntry: assign((context, event) => {
                dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.optionsRetry, context.user.locale), false);
              }),
              always: 'prompt',
            },
          },
        },
        kidneyrelated: {
          id: 'kidneyrelated',
          initial: 'prompt',
          states: {
            prompt: {
              onEntry: assign((context, event) => {
                context.grammer = grammers.binaryChoice.grammer;
                let message = dialog.get_message(messages.kidneyrelated.prompt, context.user.locale);
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
              always: [
                {
                  cond: (context) => context.grammer == dialog.INTENTION_UNKOWN,
                  target: 'error',
                },
                {
                  actions: assign((context, event) => {
                    context.slots.vitals.symptoms.ComKidney = context.intention;
                  }),
                  target: '#cancerrelated',
                },
              ],
            },
            error: {
              onEntry: assign((context, event) => {
                dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.optionsRetry, context.user.locale), false);
              }),
              always: 'prompt',
            },
          },
        },
        cancerrelated: {
          id: 'cancerrelated',
          initial: 'prompt',
          states: {
            prompt: {
              onEntry: assign((context, event) => {
                context.grammer = grammers.binaryChoice.grammer;
                let message = dialog.get_message(messages.cancerrelated.prompt, context.user.locale);
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
              always: [
                {
                  cond: (context) => context.grammer == dialog.INTENTION_UNKOWN,
                  target: 'error',
                },
                {
                  actions: assign((context, event) => {
                    context.slots.vitals.symptoms.ComCancer = context.intention;
                  }),
                  target: '#diabetes',
                },
              ],
            },
            error: {
              onEntry: assign((context, event) => {
                dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.optionsRetry, context.user.locale), false);
              }),
              always: 'prompt',
            },
          },
        },
      },
    }, // symptoms
    addVitals: {
      id: 'addVitals',
      invoke: {
        src: (context) => vitalsService.addVitals(context.user, context.slots.vitals, context.slots.person),
        onDone: [
          {
            cond: (context, event) => context.slots.person.rrt === 'NO',
            actions: assign((context, event) => {
              const mediaMessage = mediaUtil.createMediaMessage(`${config.staticMediaPath}/controlRoom_contact_numbers`, 'jpeg', undefined, '');
              dialog.sendMessage(context, dialog.get_message(messages.addVitals, context.user.locale), false);
              dialog.sendMessage(context, mediaMessage);
            }),
            target: '#endstate',
          },
          {
            cond: (context, event) => context.slots.person.rrt === 'YES',
            actions: assign((context, event) => {
              const mediaMessage = mediaUtil.createMediaMessage(`${config.staticMediaPath}/controlRoom_contact_numbers`, 'jpeg', undefined, '');
              dialog.sendMessage(context, dialog.get_message(messages.submitData, context.user.locale), false);
              dialog.sendMessage(context, mediaMessage);
            }),
            target: '#endstate',
          },
        ],

      },
    },
  },
};

module.exports = vitalsFlow;
