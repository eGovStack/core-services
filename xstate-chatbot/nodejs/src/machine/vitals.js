const { assign, actions } = require('xstate');
const dialog = require('./util/dialog');
const messages = require('./messages/vitals');
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
            if(pulse >= 50 && pulse <= 300) {
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
            dialog.sendMessage(context, dialog.get_message(messages.spo2.prompt, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process'
          }
        },
        process: {
          onEntry: assign((context, event) => {
            let spo2 = parseInt(dialog.get_input(event));
            if(spo2 >= 50 && spo2 <= 100) {
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
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.symptoms.preamble, context.user.locale);
            let { prompt, grammer } = dialog.constructListPromptAndGrammer(messages.symptoms.options.list, messages.symptoms.options.messageBundle, context.user.locale);
            context.grammer = grammer;
            message += prompt;
            message += dialog.get_message(messages.symptoms.postscript, context.user.locale);
            dialog.sendMessage(context, message);
          }),
          on: {
            USER_MESSAGE: 'process'
          }
        },
        process: {
          onEntry: assign((context, event) => {
            let input = dialog.get_input(event);
            if(input == '0') {
              context.slots.vitals.symptoms = [];
            } else {
              let choices = input.split(',');
              let symptoms = [];
              for(let choice of choices) {
                let intention = dialog.get_intention(context.grammer, {message: {input: choice}}, true);
                symptoms.push(intention);
              }
              if(!symptoms.includes(dialog.INTENTION_UNKOWN))
                context.slots.vitals.symptoms = symptoms;
            }
          }),
          always: [
            {
              cond: (context) => context.slots.vitals.symptoms !== undefined,
              target: '#addVitals'
            },
            {
              target: 'error'
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
    }, // symptoms
    addVitals: {
      id: 'addVitals',
      invoke: {
        src: (context) => vitalsService.addVitals(context.slots.vitals),
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