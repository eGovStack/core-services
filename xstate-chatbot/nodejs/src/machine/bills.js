const { assign } = require('xstate');
const { billService } = require('./service/service-loader');
const dialog = require('./util/dialog');


const bills = {
  id: 'bills',
  initial: 'start',
  states: {
    start: {
      onEntry: assign((context, event) => {
        context.bills = {};
      }),
      invoke: {
        id: 'fetchBillsForUser',
        src: (context) => billService.fetchBillsForUser(context.user),
        onDone: [
          {
            target: 'personalBills',
            cond: (context, event) => {
              return event.data.pendingBills;
            },
            actions: assign((context, event) => {
              context.bills.pendingBills = event.data.pendingBills;
            })
          },
          {
            target: 'noBills',
            actions: assign((context, event) => {
              context.totalBills = event.data.totalBills;
            })
          }
        ],
        onError: {
          target: 'searchBillInitiate',
          actions: assign((context, event) => {
            let message = dialog.get_message(dialog.global_messages.system_error, context.user.locale);
            dialog.sendMessage(context, message, false);
          })
        }
      }
    },
    personalBills: {
      id: 'personalBills',
      onEntry: assign((context, event) => {
        let bills = context.bills.pendingBills;
        let message = '';
        if(bills.length === 1) {
          let bill = bills[0];
          message = dialog.get_message(messages.personalBills.singleRecord, context.user.locale);
          message = message.replace('{{service}}', bill.service);
          message = message.replace('{{id}}', bill.id);
          message = message.replace('{{secondaryInfo}}', bill.secondaryInfo);
          message = message.replace('{{period}}', bill.period);
          message = message.replace('{{dueAmount}}', bill.amount);
          message = message.replace('{{dueDate}}', bill.dueDate);
          message = message.replace('{{paymentLink}}', bill.paymentLink);
        } else {
          let services = bills.map(element => element.service);
          let serviceSet = new Set(services);
          if(services.length === serviceSet.size) {
            message = dialog.get_message(messages.personalBills.multipleRecords, context.user.locale);
            for(let i = 0; i < bills.length; i++) {
              let bill = bills[i];
              let billTemplate = dialog.get_message(messages.billSearchResults.multipleRecords.billTemplate, context.user.locale);
              billTemplate = billTemplate.replace('{{service}}', bill.service);
              billTemplate = billTemplate.replace('{{dueAmount}}', bill.dueAmount);
              billTemplate = billTemplate.replace('{{dueDate}}', bill.dueDate);
              billTemplate = billTemplate.replace('{{paymentLink}}', bill.paymentLink);

              message += '\n\n';
              message += (i + 1) + '. ';
              message += billTemplate;
            }
          } else {
            message = dialog.get_message(messages.personalBills.multipleRecordsSameService, context.user.locale);
            for(let i = 0; i < bills.length; i++) {
              let bill = bills[i];
              let billTemplate = dialog.get_message(messages.billSearchResults.multipleRecordsSameService.billTemplate, context.user.locale);
              billTemplate = billTemplate.replace('{{service}}', bill.service);
              billTemplate = billTemplate.replace('{{id}}', bill.id);
              billTemplate = billTemplate.replace('{{secondaryInfo}}', bill.secondaryInfo);
              billTemplate = billTemplate.replace('{{dueAmount}}', bill.dueAmount);
              billTemplate = billTemplate.replace('{{dueDate}}', bill.dueDate);
              billTemplate = billTemplate.replace('{{paymentLink}}', bill.paymentLink);

              message += '\n\n';
              message += (i + 1) + '. ';
              message += billTemplate;
            }
          }
        }
        dialog.sendMessage(context, message, false);
      }),
      always: '#searchBillInitiate'
    },
    searchBillInitiate: {
      id: 'searchBillInitiate',
      initial: 'question',
      states: {
        question: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.searchBillInitiate.question, context.user.locale);
            dialog.sendMessage(context, message);
          }),
          on: {
            USER_MESSAGE: 'process'
          }
        },
        process: {
          onEntry: assign((context, event) => {
            let messageText = event.message.input;
            let parsed = parseInt(event.message.input.trim())
            let isValid = parsed === 1;
            context.message = {
              isValid: isValid,
              messageContent: event.message.input
            };
          }),
          always: [
            {
              target: 'error',
              cond: (context, event) => {
                return ! context.message.isValid;
              }
            },
            {
              target: '#billServices'
            }
          ]
        },
        error: {
          onEntry: assign( (context, event) => {
            let message = 'Sorry, I didn\'t understand';
            dialog.sendMessage(context, message, false);
          }),
          always : 'question'
        }
      }
    },
    noBills: {
      id: 'noBills',
      onEntry: assign( (context, event) => {
        let message;
        if(context.totalBills === 0) {
          message = dialog.get_message(messages.noBills.notLinked, context.user.locale);
        } else {
          message = dialog.get_message(messages.noBills.noPending, context.user.locale);
        }
        dialog.sendMessage(context, message, false);
      }),
      always: 'billServices'
    },
    billServices: {
      id: 'billServices',
      initial: 'question',
      states: {
        question: {
          onEntry: assign((context, event) => {
            let { services, messageBundle } = billService.getSupportedServicesAndMessageBundle();
            let preamble = dialog.get_message(messages.billServices.question.preamble, context.user.locale);
            let { prompt, grammer } = dialog.constructListPromptAndGrammer(services, messageBundle, context.user.locale);
            context.grammer = grammer;
            dialog.sendMessage(context, `${preamble}${prompt}`);
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
              target: 'error',
              cond: (context, event) => context.intention === dialog.INTENTION_UNKOWN
            },
            {
              target: '#searchParamOptions',
              actions: assign((context, event) => {
                context.slots.bills['service'] = context.intention;
              })
            }
          ]
        },
        error: {
          onEntry: assign((context, event) => {
            let message = 'Sorry, I didn\'t understand. Could please try again entering a number for the given options.';
            dialog.sendMessage(context, message, false);
          }),
          always: 'question'
        }
      }
    },
    searchParamOptions: {
      id: 'searchParamOptions',
      initial: 'question',
      states: {
        question: {
          onEntry: assign((context, event) => {
            let { searchOptions, messageBundle } = billService.getSearchOptionsAndMessageBundleForService(context.slots.bills.service);
            let preamble = dialog.get_message(messages.searchParamOptions.question.preamble, context.user.locale);
            let { prompt, grammer } = dialog.constructListPromptAndGrammer(searchOptions, messageBundle, context.user.locale);
            context.grammer = grammer;
            dialog.sendMessage(context, `${preamble}${prompt}`);
          }),
          on: {
            USER_MESSAGE: 'process'
          },
        },
        process: {
          onEntry: assign((context, event) => {
            context.intention = dialog.get_intention(context.grammer, event, true);
          }),
          always: [
            {
              target: 'error',
              cond: (context, event) => context.intention === dialog.INTENTION_UNKOWN
            },
            {
              target: '#paramInput',
              actions: assign((context, event) => {
                context.slots.bills.searchParamOption = context.intention;
              })
            }  
          ]
        },
        error: {
          onEntry: assign((context, event) => {
            let message = 'Sorry, I didn\'t understand. Could please try again entering a number for the given options.';
            dialog.sendMessage(context, message, false);
          }),
          always: 'question'
        }
      }
    },
    paramInput: {
      id: 'paramInput',
      initial: 'question',
      states: {
        question: {
          onEntry: assign((context, event) => {
            let { option, example } = billService.getOptionAndExampleMessageBundle(context.slots.bills.service, context.slots.bills.searchParamOption);
            let message = dialog.get_message(messages.paramInput.question, context.user.locale);
            let optionMessage = dialog.get_message(option, context.user.locale);
            let exampleMessage = dialog.get_message(example, context.user.locale);
            message = message.replace('{{option}}', optionMessage);
            message = message.replace('{{example}}', exampleMessage);
            dialog.sendMessage(context, message);
          }),
          on: {
            USER_MESSAGE: 'process'
          }
        },
        process: {
          onEntry: assign((context, event) => {
            let paramInput = event.message.input;
            let slots = context.slots.bills;
            context.isValid = billService.validateParamInput(slots.service, slots.searchParamOption, paramInput);
            if(context.isValid) {
              context.slots.bills.paramInput = paramInput;
            }
          }),
          always: [
            {
              target: '#billSearchResults',
              cond: (context, event) => context.isValid
            },
            {
              target: 're_enter'
            }
          ]
        },
        re_enter: {
          onEntry: assign((context, event) => {
            let { option, example } = billService.getOptionAndExampleMessageBundle(context.slots.bills.service, context.slots.bills.searchParamOption);
            let message = dialog.get_message(messages.paramInput.re_enter, context.user.locale);
            let optionMessage = dialog.get_message(option, context.user.locale);
            message = message.replace('{{option}}', optionMessage);
            dialog.sendMessage(context, message);
          }),
          on: {
            USER_MESSAGE: 'process'
          }
        }
      }
    },
    billSearchResults: {
      id: 'billSearchResults',
      initial: 'fetch',
      states: {
        fetch: {
          invoke: {
            id: 'fetchBillsForParam',
            src: (context, event) => {
              let slots = context.slots.bills;
              return billService.fetchBillsForParam(context.user, slots.service, slots.searchParamOption, slots.paramInput);
            },
            onDone: [
              {
                cond: (context, event) => event.data === undefined || event.data.length === 0,
                target: 'noRecords'
              },
              {
                target: 'results',
                actions: assign((context, event) => {
                  context.bills.searchResults = event.data;
                })
              }
            ]
          }
        },
        noRecords: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.billSearchResults.noRecords, context.user.locale);
            let { searchOptions, messageBundle } = billService.getSearchOptionsAndMessageBundleForService(context.slots.bills.service);
            message = message.replace('{{searchParamOption}}', dialog.get_message(messageBundle[context.slots.bills.searchParamOption], context.user.locale));
            message = message.replace('{{paramInput}}', context.slots.bills.paramInput);
            dialog.sendMessage(context, message, false);
          }),
          always: '#paramInputInitiate'
        },
        results: {
          onEntry: assign((context, event) => {
            let bills = context.bills.searchResults;
            let message = '';
            if(bills.length === 1) {
              let bill = bills[0];
              message = dialog.get_message(messages.billSearchResults.singleRecord, context.user.locale);
              message = message.replace('{{service}}', bill.service);
              message = message.replace('{{id}}', bill.id);
              message = message.replace('{{secondaryInfo}}', bill.secondaryInfo);
              message = message.replace('{{period}}', bill.period);
              message = message.replace('{{dueAmount}}', bill.amount);
              message = message.replace('{{dueDate}}', bill.dueDate);
              message = message.replace('{{paymentLink}}', bill.paymentLink);
            } else {
              let services = bills.map(element => element.service);
              let serviceSet = new Set(services);
              if(services.length === serviceSet.size) {
                message = dialog.get_message(messages.billSearchResults.multipleRecords, context.user.locale);
                for(let i = 0; i < bills.length; i++) {
                  let bill = bills[i];
                  let billTemplate = dialog.get_message(messages.billSearchResults.multipleRecords.billTemplate, context.user.locale);
                  billTemplate = billTemplate.replace('{{service}}', bill.service);
                  billTemplate = billTemplate.replace('{{dueAmount}}', bill.dueAmount);
                  billTemplate = billTemplate.replace('{{dueDate}}', bill.dueDate);
                  billTemplate = billTemplate.replace('{{paymentLink}}', bill.paymentLink);

                  message += '\n\n';
                  message += (i + 1) + '. ';
                  message += billTemplate;
                }
              } else {
                message = dialog.get_message(messages.billSearchResults.multipleRecordsSameService, context.user.locale);
                for(let i = 0; i < bills.length; i++) {
                  let bill = bills[i];
                  let billTemplate = dialog.get_message(messages.billSearchResults.multipleRecordsSameService.billTemplate, context.user.locale);
                  billTemplate = billTemplate.replace('{{service}}', bill.service);
                  billTemplate = billTemplate.replace('{{id}}', bill.id);
                  billTemplate = billTemplate.replace('{{secondaryInfo}}', bill.secondaryInfo);
                  billTemplate = billTemplate.replace('{{dueAmount}}', bill.dueAmount);
                  billTemplate = billTemplate.replace('{{dueDate}}', bill.dueDate);
                  billTemplate = billTemplate.replace('{{paymentLink}}', bill.paymentLink);

                  message += '\n\n';
                  message += (i + 1) + '. ';
                  message += billTemplate;
                }
              }
            }
            dialog.sendMessage(context, message, false);
          }),
          always: '#searchBillInitiate'
        }
      }
    },
    paramInputInitiate: {
      id: 'paramInputInitiate',
      initial: 'question',
      states: {
        question: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.paramInputInitiate.question, context.user.locale);
            let { searchOptions, messageBundle } = billService.getSearchOptionsAndMessageBundleForService(context.slots.bills.service);
            message = message.replace('{{searchParamOption}}', dialog.get_message(messageBundle[context.slots.bills.searchParamOption], context.user.locale));
            dialog.sendMessage(context, message);
          }),
          on: {
            USER_MESSAGE: 'process'
          }
        },
        process: {
          onEntry: assign((context, event) => {
            let messageText = event.message.input;
            let parsed = parseInt(event.message.input.trim())
            let isValid = parsed === 1;
            context.message = {
              isValid: isValid,
              messageContent: event.message.input
            };
          }),
          always: [
            {
              target: 'error',
              cond: (context, event) => {
                return ! context.message.isValid;
              }
            },
            {
              target: '#paramInput'
            }
          ]
        },
        error: {
          onEntry: assign( (context, event) => {
            let message = 'Sorry, I didn\'t understand';
            dialog.sendMessage(context, message, false);
          }),
          always : 'question'
        }
      }
    }
  }
};

