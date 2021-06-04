const { assign, actions } = require('xstate');
const moment = require('moment');
const dialog = require('./util/dialog');
const mediaUtil = require('./util/media');
const config = require('../env-variables');
const { messages, grammers } = require('./messages/vitals');
const { personService, vitalsService } = require('./service/service-loader');
const { context } = require('./chat-machine');

const vitalsFlow = {
  id: 'vitalsFlow',
  initial: 'isHomeIsolatedPatient',
  onEntry: assign((context, event) => {
    context.slots.vitals = {};
  }),
  states: {
    rrtSrfId: {
      id: 'rrtSrfId',
      initial: 'prompt',
      states: {
       prompt: {
         onEntry: assign((context, event) => {
           dialog.sendMessage(context, dialog.get_message(messages.rrtSrfId.prompt, context.user.locale));
          }),
         on: {
            USER_MESSAGE: 'process'
          }
        },
        process: {
          onEntry: assign((context, event) => {
            context.message = dialog.get_input(event, false);
          }),
          invoke: {
            src: (context, event) => vitalsService.getPatientDetailsFromSrfId(context.message),
            onDone: [
              {
                cond: (context, event) => event.data.response === 1,
                actions: assign((context, event) => {
                  context.slots.vitals.srfId = context.message;
                  context.slots.vitals.mobile_no = event.data.data[0].mobile_no;
                  context.message = undefined;
                  dialog.sendMessage(context, dialog.get_message(messages.rrtSrfId.success, context.user.locale), false);
                }),
                target: '#temperature'
              },
              {
                target: 'error'
              }
            ]
          }
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.rrtSrfId.error), false);
          }),
          always: 'prompt'
        }
     }
    },
    patrmo: {
      id: 'patrmo',
      initial: 'prompt',
      states: {
       prompt: {
         onEntry: assign((context, event) => {
           dialog.sendMessage(context, dialog.get_message(messages.rrtSrfId.prompt, context.user.locale));
          }),
         on: {
            USER_MESSAGE: 'process'
          }
        },
        process: {
          onEntry: assign((context, event) => {
            context.message = dialog.get_input(event, false);
          }),
          invoke: {
            src: (context, event) => vitalsService.getPatientDetailsFromSrfId(context.message),
            onDone: [
              {
                cond: (context, event) => event.data.response === 1,
                actions: assign((context, event) => {
                  context.slots.vitals.srfId = context.message;
                  context.slots.vitals.mobile_no = event.data.data[0].mobile_no;
                  context.message = undefined;
                  dialog.sendMessage(context, dialog.get_message(messages.rrtSrfId.success, context.user.locale), false);
                }),
                target: '#temperature'
              },
              {
                target: 'error'
              }
            ]
          }
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.rrtSrfId.error), false);
          }),
          always: 'prompt'
        }
     }
    },
    rrtMobileNumber: {
      id: 'rrtMobileNumber',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.rrtMobileNumber.prompt, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process'
          }
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
                target: 'error'
              },
              {
                cond: (context, event) => event.data.data.length >= 1,
                actions: assign((context, event) => {
                  console.log(event.data.data.length)
                  context.slots.vitals.persons = event.data;
                  
                }),
                target: '#selectPerson'
              },
              {
                target: 'error'
              }
            ]
          }
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.noUserFound, context.user.locale), false);
          }),
          always: 'prompt'
        }
      }
    },
    selectPerson: {
      id: 'selectPerson',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.selectPerson, context.user.locale);
            let grammer = [];

            for (let i = 0; i < event.data.data.length; i++) {
              let person = event.data.data[i];

              let grammerItem = { intention: event.data.data[i], recognize: [(i + 1).toString()] };

              grammer.push(grammerItem);
              message += '\n' + (i + 1) + '. ' + event.data.data[i].MASTER_NAME + '\n  com_status : '+event.data.data[i].com_status+'\n  fateh_kit_delivered : '+event.data.data[i].fateh_kit_delivered;
            }
            context.grammer = grammer;
            dialog.sendMessage(context, message);
          }),
          on: {
            USER_MESSAGE: 'process'
          }
        },
        process: {
          onEntry: assign((context, event) => {
            context.intention = dialog.get_intention(context.grammer, event, true);
          }),
          always: [
            {
              cond: (context) => context.intention == dialog.INTENTION_UNKOWN,
              target: 'error'
            },
            {
              actions: assign((context, event) => {
                context.slots.vitals.MASTER_ID = context.intention.MASTER_ID;
                context.slots.vitals.com_status = context.intention.com_status;
                context.slots.vitals.fateh_kit_delivered = context.intention.fateh_kit_delivered;

              }),
              target: '#temperature'
            }
          ]
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.optionsRetry, context.user.locale), false);
          }),
          always: 'prompt'
        }
      }
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
            }),
            target: '#registerPatient'
          },
          {
            target: '#temperature'
          }
        ]
      }
    },
    notHomeIsolatedPatient:{            // To handle any user who is at this state when the update was pushed
      id: 'notHomeIsolatedPatient',
      always: 'registerPatient',
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
                USER_MESSAGE: 'process'
              }
            },
            process: {
              onEntry: assign((context, event) => {
                let message = dialog.get_input(event, false);
                if (event.message.type == 'text' && message.length < 100 && /^[ A-Za-z]+$/.test(message.trim())) {
                  context.slots.registerPatient.name = message
                  context.validMessage = true;
                } else {
                  context.validMessage = false;
                }
              }),
              always: [
                {
                  cond: (context) => context.validMessage,
                  target: '#personAge'
                },
                {
                  target: 'error'
                }
              ]
            },
            error: {
              onEntry: assign((context, event) => {
                dialog.sendMessage(context, dialog.get_message(messages.registerPatient.personName.error, context.user.locale), false);
              }),
              always: 'prompt'
            }
          }
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
                USER_MESSAGE: 'process'
              }
            },
            process: {
              onEntry: assign((context, event) => {
                if (event.message.type == 'text') {
                  let age = parseInt(dialog.get_input(event, false));
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
                  target: '#personGender'
                },
                {
                  target: 'error'
                }
              ]
            },
            error: {
              onEntry: assign((context, event) => {
                dialog.sendMessage(context, dialog.get_message(messages.registerPatient.personAge.error, context.user.locale), false);
              }),
              always: 'prompt'
            }
          }
        }, // personAge
        personGender: {
          id: 'personGender',
          initial: 'prompt',
          states: {
            prompt: {
              onEntry: assign((context, event) => {
                let { grammer, prompt } = dialog.constructListPromptAndGrammer(messages.registerPatient.personGender.options.list, messages.registerPatient.personGender.options.messageBundle, context.user.locale);
                context.grammer = grammer;
                let message = dialog.get_message(messages.registerPatient.personGender.prompt, context.user.locale) + '\n' + prompt;
                dialog.sendMessage(context, message);
              }),
              on: {
                USER_MESSAGE: 'process'
              }
            },
            process: {
              onEntry: assign((context, event) => {
                context.intention = dialog.get_intention(context.grammer, event);
              }),
              always: [
                {
                  cond: (context) => context.intention == dialog.INTENTION_UNKOWN,
                  target: 'error'
                },
                {
                  actions: assign((context, event) => {
                    context.slots.registerPatient.gender = context.intention;
                  }),
                  target: '#district'
                }
              ]
            },
            error: {
              onEntry: assign((context, event) => {
                dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.optionsRetry, context.user.locale), false);
              }),
              always: 'prompt'
            }
          }
        }, // personGender
        district: {
          id: 'district',
          initial: 'prompt',
          states: {
            prompt: {
              onEntry: assign((context, event) => {
                let districts = messages.registerPatient.district.prompt.options;
                let { prompt, grammer } = dialog.constructListPromptAndGrammer(districts.list, districts.messageBundle, context.user.locale);
                let message = dialog.get_message(messages.registerPatient.district.prompt.preamble, context.user.locale);
                message += prompt;
                context.grammer = grammer;
                dialog.sendMessage(context, message);
              }),
              on: {
                USER_MESSAGE: 'process'
              }
            },
            process: {
              onEntry: assign((context, event) => {
                context.intention = dialog.get_intention(context.grammer, event, true);
              }),
              always: [
                {
                  cond: (context) => context.intention == dialog.INTENTION_UNKOWN,
                  target: 'error'
                },
                {
                  actions: assign((context, event) => {
                    context.slots.registerPatient.district = context.intention;
                  }),
                  target: '#address'
                }
              ]
            },
            error: {
              onEntry: assign((context, event) => {
                dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.retry, context.user.locale), false);
              }),
              always: 'prompt'
            }
          }
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
                USER_MESSAGE: 'process'
              }
            },
            process: {
              onEntry: assign((context, event) => {
                context.slots.registerPatient.address = dialog.get_input(event, false);
              }),
              always: '#symptomsDate'
            },
          }
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
                USER_MESSAGE: 'process'
              }
            },
            process: {
              onEntry: assign((context, event) => {
                let input = dialog.get_input(event);
                let date = moment(input, 'D/M/YY', true);
                context.isValid = date.isValid();
                if(context.isValid) {
                  context.slots.registerPatient.symptomsDate = date.format('YYYY-MM-DD HH:MM:SS').toString();
                } 
              }),
              always: [
                {
                  cond: (context) => context.isValid == false,
                  target: 'error'
                },
                {
                  target: '#covidPositiveDate'
                }
              ]
            },
            error: {
              onEntry: assign((context, event) => {
                dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.retry, context.user.locale), false);
              }),
              always: 'prompt'
            }
          }
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
                USER_MESSAGE: 'process'
              }
            },
            process: {
              onEntry: assign((context, event) => {
                let input = dialog.get_input(event);
                let date = moment(input, 'D/M/YY', true);
                context.isValid = date.isValid();
                if(context.isValid) {
                  context.slots.registerPatient.covidPositiveDate = date.format('YYYY-MM-DD HH:MM:SS').toString();
                } 
              }),
              always: [
                {
                  cond: (context) => context.isValid == false,
                  target: 'error'
                },
                {
                  target: '#registerPatientSrfId'
                }
              ]
            },
            error: {
              onEntry: assign((context, event) => {
                dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.retry, context.user.locale), false);
              }),
              always: 'prompt'
            }
          }
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
                USER_MESSAGE: 'process'
              }
            },
            process: {
              onEntry: assign((context, event) => {
                context.slots.registerPatient.srfId = dialog.get_input(event);
              }),
              always: '#addPatient'
            },
          }
        },
        addPatient: {
          id: 'addPatient',
          invoke: {
            src: (context) => vitalsService.addPatient(context.user, context.slots.registerPatient),
            onDone: {
              actions: assign((context, event) => {
                dialog.sendMessage(context, dialog.get_message(messages.registerPatient.registeredPatientSuccess, context.user.locale), false);
              }),
              target: '#temperature'
            }
          }
        }
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
            USER_MESSAGE: 'process'
          }
        },
        process: {
          onEntry: assign((context, event) => {
            let input = dialog.get_input(event);
            let temperature = parseFloat(input);
            if(temperature >= 92 && temperature <= 108) {
              context.isValid = true;
              context.slots.vitals.temperature = temperature;
            } else {
              context.isValid = false;
            }
          }),
          always: [
            {
              cond: (context) => context.isValid == false,
              target: 'error'
            },
            {
              target: '#pulse'
            }
          ]
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.temperature.error, context.user.locale), false);
          }),
          always: 'prompt'
        }
      }
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
            USER_MESSAGE: 'process'
          }
        },
        process: {
          onEntry: assign((context, event) => {
            let pulse = parseInt(dialog.get_input(event));
            if(pulse >= 10 && pulse <= 500) {
              context.isValid = true;
              context.slots.vitals.pulse = pulse;
            } else {
              context.isValid = false;
            }
          }),
          always: [
            {
              cond: (context) => context.isValid == false,
              target: 'error'
            },
            {
              target: '#spo2'
            }
          ]
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.retry, context.user.locale), false);
          }),
          always: 'prompt'
        }
      }
    }, // pulse
    spo2: {
      id: 'spo2',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let mediaMessage = mediaUtil.createMediaMessage(`${config.staticMediaPath}/pulse_oximeter`, 'jpeg', context.user.locale, '');
            dialog.sendMessage(context, mediaMessage, false);
            dialog.sendMessage(context, dialog.get_message(messages.spo2.prompt, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process'
          }
        },
        process: {
          onEntry: assign((context, event) => {
            let spo2 = parseInt(dialog.get_input(event));
            if(spo2 >= 0 && spo2 <= 100) {
              context.isValid = true;
              context.slots.vitals.spo2 = spo2;
            } else {
              context.isValid = false;
            }
          }),
          always: [
            {
              cond: (context) => context.isValid == false,
              target: 'error'
            },
            {
              target: '#symptoms'
            }
          ]
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.retry, context.user.locale), false);
          }),
          always: 'prompt'
        }
      }
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
                USER_MESSAGE: 'process'
              }
            },
            process: {
              onEntry: assign((context, event) => {
                context.intention = dialog.get_intention(context.grammer, event, true);
              }),
              always: [
                {
                  cond: (context) => context.grammer == dialog.INTENTION_UNKOWN,
                  target: 'error'
                },
                {
                  actions: assign((context, event) => {
                    context.slots.vitals.symptoms.lossOfSmellTaste = context.intention;
                  }),
                  target: '#fluLikeSymptoms'
                }
              ]
            },
            error: {
              onEntry: assign((context, event) => {
                dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.optionsRetry, context.user.locale), false);
              }),
              always: 'prompt'
            }
          }
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
                USER_MESSAGE: 'process'
              }
            },
            process: {
              onEntry: assign((context, event) => {
                context.intention = dialog.get_intention(context.grammer, event, true);
              }),
              always: [
                {
                  cond: (context) => context.grammer == dialog.INTENTION_UNKOWN,
                  target: 'error'
                },
                {
                  actions: assign((context, event) => {
                    context.slots.vitals.symptoms.fluLikeSymptoms = context.intention;
                  }),
                  target: '#respiratoryIssues'
                }
              ]
            },
            error: {
              onEntry: assign((context, event) => {
                dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.optionsRetry, context.user.locale), false);
              }),
              always: 'prompt'
            }
          }
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
                USER_MESSAGE: 'process'
              }
            },
            process: {
              onEntry: assign((context, event) => {
                context.intention = dialog.get_intention(context.grammer, event, true);
              }),
              always: [
                {
                  cond: (context, event) => context.slots.vitals.com_status == '1',
                  actions: assign((context, event) => {
                    console.log(context.slots.vitals.com_status)
                  }),
                  target: '#heartrelated'
                },
              {
                cond: (context, event) => context.slots.vitals.com_status == '0',
                actions: assign((context, event) => {
                  context.slots.vitals.symptoms.respiratoryIssues = context.intention;                }),
                target: '#comorbidities'
              }
              ]
            },
            error: {
              onEntry: assign((context, event) => {
                dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.optionsRetry, context.user.locale), false);
              }),
              always: 'prompt'
            }
          }
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
                USER_MESSAGE: 'process'
              }
            },
            process: {
              onEntry: assign((context, event) => {
                context.intention = dialog.get_intention(context.grammer, event, true);
              }),
              always: [
                {
                  cond: (context) => context.grammer == dialog.INTENTION_UNKOWN,
                  target: 'error'
                },
                {
                  actions: assign((context, event) => {
                    context.slots.vitals.symptoms.comorbidities = context.intention;
                  }),
                  target: '#diabetes'
                }
              ]
            },
            error: {
              onEntry: assign((context, event) => {
                dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.optionsRetry, context.user.locale), false);
              }),
              always: 'prompt'
            }
          }
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
                USER_MESSAGE: 'process'
              }
            },
            process: {
              onEntry: assign((context, event) => {
                context.intention = dialog.get_intention(context.grammer, event, true);
              }),
              always: [
                {
                  cond: (context) => context.grammer == dialog.INTENTION_UNKOWN,
                  target: 'error'
                },
                {
                  cond: (context, event) => context.slots.vitals.fateh_kit_delivered == 'YES',
                  actions: assign((context, event) => {
                    context.slots.vitals.symptoms.diabetes = context.intention;
                  }),
                  target: '#addVitals'
                },
              {
                cond: (context, event) =>context.slots.vitals.fateh_kit_delivered == 'NO',
                actions: assign((context, event) => {
                  context.slots.vitals.symptoms.diabetes = context.intention;
                }),
                  target: '#fatehKitDel'
              }
                
              ]
            },
            error: {
              onEntry: assign((context, event) => {
                dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.optionsRetry, context.user.locale), false);
              }),
              always: 'prompt'
            }
          }
        },
        fatehKitDel: {
          id: 'fatehKitDel',
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
                USER_MESSAGE: 'process'
              }
            },
            process: {
              onEntry: assign((context, event) => {
                context.intention = dialog.get_intention(context.grammer, event, true);
              }),
              always: [
                {
                  cond: (context) => context.grammer == dialog.INTENTION_UNKOWN,
                  target: 'error'
                },
                {
                  actions: assign((context, event) => {
                    context.slots.vitals.symptoms.FatehKitsDelivered = context.intention;
                }),
                  target: '#addVitals'
                }
              ]
            },
            error: {
              onEntry: assign((context, event) => {
                dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.optionsRetry, context.user.locale), false);
              }),
              always: 'prompt'
            }
          }
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
                USER_MESSAGE: 'process'
              }
            },
            process: {
              onEntry: assign((context, event) => {
                context.intention = dialog.get_intention(context.grammer, event, true);
              }),
              always: [
                {
                  cond: (context) => context.grammer == dialog.INTENTION_UNKOWN,
                  target: 'error'
                },
                {
                  actions: assign((context, event) => {
                    context.slots.vitals.symptoms.ComHeart = context.intention;
                }),
                  target: '#kidneyrelated'
                }
              ]
            },
            error: {
              onEntry: assign((context, event) => {
                dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.optionsRetry, context.user.locale), false);
              }),
              always: 'prompt'
            }
          }
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
                USER_MESSAGE: 'process'
              }
            },
            process: {
              onEntry: assign((context, event) => {
                context.intention = dialog.get_intention(context.grammer, event, true);
              }),
              always: [
                {
                  cond: (context) => context.grammer == dialog.INTENTION_UNKOWN,
                  target: 'error'
                },
                {
                  actions: assign((context, event) => {
                    context.slots.vitals.symptoms.ComKidney = context.intention;
                   
                  }),
                  target: '#cancerrelated'
                }
              ]
            },
            error: {
              onEntry: assign((context, event) => {
                dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.optionsRetry, context.user.locale), false);
              }),
              always: 'prompt'
            }
          }
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
                USER_MESSAGE: 'process'
              }
            },
            process: {
              onEntry: assign((context, event) => {
                context.intention = dialog.get_intention(context.grammer, event, true);
              }),
              always: [
                {
                  cond: (context) => context.grammer == dialog.INTENTION_UNKOWN,
                  target: 'error'
                },
                 {
                  cond: (context, event) => context.slots.vitals.fateh_kit_delivered == 'NO',
                  actions: assign((context, event) => {
                    console.log(context.slots.vitals.fateh_kit_delivered)
                  }),
                  target: '#fatehKitDel'
                },
                {
                  cond: (context, event) => context.slots.vitals.fateh_kit_delivered == 'YES',
                  actions: assign((context, event) => {
                    console.log(context.slots.vitals.fateh_kit_delivered)
                  }),
                  target: '#addVitals'
                },
              ]
            },
            error: {
              onEntry: assign((context, event) => {
                dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.optionsRetry, context.user.locale), false);
              }),
              always: 'prompt'
            }
          }
        },
      }
    }, // symptoms
    addVitals: {
      id: 'addVitals',
      invoke: {
        src: (context) => vitalsService.addVitals(context.user, context.slots.vitals),
        onDone: {
          actions: assign((context, event) => {
            let mediaMessage = mediaUtil.createMediaMessage(`${config.staticMediaPath}/controlRoom_contact_numbers`, 'jpeg', undefined, '');
            dialog.sendMessage(context, dialog.get_message(messages.addVitals, context.user.locale), false);
            dialog.sendMessage(context, mediaMessage);
          }),
          target: '#endstate'
        }
      }
    },
    noUserFound: {
      id: 'noUserFound',
      onEntry: assign((context, event) => {
        dialog.sendMessage(context, dialog.get_message(messages.noUserFound, context.user.locale), false);
      }),
      always: ''
    },
  }
}


module.exports = vitalsFlow;
