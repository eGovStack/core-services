const { Machine, assign, actions } = require('xstate');
const dialog = require('./util/dialog.js');
const triageFlow = require('./triage');
const selfCareFlow = require('./self-care');
const { personService } = require('./service/service-loader');
const { messages } = require('./messages/chat-machine');

const chatStateMachine = Machine({
  id: 'chatMachine',
  initial: 'start',
  on: {
    USER_RESET: {
      target: '#menuFetchPersons',
      // actions: assign( (context, event) => dialog.sendMessage(context, dialog.get_message(messages.reset, context.user.locale), false))
    }
  },
  states: {
    start: {
      id: 'start',
      onEntry: assign((context, event) => {
        context.slots = {}
      }),
      on: {
        USER_MESSAGE: '#menuFetchPersons'
      }
    },
    menuFetchPersons: {
      id: 'menuFetchPersons',
      invoke: {
        src: (context) => personService.getPeople(context.user.mobileNumber),
        onDone: [
          // {
          //   cond: (context, event) => context.user.locale,
          //   actions: assign((context, event) => {
          //     context.persons = event.data;
          //   }),
          //   target: '#menu'
          // },
          {
            actions: assign((context, event) => {
              context.persons = event.data;
            }),
            target: '#selectLanguage'
          },
        ]
      }
    },
    selectLanguage: {
      id: 'selectLanguage',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.selectLanguage.prompt.preamble, context.user.locale);
            let { prompt, grammer } = dialog.constructListPromptAndGrammer(messages.selectLanguage.prompt.options.list, messages.selectLanguage.prompt.options.messageBundle, context.user.locale);
            context.grammer = grammer;
            message += prompt;
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
                context.user.locale = context.intention;
              }),
              target: '#menu'
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
    }, // selectLanguage
    menu: {
      id: 'menu',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.menu.prompt.preamble, context.user.locale);
            let options;
            const subscribedPatients = personService.filterSubscribedPeople(context.persons);
            if(subscribedPatients && subscribedPatients.length) {
              options = messages.menu.prompt.options.subscribedUser;
            } else {
              options = messages.menu.prompt.options.newUser;
            }
            let { prompt, grammer } = dialog.constructListPromptAndGrammer(options, messages.menu.prompt.options.messageBundle, context.user.locale);
            context.grammer = grammer;
            message += prompt;
            message += dialog.get_message(messages.menu.prompt.postscript, context.user.locale);
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
              cond: (context) => context.intention == 'worried',
              target: '#triageMenu'
            },
            {
              cond: (context) => context.intention == 'selfCare',
              target: '#selfCareMenu'
            },
            {
              cond: (context) => context.intention == 'info',
              target: '#informationFlow'
            },
            {
              target: 'error'
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
    }, // menu
    triageMenu: {
      id: 'triageMenu',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.triageMenu.prompt.preamble, context.user.locale);
            let { prompt, grammer } = dialog.constructListPromptAndGrammer(messages.triageMenu.prompt.options.list, messages.triageMenu.prompt.options.messageBundle, context.user.locale);
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
              target: '#triageFlow',
              actions: assign((context, event) => {
                context.slots.triageMenu = context.intention;
              })
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
    }, //triageMenu
    selfCareMenu: {
      id: 'selfCareMenu',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.selfCareMenu.prompt.preamble, context.user.locale);

            let options, bundle;
            const subscribedPatients = personService.filterSubscribedPeople(context.persons);
            if (subscribedPatients && subscribedPatients.length) {
              options = messages.selfCareMenu.prompt.options.hasLivePatients.list;
              bundle = messages.selfCareMenu.prompt.options.hasLivePatients.messageBundle;
            } else {
              options = messages.selfCareMenu.prompt.options.noLivePatients.list;
              bundle = messages.selfCareMenu.prompt.options.noLivePatients.messageBundle;
            }


            let { prompt, grammer } = dialog.constructListPromptAndGrammer(options, bundle, context.user.locale);
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
              cond: (context) => context.intention == 'addPatient',
              target: '#triageFlow'
            },
            {
              cond: (context) => context.intention == 'recordVitals',
              target: '#recordVitals'
            },
            {
              cond: (context) => context.intention == 'downloadReport',
              target: '#downloadReport'
            },
            {
              cond: (context) => context.intention == 'exitProgram',
              target: '#exitProgram'
            },
            {
              target: 'error'
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
    }, // selfCareMenu
    informationFlow: {
      id: 'informationFlow',
      onEntry: assign((context, event) => {
        dialog.sendMessage(context, dialog.get_message(messages.informationFlow, context.user.locale));
      }),
      always: '#endstate'
    },
    triageFlow: triageFlow,
    recordVitals: selfCareFlow.recordVitals,
    downloadReport: selfCareFlow.downloadReport,
    exitProgram: selfCareFlow.exitProgram,
    endstate: {
      id: 'endstate',
      // onEntry: assign((context, event) => {
      //   dialog.sendMessage(context, dialog.get_message(messages.endstate, context.user.locale));
      // }),
      always: '#start'
    }
  }
});

module.exports = chatStateMachine;