let messages = {
  personalBills: {
    singleRecord: {
      en_IN: 'Your {{service}} bill against consumer number {{id}} for property in {{secondaryInfo}} for the period {{period}} is Rs. {{dueAmount}}. \n\nPay before {{dueDate}} to avoid late payment charges. \n\nPayment Link: {{paymentLink}}'
    },
    multipleRecords: {
      en_IN: 'Following bills found against your mobile number:',
      billTemplate: {
        en_IN: '{{service}} | Rs. {{dueAmount}} | Due on {{dueDate}} \nPayment Link: {{paymentLink}}'
      }
    },
    multipleRecordsSameService: {
      en_IN: 'Following bills found against your mobile number:',
      billTemplate: {
        en_IN: ' {{service}} | {{id}} | {{secondaryInfo}} | Rs. {{dueAmount}} | Due on {{dueDate}} \nPayment Link: {{paymentLink}}'
      }
    }
  },
  noBills: {
    notLinked: {
      en_IN: 'Sorry, your mobile number is not linked to any service. Contact your ULB to link it. You can avail service by searching your account information as given below:'
    },
    noPending: {
      en_IN: 'There are no pending bills against your account. You can still search the bills as given below'
    }
  },
  searchBillInitiate: {
    question: {
      en_IN: 'Please type and send ‘1’ to Search and Pay for other bills or fees which are not linked with your mobile number. \nOr \'mseva\' to Go ⬅️ Back to the main menu.'
    }
  },
  billServices: {
    question: {
      preamble: {
        en_IN: 'Please type and send the number of your option from the list given 👇 below to search and pay:'
      }
    }
  },
  searchParamOptions: {
    question: {
      preamble: {
        en_IN: 'Please type and send the number of your option from the list given 👇 below:'
      }
    }
  },
  paramInput: {
    question: {
      en_IN: 'Please Enter {{option}} to view the bill. {{example}}\n\nOr Type and send "mseva" to Go ⬅️ Back to main menu.'
    },
    re_enter: {
      en_IN: 'Sorry, the value you have provided is incorrect.\nPlease re-enter the {{option}} again to fetch the bills.\n\nOr Type and send \'mseva\' to Go ⬅️ Back to main menu.'
    }
  },
  billSearchResults: {
    noRecords: {
      en_IN: 'The {{searchParamOption}} : {{paramInput}} is not found in our records. Please Check the details you have provided once again.'
    },
    singleRecord: {
      en_IN: 'Your {{service}} bill against consumer number {{id}} for property in {{secondaryInfo}} for the period {{period}} is Rs. {{dueAmount}}. \n\nPay before {{dueDate}} to avoid late payment charges. \n\nPayment Link: {{paymentLink}}'
    },
    multipleRecords: {
      en_IN: 'Following bills found:',
      billTemplate: {
        en_IN: '{{service}} | Rs. {{dueAmount}} | Due on {{dueDate}} \nPayment Link: {{paymentLink}}'
      }
    },
    multipleRecordsSameService: {
      en_IN: 'Following bills found:',
      billTemplate: {
        en_IN: '{{service}} | {{id}} | {{secondaryInfo}} | Rs. {{dueAmount}} | Due on {{dueDate}} \nPayment Link: {{paymentLink}}'
      }
    }
  },
  paramInputInitiate: {
    question: {
      en_IN: 'Please type and send ‘*1*’ to Enter {{searchParamOption}} again. \nOr \'mseva\' to Go ⬅️ Back to the main menu.'
    }
  }
}


module.exports = bills;