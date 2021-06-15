const { assign } = require('xstate');
const { billService } = require('./service/service-loader');
const dialog = require('./util/dialog');
const config = require('../env-variables');


const bills = {
  id: 'bills',
  initial: 'start',
  states: {
    start: {
      onEntry: assign((context, event) => {
        context.slots.bills = {};
        context.bills = {slots: {}};
        if(context.intention == 'ws_bills')
          context.service = 'WS';
        else if(context.intention == 'pt_bills')
          context.service = 'PT';
        else
          context.service = null;
      }),
      invoke: {
        id: 'fetchBillsForUser',
        src: (context) => billService.fetchBillsForUser(context.user,context.service),
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
        if(bills.length === 1) {
          let bill = bills[0];
          dialog.sendMessage(context, dialog.get_message(messages.personalBills.singleRecord, context.user.locale), false);
          let billTemplate = dialog.get_message(messages.personalBills.singleRecord.billTemplate, context.user.locale);
          billTemplate = billTemplate.replace('{{service}}', bill.service);
          billTemplate = billTemplate.replace('{{id}}', bill.id);
          billTemplate = billTemplate.replace('{{payerName}}', bill.payerName);
          billTemplate = billTemplate.replace('{{period}}', bill.period);
          billTemplate = billTemplate.replace('{{dueAmount}}', bill.dueAmount);
          billTemplate = billTemplate.replace('{{dueDate}}', bill.dueDate);
          billTemplate = billTemplate.replace('{{paymentLink}}', bill.paymentLink);
          dialog.sendMessage(context, billTemplate, false);
        } else {
          let services = bills.map(element => element.service);
          let serviceSet = new Set(services);
          if(services.length === serviceSet.size) {
            dialog.sendMessage(context, dialog.get_message(messages.personalBills.multipleRecords, context.user.locale), false);
            for(let i = 0; i < bills.length; i++) {
              let bill = bills[i];
              let billTemplate = dialog.get_message(messages.billSearchResults.multipleRecords.billTemplate, context.user.locale);
              billTemplate = billTemplate.replace('{{service}}', bill.service);
              billTemplate = billTemplate.replace('{{payerName}}', bill.payerName);
              billTemplate = billTemplate.replace('{{dueAmount}}', bill.dueAmount);
              billTemplate = billTemplate.replace('{{dueDate}}', bill.dueDate);
              billTemplate = billTemplate.replace('{{paymentLink}}', bill.paymentLink);

              dialog.sendMessage(context, billTemplate, false);
            }
          } else {
            dialog.sendMessage(context, dialog.get_message(messages.personalBills.multipleRecordsSameService, context.user.locale), false);
            for(let i = 0; i < bills.length; i++) {
              let bill = bills[i];
              let billTemplate = dialog.get_message(messages.billSearchResults.multipleRecordsSameService.billTemplate, context.user.locale);
              billTemplate = billTemplate.replace('{{service}}', bill.service);
              billTemplate = billTemplate.replace('{{id}}', bill.id);
              billTemplate = billTemplate.replace('{{payerName}}', bill.payerName);
              billTemplate = billTemplate.replace('{{dueAmount}}', bill.dueAmount);
              billTemplate = billTemplate.replace('{{dueDate}}', bill.dueDate);
              billTemplate = billTemplate.replace('{{paymentLink}}', bill.paymentLink);

              dialog.sendMessage(context, billTemplate, false);
            }
          }
        }
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
            let message = dialog.get_message(messages.searchBillInitiate.error, context.user.locale);
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

   /* billServices: {
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
            let message = dialog.get_message(messages.billServices.error, context.user.locale);
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
            let message = dialog.get_message(messages.searchParamOptions.error, context.user.locale);
            dialog.sendMessage(context, message, false);
          }),
          always: 'question'
        }
      }
    },*/
    

    billServices: {
      id: 'billServices',
      initial: 'question',
      states: {
        question: {
          onEntry: assign((context, event) => {
            let { searchOptions, messageBundle } = billService.getSearchOptionsAndMessageBundleForService(context.service);
            context.slots.bills.searchParamOption = searchOptions[0];
            let { option, example } = billService.getOptionAndExampleMessageBundle(context.service, context.slots.bills.searchParamOption);
            let optionMessage = dialog.get_message(option, context.user.locale);

            let message = dialog.get_message(messages.billServices.question.confirmation, context.user.locale);
            message = message + "\n"+dialog.get_message(messages.billServices.question.preamble, context.user.locale);;
            message = message.replace('{{searchOption}}', optionMessage);
            dialog.sendMessage(context, message);

          }),
          on: {
            USER_MESSAGE: 'process'
          }    
        },
        process: {
          onEntry: assign((context, event) => {
            if(dialog.validateInputType(event, 'text'))
              context.intention = dialog.get_intention(grammer.confirmation.choice, event, true);
            else
              context.intention = dialog.INTENTION_UNKOWN;
          }),
          always: [
            {
              target: '#paramInput',
              cond: (context) => context.intention == 'Yes'
            },
            {
              target: 'openSearch',
              cond: (context) => context.intention == 'No',
            },
            {
              target: 'error'
            }
          ]
        },
        openSearch:{
          onEntry: assign((context, event) => {
            (async() => {
            context.slots.bills.openSearchLink = await billService.getOpenSearchLink(context.service);
            let { services, messageBundle } = billService.getSupportedServicesAndMessageBundle();
            let billServiceName = dialog.get_message(messageBundle[context.service],context.user.locale);
            let message = dialog.get_message(messages.openSearch, context.user.locale);
            message = message.replace(/{{billserviceName}}/g,billServiceName);
            message = message.replace('{{link}}',context.slots.bills.openSearchLink);

            dialog.sendMessage(context, message, true);
            var imageMessage = {
              type: 'image',
              output: config.pgrUseCase.informationImageFilestoreId
            };
            dialog.sendMessage(context, imageMessage);
            })();
          }),


          always: '#endstate'
        },
        error: {
          onEntry: assign( (context, event) => {
            dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.retry, context.user.locale), false);
          }),
          always : 'question'
        }
      }
    },
    paramInput: {
      id: 'paramInput',
      initial: 'question',
      states: {
        question: {
          onEntry: assign((context, event) => {
            let { option, example } = billService.getOptionAndExampleMessageBundle(context.service, context.slots.bills.searchParamOption);
            let message = dialog.get_message(messages.paramInput.question, context.user.locale);
            let optionMessage = dialog.get_message(option, context.user.locale);
            //let exampleMessage = dialog.get_message(example, context.user.locale);
            message = message.replace('{{option}}', optionMessage);
            //message = message.replace('{{example}}', exampleMessage);
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
            context.isValid = billService.validateParamInput(context.service, slots.searchParamOption, paramInput);
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
              return billService.fetchBillsForParam(context.user, context.service, slots.searchParamOption, slots.paramInput);
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
            if(bills.length === 1) {
              let bill = bills[0];
              dialog.sendMessage(context, dialog.get_message(messages.billSearchResults.singleRecord, context.user.locale), false);
              let billTemplate = dialog.get_message(messages.billSearchResults.singleRecord.billTemplate, context.user.locale);
              billTemplate = billTemplate.replace('{{service}}', bill.service);
              billTemplate = billTemplate.replace('{{id}}', bill.id);
              billTemplate = billTemplate.replace('{{payerName}}', bill.payerName);
              billTemplate = billTemplate.replace('{{period}}', bill.period);
              billTemplate = billTemplate.replace('{{dueAmount}}', bill.dueAmount);
              billTemplate = billTemplate.replace('{{dueDate}}', bill.dueDate);
              billTemplate = billTemplate.replace('{{paymentLink}}', bill.paymentLink);
              dialog.sendMessage(context, billTemplate, false);
            } else {
              let services = bills.map(element => element.service);
              let serviceSet = new Set(services);
              if(services.length === serviceSet.size) {
                dialog.sendMessage(context, dialog.get_message(messages.billSearchResults.multipleRecords, context.user.locale), false);
                for(let i = 0; i < bills.length; i++) {
                  let bill = bills[i];
                  let billTemplate = dialog.get_message(messages.billSearchResults.multipleRecords.billTemplate, context.user.locale);
                  billTemplate = billTemplate.replace('{{service}}', bill.service);
                  billTemplate = billTemplate.replace('{{payerName}}', bill.payerName);
                  billTemplate = billTemplate.replace('{{dueAmount}}', bill.dueAmount);
                  billTemplate = billTemplate.replace('{{dueDate}}', bill.dueDate);
                  billTemplate = billTemplate.replace('{{paymentLink}}', bill.paymentLink);
                  dialog.sendMessage(context, billTemplate, false);
                }
              } else {
                dialog.sendMessage(context, dialog.get_message(messages.billSearchResults.multipleRecordsSameService, context.user.locale), false);
                for(let i = 0; i < bills.length; i++) {
                  let bill = bills[i];
                  let billTemplate = dialog.get_message(messages.billSearchResults.multipleRecordsSameService.billTemplate, context.user.locale);
                  billTemplate = billTemplate.replace('{{service}}', bill.service);
                  billTemplate = billTemplate.replace('{{id}}', bill.id);
                  billTemplate = billTemplate.replace('{{payerName}}', bill.payerName);
                  billTemplate = billTemplate.replace('{{dueAmount}}', bill.dueAmount);
                  billTemplate = billTemplate.replace('{{dueDate}}', bill.dueDate);
                  billTemplate = billTemplate.replace('{{paymentLink}}', bill.paymentLink);

                  dialog.sendMessage(context, billTemplate, false);
                }
              }
            }
            let endStatement = dialog.get_message(messages.endStatement, context.user.locale);
            dialog.sendMessage(context, endStatement);
          }),
          always: '#endstate'
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
            let message = dialog.get_message(messages.paramInputInitiate.error, context.user.locale);
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
      en_IN: 'Following unpaid bills are found with your mobile number 👇',
      hi_IN: 'निम्नलिखित बिल मिले:',
      billTemplate: {
        en_IN: '👉  {{service}} Bill\n\n Connection No      {{id}}\n Owner Name         {{payerName}}\n Amount Due         Rs {{dueAmount}}\n Due Date           {{dueDate}}\n Payment Link : {{paymentLink}}',
        hi_IN: '{{service}} | रु. {{dueAmount}} | पर कारण {{dueDate}} \nभुगतान लिंक: {{paymentLink}}'
      }
    },
    multipleRecords: {
      en_IN: 'Following unpaid bills are found with your mobile number 👇',
      hi_IN: 'आपके मोबाइल नंबर के खिलाफ पाए गए बिल: ',
      billTemplate: {
        en_IN: '👉  {{service}} Bill\n\n Connection No      {{id}}\n Owner Name         {{payerName}}\n Amount Due         Rs {{dueAmount}}\n Due Date           {{dueDate}}\n Payment Link : {{paymentLink}}',
        hi_IN: '{{service}} | रु. {{dueAmount}} | पर कारण {{dueDate}} \nभुगतान लिंक: {{paymentLink}}'
      }
    },
    multipleRecordsSameService: {
      en_IN: 'Following unpaid bills are found with your mobile number 👇',
      hi_IN: 'आपके मोबाइल नंबर के खिलाफ पाए गए बिल: ',
      billTemplate: {
        en_IN: '👉  {{service}} Bill\n\n Connection No      {{id}}\n Owner Name         {{payerName}}\n Amount Due         Rs {{dueAmount}}\n Due Date           {{dueDate}}\n Payment Link : {{paymentLink}}',
        hi_IN: '{{service}} | {{id}} | {{payerName}} | रु. {{dueAmount}} | पर कारण {{dueDate}} \nभुगतान लिंक: {{paymentLink}}'
      }
    }
  },
  noBills: {
    notLinked: {
      en_IN: 'Sorry, it seems like your mobile number is not linked to any service.\n\nPlease contact your nearest municipality office to link the number.',
      hi_IN: 'क्षमा करें, आपका मोबाइल नंबर किसी सेवा से लिंक नहीं है। इसे लिंक करने के लिए अपने शहरी स्थानीय निकाय से संपर्क करें। आप नीचे दी गई जानकारी के अनुसार अपनी खाता जानकारी खोज कर सेवा प्राप्त कर सकते हैं:'
    },
    noPending: {
      en_IN: 'There are no pending bills against your account. You can still search the bills as given below',
      hi_IN: 'आपके खाते के खिलाफ कोई लंबित बिल नहीं हैं। आप अभी भी नीचे दी गई सेवाओं के बिल खोज सकते हैं'
    }
  },
  searchBillInitiate: {
    question: {
      en_IN: '\nWant to pay any other bill which are not linked with your mobile number?\n\n👉 Type and Send *1* to Search & Pay for other bills.\n\n👉 To go back to the main menu, type and send mseva.',
      hi_IN: '\nकृपया अन्य बिल या शुल्क के लिए खोज और भुगतान करें जो आपके मोबाइल नंबर से लिंक नहीं हैं, टाइप करें ‘1’ और भेजें। मुख्य मेनू पर वापस जाने के लिए ‘mseva’ टाइप करें और भेजें ।'
    },
    error:{
      en_IN: "Option you have selected seems to be invalid  😐\nKindly select the valid option to proceed further.",
      hi_IN: "क्षमा करें, मुझे समझ में नहीं आया"
    }
  },
  billServices: {
    question: {
      preamble: {
        en_IN: 'Please type and send the number for your option👇\n\n1.Yes\n2.No',
        hi_IN: 'कृपया टाइप करें और अपने विकल्प के लिए नंबर भेजें👇\n\n1.हां\n2.नहीं'
      },
      confirmation:{
        en_IN: 'Do you have the {{searchOption}} to proceed with the payment ?\n',
        hi_IN: 'क्या आपके पास भुगतान के लिए आगे बढ़ने के लिए {{searchOption}} है ?\n'
      }
    },
    error:{
      en_IN: 'Option you have selected seems to be invalid  😐\nKindly select the valid option to proceed further.',
      hi_IN: 'क्षमा करें, मुझे समझ में नहीं आया। कृपया दिए गए विकल्पों के लिए फिर से एक नंबर दर्ज करे।'
    }
  },
  searchParamOptions: {
    question: {
      preamble: {
        en_IN: 'Please type and send the number for your option👇',
        hi_IN: 'कृपया नीचे दिए गए सूची से अपना विकल्प टाइप करें और भेजें:'
      }
    },
    error:{
      en_IN: 'Option you have selected seems to be invalid  😐\nKindly select the valid option to proceed further.',
      hi_IN: 'क्षमा करें, मुझे समझ में नहीं आया। कृपया दिए गए विकल्पों के लिए फिर से एक नंबर दर्ज करे।'
    }
  },
  paramInput: {
    question: {
      en_IN: 'Please enter the {{option}}.',
      hi_IN: 'बिल देखने के लिए कृपया {{option}} डालें।'
    },
    re_enter: {
      en_IN: 'Sorry, the value you have provided is incorrect.\nPlease re-enter the {{option}} again to fetch the bills.\n\nOr Type and send \'mseva\' to Go ⬅️ Back to main menu.',
      hi_IN: 'क्षमा करें, आपके द्वारा प्रदान किया गया मूल्य गलत है। बिलों को प्राप्त करने के लिए \n कृपया फिर से {{option}} दर्ज करें।\n\nमुख्य मेनू पर वापस जाने के लिए ‘mseva’ टाइप करें और भेजें ।'
    }
  },
  billSearchResults: {
    noRecords: {
      en_IN: 'The {{searchParamOption}} : {{paramInput}} is not found in our records.\n\nPlease check the entered details and try again.',
      hi_IN: 'आपके द्वारा प्रदान किए गए विवरण {{searchParamOption}} :   {{paramInput}} हमारे रिकॉर्ड में नहीं पाया जाता है। कृपया आपके द्वारा प्रदान किए गए विवरण को एक बार फिर से देखें।'
    },
    singleRecord: {
      en_IN: 'Following unpaid bills are found 👇',
      hi_IN: 'निम्नलिखित बिल मिले:',
      billTemplate: {
        en_IN: '👉  {{service}} Bill\n\n Connection No      {{id}}\n Owner Name         {{payerName}}\n Amount Due         Rs {{dueAmount}}\n Due Date           {{dueDate}}\n Payment Link : {{paymentLink}}',
        hi_IN: '{{service}} | रु. {{dueAmount}} | पर कारण {{dueDate}} \nभुगतान लिंक: {{paymentLink}}'
      }
    },
    multipleRecords: {
      en_IN: 'Following unpaid bills are found 👇',
      hi_IN: 'निम्नलिखित बिल मिले:',
      billTemplate: {
        en_IN: '👉  {{service}} Bill\n\n Connection No      {{id}}\n Owner Name         {{payerName}}\n Amount Due         Rs {{dueAmount}}\n Due Date           {{dueDate}}\n Payment Link : {{paymentLink}}',
        hi_IN: '{{service}} | रु. {{dueAmount}} | पर कारण {{dueDate}} \nभुगतान लिंक: {{paymentLink}}'
      }
    },
    multipleRecordsSameService: {
      en_IN: 'Following unpaid bills are found 👇',
      hi_IN: 'निम्नलिखित बिल मिले:',
      billTemplate: {
        en_IN: '👉  {{service}} Bill\n\n Connection No      {{id}}\n Owner Name         {{payerName}}\n Amount Due         Rs {{dueAmount}}\n Due Date           {{dueDate}}\n Payment Link : {{paymentLink}}',
        hi_IN: '{{service}} | {{id}} | {{payerName}} | रु. {{dueAmount}} | पर कारण {{dueDate}} \nभुगतान लिंक: {{paymentLink}}'
      }
    }
  },
  paramInputInitiate: {
    question: {
      en_IN: 'Please type and send ‘1’ to Enter {{searchParamOption}} again. \nOr \'mseva\' to Go ⬅️ Back to the main menu.',
      hi_IN: 'कृपया {{searchParamOption}} फिर से टाइप करने के लिए ’1’ टाइप करें और भेजें।\n\nमुख्य मेनू पर वापस जाने के लिए ‘mseva’ टाइप करें और भेजें ।'
    },
    error:{
      en_IN: "Option you have selected seems to be invalid  😐\nKindly select the valid option to proceed further.",
      hi_IN: "क्षमा करें, मुझे समझ में नहीं आया"
    }
  },
  openSearch: {
    en_IN: "You can search and pay {{billserviceName}} by clicking on 👇\n\n{{link}}\n\nPlease refer to image below to understand the steps for search and paying {{billserviceName}} from this link.",
    hi_IN: "आप नीचे दिए गए लिंक पर क्लिक करके {{billserviceName}} खोज और भुगतान कर सकते हैं👇\n\n{{link}}\n\nइस लिंक से {{billserviceName}} खोजने और भुगतान करने के चरणों को समझने के लिए कृपया नीचे दी गई छवि देखें।"
  },
  endStatement: {
    en_IN: "👉 To go back to the main menu, type and send *mseva*",
    hi_IN: "👉 मुख्य मेनू पर वापस जाने के लिए, टाइप करें और भेजें *mseva*"
  }
}
let grammer = {
  confirmation: {
    choice: [
      {intention: 'Yes', recognize: ['1', 'yes', 'Yes']},
      {intention: 'No', recognize: ['2', 'no', 'No']}
    ]
  }
}


module.exports = bills;