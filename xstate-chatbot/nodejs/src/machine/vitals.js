const { assign, actions } = require('xstate');
const dialog = require('./util/dialog');
const mediaUtil = require('./util/media');
const config = require('../env-variables');
const { messages, grammers } = require('./messages/vitals');
const { personService, vitalsService } = require('./service/service-loader');

const vitalsFlow = {
  id: 'vitalsFlow',
  initial: 'isHomeIsolated',
  onEntry: assign((context, event) => {
    context.slots.vitals = {};
  }),
  states: {
    isHomeIsolated: {
      invoke: {
        src: (context) => personService.isHomeIsolatedPatient(context.user.mobileNumber),
        onDone: [
          {
            cond: (context, event) => event.data == false,
            target: '#notHomeIsolatedPatient'
          },
          {
            target: 'temperature'
          }
        ]
      }
    },
    notHomeIsolatedPatient: {
      id: 'notHomeIsolatedPatient',
      onEntry: assign((context, event) => {
        dialog.sendMessage(context, dialog.get_message(messages.notHomeIsolatedPatient, context.user.locale));
      }),
      target: '#endstate'
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
                  cond: (context) => context.grammer == dialog.INTENTION_UNKOWN,
                  target: 'error'
                },
                {
                  actions: assign((context, event) => {
                    context.slots.vitals.symptoms.respiratoryIssues = context.intention;
                  }),
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
      }
    }, // symptoms
    addVitals: {
      id: 'addVitals',
      invoke: {
        src: (context) => vitalsService.addVitals(context.user, context.slots.vitals),
        onDone: {
          actions: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.addVitals, context.user.locale));
          }),
          target: '#endstate'
        }
      }
    },
  }
}

module.exports = vitalsFlow;