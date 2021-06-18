const { Machine, assign, actions } = require('xstate');
const dialog = require('./util/dialog.js');
const covidInfoFlow = require('./covid-info');
const vitalsFlow = require('./vitals');
const messages = require('./messages/chat-machine');
const hospitalFlow = require('./hospital-details')

const chatStateMachine = Machine({
  id: 'chatMachine',
  initial: 'start',
  on: {
    USER_RESET: {
      target: '#selectLanguage',
      // actions: assign( (context, event) => dialog.sendMessage(context, dialog.get_message(messages.reset, context.user.locale), false))
    },
  },
  states: {
    start: {
      id: 'start',
      onEntry: assign((context, event) => {
        context.slots = {};
      }),
      on: {
        USER_MESSAGE: 'selectLanguage',
      },
    },
    selectLanguage: {
      id: 'selectLanguage',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.selectLanguage.prompt.preamble, context.user.locale);
            const { prompt, grammer } = dialog.constructListPromptAndGrammer(messages.selectLanguage.prompt.options.list, messages.selectLanguage.prompt.options.messageBundle, context.user.locale);
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
              cond: (context) => context.intention == dialog.INTENTION_UNKOWN,
              target: 'error',
            },
            {
              actions: assign((context, event) => {
                context.user.locale = context.intention;
              }),
              target: '#menu',
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
    }, // selectLanguage
    menu: {
      id: 'menu',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.menu.prompt.preamble, context.user.locale);
            const { prompt, grammer } = dialog.constructListPromptAndGrammer(messages.menu.prompt.options.list, messages.menu.prompt.options.messageBundle, context.user.locale);
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
              cond: (context) => context.intention == 'covidInfo',
              target: '#covidInfoFlow',
            },
            {
              cond: (context) => context.intention == 'addVitals',
              target: '#vitalsFlow',
            },
            {
              cond: (context) => context.intention == 'rrt',
              target: '#rrtLocation',
            },
            {
              cond: (context) => context.intention == 'rmo',
              target: '#rmoMobileNumber',
            },
            {
              cond: (context) => context.intention == 'bedsavailability',
              target: '#hospitalFlow',
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
    }, // menu
    covidInfoFlow,
    vitalsFlow,
    hospitalFlow,
    endstate: {
      id: 'endstate',
      always: '#start',
    },
  },
});

module.exports = chatStateMachine;
