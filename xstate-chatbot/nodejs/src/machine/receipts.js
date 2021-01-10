const { assign } = require('xstate');
const { receiptService } = require('./service/service-loader');
const dialog = require('./util/dialog');


const receipts = {
    id: 'receipts',
    initial: 'services',
    states: {
      services: {
        id: 'services',
        onEntry: assign((context, event) => {
          context.receipts = {slots: {}};
        }),
        initial: 'receiptQuestion',
        states:{
          receiptQuestion:{
            onEntry: assign((context, event) => {
              let { services, messageBundle } = receiptService.getSupportedServicesAndMessageBundle();
              let preamble = dialog.get_message(messages.services.question.preamble, context.user.locale);
              let { prompt, grammer } = dialog.constructListPromptAndGrammer(services, messageBundle, context.user.locale);
              context.grammer = grammer;
              dialog.sendMessage(context, `${preamble}${prompt}` , true);
            }),
            on: {
              USER_MESSAGE:'process'
            }
          },
          process:{
            onEntry: assign((context, event) => {
              context.intention = dialog.get_intention(context.grammer, event, true);
            }),
            always:[
              {
                target: 'error',
                cond: (context, event) => context.intention === dialog.INTENTION_UNKOWN
              },

              {
                target: '#trackReceipts',
                actions: assign((context, event) => {
                  context.receipts.slots.service = context.intention;
                }),
              }
            ]
          },// menu.process
          error: {
            onEntry: assign( (context, event) => {
              let message =dialog.get_message(messages.services.error,context.user.locale);
              dialog.sendMessage(context, message,false);
            }),
            always : [
              {
                target: 'receiptQuestion'
              }
            ]
          } 
        }
      },
      trackReceipts:{
        id:'trackReceipts',
        initial:'start',
        states:{
          start:{
            onEntry: assign((context, event) => {
              //console.log("Entered into trackReceipts");
            }),
            invoke:{
              id:'receiptstatus',
              src: (context) => receiptService.findreceipts(context.user,context.receipts.slots.service),
              onDone:[
                {
                  target: '#receiptSlip',
                  cond: (context, event) => {
                    return event.data.length>0;
                  },
                  actions: assign((context, event) => {
                    context.receipts.slots.searchresults = event.data;
                  }),
                },
                {
                  target:'#mobileLinkage',
                }
    
              ],
              onError: {
                actions: assign((context, event) => {
                  let message = dialog.get_message(messages.trackReceipts.error,context.user.locale);
                  dialog.sendMessage(context, message, false);
                }),
                always : '#services'
              }
            }

          },
          
        },
      },
      receiptSlip:{
        id:'receiptSlip',
        initial:'start',
        states:{
          start:{
            onEntry: assign((context, event) => {
              //console.log("Entered into receiptSlip");
            }),
            invoke:{
              id: 'fetchReceiptsForParam',
              src: (context, event) => {
                let slots = context.receipts.slots;
                return receiptService.fetchReceiptsForParam(context.user, slots.service, slots.searchParamOption, slots.paramInput);
              },
              onDone:[
                {
                  cond:(context,event)=>{
                    return event.data.length>0
                  },
                  target: 'listofreceipts',
                },
                {
                  target:'#noReceipts'
                },
              ],
              onError: {
                actions: assign((context, event) => {
                  let message = messages.receiptSlip.error;
                  //context.chatInterface.toUser(context.user, message);
                  dialog.sendMessage(context, message, false);
                }),
                always : [
                  {
                    target: '#services'
                  }
                ]
              }  
            
            },
          },
          listofreceipts:{
            onEntry: assign((context, event) => {
              let receipts=context.receipts.slots.searchresults;
              let message='';
              let isValid = receipts.length === 1;
              context.message = {
                isValid: isValid,
              };
              if(receipts.length===1){
                let receipt = receipts[0];
                let message=dialog.get_message(messages.receiptSlip.listofreceipts.singleRecord,context.user.locale);
                message = message.replace('{{service}}', receipt.service);
                message = message.replace('{{id}}', receipt.id);
                message = message.replace('{{locality}}', receipt.locality);
                message = message.replace('{{city}}', receipt.city);
                message = message.replace('{{date}}', receipt.date);
                message = message.replace('{{amount}}', receipt.amount);
                message = message.replace('{{transactionNumber}}', receipt.transactionNumber);
                message = message.replace('{{receiptDocumentLink}}', receipt.receiptDocumentLink);
                dialog.sendMessage(context, message, false);
              }else {
                message = dialog.get_message(messages.receiptSlip.listofreceipts.multipleRecordsSameService, context.user.locale);
                for(let i = 0; i < receipts.length; i++) {
                  let receipt = receipts[i];
                  let receiptTemplate = dialog.get_message(messages.receiptSlip.listofreceipts.multipleRecordsSameService.receiptTemplate, context.user.locale);
                  receiptTemplate = receiptTemplate.replace('{{id}}', receipt.id);
                  receiptTemplate = receiptTemplate.replace('{{locality}}', receipt.locality);
                  receiptTemplate = receiptTemplate.replace('{{city}}', receipt.city);
                  message += '\n\n';
                  message += (i + 1) + '. ';
                  message += receiptTemplate;
                }
                let message1 = dialog.get_message(messages.receiptNumber.question, context.user.locale);
                message += '\n\n';
                message+=message1;
                dialog.sendMessage(context, message, true);
              }
              
            }),
            always:[
              {
                target:'#paramReceiptInputInitiate',
                cond: (context, event) => {
                  return  context.message.isValid;
                }
              },
              {
                target:'#receiptNumber',

              }
            ]
          },
        },
      },
      noReceipts:{
        id:'noReceipts',
        onEntry: assign((context, event) => {
          let message = dialog.get_message(messages.receiptSlip.not_found, context.user.locale);
          //context.chatInterface.toUser(context.user, message);
          dialog.sendMessage(context, message, false);
        }),
        always:'#searchReceptInitiate'
      },
      searchReceptInitiate:{
        id:'searchReceptInitiate',
        initial:'receiptQuestion',
        states:{
          receiptQuestion:{
            onEntry: assign((context, event) => {
              let message = dialog.get_message(messages.searchReceptInitiate.question, context.user.locale);
              dialog.sendMessage(context, message, true);
            }),
            on: {
              USER_MESSAGE:'process'
            }

          },
          process:{
            onEntry: assign( (context, event) => {
              let messageText = event.message.input;
              let parsed = parseInt(event.message.input.trim())
              let isValid = parsed === 1;
              context.message = {
                isValid: isValid,
                messageContent: event.message.input
              }
            }),
            always :[
              {
                target: 'error',
                cond: (context, event) => {
                  return ! context.message.isValid;
                }
              },
              {
                target:'#searchParams',
                cond: (context, event) => {
                  return  context.message.isValid;
                }
              },
            ],
          },
          error: {
            onEntry: assign( (context, event) => {
              let message = dialog.get_message(messages.searchReceptInitiate.error,context.user.locale);
              dialog.sendMessage(context, message, false);
            }),
            always : [
              {
                target: 'receiptQuestion'
              }
            ]
          },
        },
      },
      mobileLinkage:{
        id:'mobileLinkage',
        onEntry: assign((context, event) => {
          let message1=dialog.get_message(messages.mobileLinkage.notLinked,context.user.locale);
          message1 = message1.replace(/{{service}}/g,context.receipts.slots.service);
          //context.chatInterface.toUser(context.user, message1);
          dialog.sendMessage(context, message1, false);
        }),
        always:[
          {
            target:'#searchReceptInitiate',
          }
        ],
      },//mobilecheck
      searchParams:{
        id:'searchParams',
        initial:'question',
        states:{
          question:{
            onEntry:assign((context,event)=>{
              let { searchOptions, messageBundle } = receiptService.getSearchOptionsAndMessageBundleForService(context.receipts.slots.service);
              let preamble=dialog.get_message(messages.searchParams.question.preamble,context.user.locale);
              let { prompt, grammer } = dialog.constructListPromptAndGrammer(searchOptions, messageBundle, context.user.locale);
              context.grammer = grammer;
              dialog.sendMessage(context, `${preamble}${prompt}` , true);
            }),
            on:{
              USER_MESSAGE:'process'
            },
          },
          process:{
            onEntry: assign((context, event) => {
              context.intention = dialog.get_intention(context.grammer, event, true);
            }),
            always:[
              {
                target: 'error',
                cond: (context, event) => context.intention === dialog.INTENTION_UNKOWN
              },
              {
                target: '#paramReceiptInput',
                actions: assign((context, event) => {
                  context.receipts.slots.searchParamOption = context.intention;
                })
              }
            ],
          },
          error: {
            onEntry: assign( (context, event) => {
              let message = dialog.get_message(messages.searchParams.error,context.user.locale);
              dialog.sendMessage(context, message , false);
            }),
            always : [
              {
                target: '#searchParams'
              }
            ]
          },
        },
      },//serachparameter
      paramReceiptInput:{
        id:'paramReceiptInput',
        initial:'receiptQuestion',
        states:{
          receiptQuestion: {
            onEntry: assign((context, event) => {
              let { option, example } = receiptService.getOptionAndExampleMessageBundle(context.receipts.slots.service,context.receipts.slots.searchParamOption);
              let message = dialog.get_message(messages.paramInput.question, context.user.locale);
              let optionMessage = dialog.get_message(option, context.user.locale);
              let exampleMessage = dialog.get_message(example, context.user.locale);
              message = message.replace('{{option}}', optionMessage);
              message = message.replace('{{example}}', exampleMessage);
              dialog.sendMessage(context, message , true);
            }),
            on: {
              USER_MESSAGE: 'process'
            }
          },
          process:{
            onEntry: assign( (context, event) => {
              let paramInput = event.message.input;
              context.isValid = receiptService.validateparamInput(context.receipts.slots.service, context.receipts.slots.searchParamOption, paramInput);
              if(context.isValid) {
                context.receipts.slots.paramInput = paramInput;
              }
            }),
            always:[
              {
                target: '#receiptSearchResults',
                cond: (context, event) => {
                  return context.isValid;
                }
              },
              {
                target:'re_enter',
              }
            ]

          },
          re_enter:{
            onEntry: assign((context, event) => {
              let { option, example } = receiptService.getOptionAndExampleMessageBundle(context.receipts.slots.service,context.receipts.slots.searchParamOption);
              let message = dialog.get_message(messages.paramInput.re_enter, context.user.locale);
              let optionMessage = dialog.get_message(option, context.user.locale);
              message = message.replace('{{option}}', optionMessage);
              dialog.sendMessage(context, message , true);
            }),
            on: {
              USER_MESSAGE: 'process'
            },
          },
        },
      },//parameterinput
      receiptSearchResults:{
        id:'receiptSearchResults',
        initial:'fetch',
        states:{
          fetch:{
            onEntry: assign((context, event) => {
              //console.log("Entered into receiptSearchResults");
            }),
            invoke:{
              id: 'fetchReceiptsForParam',
              src: (context, event) => {
                let slots = context.receipts.slots;
                return receiptService.fetchReceiptsForParam(context.user, slots.service, slots.searchParamOption, slots.paramInput);
              },
              onDone:[
                {
                  target: 'results',
                  cond:(context,event)=>{
                    return event.data.length>0
                  },
                  actions: assign((context, event) => {
                    context.receipts.slots.searchresults = event.data;
                  }),
                },
                {
                  target:'norecords'
                },
              ],
              onError: {
                actions: assign((context, event) => {
                  let message = messages.receiptSearchResults.error;
                  dialog.sendMessage(context, message , false);
                }),
                always : [
                  {
                    target: '#services',
                  }
                ]
              }  
            
            },
          },
          norecords:{
            onEntry: assign((context, event) => {
              let message = dialog.get_message(messages.receiptSearchResults.norecords, context.user.locale);
              let optionMessage = context.receipts.slots.searchParamOption;
              let inputMessage = context.receipts.slots.paramInput;
              message = message.replace('{{searchparamoption}}', optionMessage);
              message = message.replace('{{paramInput}}', inputMessage);
              dialog.sendMessage(context, message , false);
            }),
            always: '#paramReceiptInputInitiate',
          },
          results:{
            onEntry: assign((context, event) => {
              let receipts=context.receipts.slots.searchresults;
              let message='';
              let isValid = receipts.length === 1;
              context.message = {
                isValid: isValid,
              };
              if(receipts.length===1){
                let receipt = receipts[0];
                let message=dialog.get_message(messages.receiptSearchResults.results.singleRecord,context.user.locale);
                message = message.replace('{{service}}', receipt.service);
                message = message.replace('{{id}}', receipt.id);
                message = message.replace('{{locality}}', receipt.locality);
                message = message.replace('{{city}}', receipt.city);
                message = message.replace('{{date}}', receipt.date);
                message = message.replace('{{amount}}', receipt.amount);
                message = message.replace('{{transactionNumber}}', receipt.transactionNumber);
                message = message.replace('{{receiptDocumentLink}}', receipt.receiptDocumentLink);
                dialog.sendMessage(context, message , false);
              }else {
                message = dialog.get_message(messages.receiptSearchResults.results.multipleRecordsSameService, context.user.locale);
                for(let i = 0; i < receipts.length; i++) {
                  let receipt = receipts[i];
                  let receiptTemplate = dialog.get_message(messages.receiptSlip.listofreceipts.multipleRecordsSameService.receiptTemplate, context.user.locale);
                  receiptTemplate = receiptTemplate.replace('{{id}}', receipt.id);
                  receiptTemplate = receiptTemplate.replace('{{locality}}', receipt.locality);
                  receiptTemplate = receiptTemplate.replace('{{city}}', receipt.city);
                  message += '\n\n';
                  message += (i + 1) + '. ';
                  message += receiptTemplate;
                }
                dialog.sendMessage(context, message ,true);
              }
              
            }),
            always:[
              {
                target:'#paramReceiptInputInitiate',
                cond: (context, event) => {
                  return  context.message.isValid;
                }
              },
              {
                target:'#receiptNumber'
              }
            ]
          },
        }
      },
      paramReceiptInputInitiate:{
        id:'paramReceiptInputInitiate',
        initial:'receiptQuestion',
        states: {
          receiptQuestion: {
            onEntry: assign((context, event) => {
              let message = dialog.get_message(messages.paramInputInitiate.question, context.user.locale);
              dialog.sendMessage(context, message , true);
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
                target: '#serviceMenu'
              }
            ]
          },
          error: {
            onEntry: assign( (context, event) => {
              let message =dialog.get_message(messages.paramInputInitiate.error,context.user.locale);
              dialog.sendMessage(context, message , false);
            }),
            always : 'receiptQuestion'
          }
        },
      },
      receiptNumber:{
        id:'receiptNumber',
        initial:'receiptQuestion',
        states: {
          receiptQuestion: {
            onEntry: assign((context, event) => {
              
            }),
            on: {
              USER_MESSAGE: 'process'
            }
          },
          process: {
            onEntry: assign((context, event) => {
              let parsed = parseInt(event.message.input.trim());
              context.receipts.slots.receiptNumber=parsed;
            }),
            always: [
              {
                target: '#multipleRecordReceipt'
              }
            ]
          },
        },
      },
      multipleRecordReceipt:{
        id:"multipleRecordReceipt",
        initial:'start',
        states:{
          start:{
            onEntry: assign((context, event) => {
              //console.log("Entered into multipleRecordReceipt");
            }),
            invoke:{
              src: (context, event) => {
                var receiptIndex = context.receipts.slots.receiptNumber;
                var consumerCode;
                if(context.receipts.slots.searchresults)
                  consumerCode = context.receipts.slots.searchresults[receiptIndex-1].id;

                return receiptService.multipleRecordReceipt(context.user,context.receipts.slots.service,consumerCode);
              },
              onDone:[
                {
                  target: 'receipts',
                  actions: assign((context, event) => {
                    context.receipts.slots.multipleRecordReceipt = event.data;
                  }),
                },
              ],
              onError: {
                actions: assign((context, event) => {
                  let message = messages.multipleRecordReceipt.error;
                  dialog.sendMessage(context, message , false);
                }),
                always : [
                  {
                    target: 'services'
                  }
                ]
              }  
            
            },
          },
          receipts:{
            onEntry:assign((context,event)=>{
              let receipts=context.receipts.slots.multipleRecordReceipt;
              let message='';
              if(receipts.length===1){
                let receipt = receipts[0];
                let message=dialog.get_message(messages.multipleRecordReceipt.singleReceipt,context.user.locale);
                message = message.replace('{{service}}', receipt.service);
                message = message.replace('{{id}}', receipt.id);
                message = message.replace('{{locality}}', receipt.locality);
                message = message.replace('{{city}}', receipt.city);
                message = message.replace('{{date}}', receipt.date);
                message = message.replace('{{amount}}', receipt.amount);
                message = message.replace('{{transactionNumber}}', receipt.transactionNumber);
                message = message.replace('{{receiptDocumentLink}}', receipt.receiptDocumentLink);
                dialog.sendMessage(context, message , false);
              }else {
                let receiptLength =receipts.length;
                message = dialog.get_message(messages.multipleRecordReceipt.multipleReceipts, context.user.locale);
                message = message.replace('{{service}}', receipts[0].service);
                message = message.replace('{{id}}', receipts[0].id);
                message = message.replace('{{locality}}', receipts[0].locality);
                message = message.replace('{{city}}', receipts[0].city);
                message = message.replace('{{count}}', receiptLength);
                for(let i = 0; i < receipts.length; i++) {
                  let receipt = receipts[i];
                  let receiptTemplate = dialog.get_message(messages.multipleRecordReceipt.multipleReceipts.receiptTemplate, context.user.locale);
                  receiptTemplate = receiptTemplate.replace('{{amount}}', receipt.amount);
                  receiptTemplate = receiptTemplate.replace('{{date}}', receipt.date);
                  receiptTemplate = receiptTemplate.replace('{{transactionNumber}}', receipt.transactionNumber);
                  receiptTemplate = receiptTemplate.replace('{{receiptDocumentLink}}', receipt.receiptDocumentLink);
    
                  message += '\n\n';
                  message += (i + 1) + '. ';
                  message += receiptTemplate;
                }
                //context.chatInterface.toUser(context.user,message);
                dialog.sendMessage(context, message , false);
              }

            }),
            always:[
              {
                target:'#paramReceiptInputInitiate',

              }
            ]

          }
        },


        
      },
      serviceMenu: {
        id: 'serviceMenu',
        onEntry: assign((context, event) => {
          context.receipts = {slots: {}};
        }),
        initial: 'receiptQuestion',
        states:{
          receiptQuestion:{
            onEntry: assign((context, event) => {
              let { services, messageBundle } = receiptService.getSupportedServicesAndMessageBundle();
              let preamble = dialog.get_message(messages.services.question.preamble, context.user.locale);
              let { prompt, grammer } = dialog.constructListPromptAndGrammer(services, messageBundle, context.user.locale);
              context.grammer = grammer;
              dialog.sendMessage(context, `${preamble}${prompt}` , true);
            }),
            on: {
              USER_MESSAGE:'process'
            }
          },
          process:{
            onEntry: assign((context, event) => {
              context.intention = dialog.get_intention(context.grammer, event, true);
            }),
            always:[
              {
                target: 'error',
                cond: (context, event) => context.intention === dialog.INTENTION_UNKOWN
              },

              {
                target: '#searchParams',
                actions: assign((context, event) => {
                  context.receipts.slots.service = context.intention;
                }),
              }
            ]
          },
          error: {
            onEntry: assign( (context, event) => {
              let message =dialog.get_message(messages.services.error,context.user.locale);
              dialog.sendMessage(context, message , false);
            }),
            always : [
              {
                target: 'receiptQuestion'
              }
            ]
          } 
        }
      },
    }//receipts.states
};

let messages = {
  services:{
    question: {
      preamble: {
        en_IN: 'Please type and send the number of your option from the list given 👇 below:'
      },
    },
    error:{
      en_IN: 'Sorry, I didn\'t understand. Could please try again!.'
    },
  },
  trackReceipts:{
    error:{
      en_IN: 'Sorry. Some error occurred on server!'
    },
  },
  receiptSlip:{
    not_found:{
      en_IN:'There are no records found linked to your mobile number'
    },
    error:{
      en_IN:'Sorry. Some error occurred on server.'
    },
    listofreceipts:{
      singleRecord: {
        en_IN:'Your {{service}} payment receipt for consumer number {{id}} against property in  {{locality}},{{city}} is given 👇 below:\n\nClick on the link to view and download a copy of bill or payment receipt.\n\n {{date}} - Rs.  {{amount}} -  {{transactionNumber}}\nLink: {{receiptDocumentLink}}\n\n'
      },
      multipleRecordsSameService: {
        en_IN: 'There are multiple records found . Select one record to proceed ahead. You can always come back and choose another record.',
        receiptTemplate: {
          en_IN: 'Consumer Number - {{id}} , {{locality}} , {{city}} '
        }
      }
    },
  },
  searchReceptInitiate:{
    question:{
      en_IN:'Please type and send ‘1’ to Search and View for past payments which are not linked to your mobile number.'
    },
    error:{
      en_IN: 'Sorry, I didn\'t understand. Could please try again!.'
    },


  },
  mobileLinkage:{
    notLinked: {
      en_IN: 'It seems the mobile number you are using is not linked with {{service}} service. Please visit ULB to link your account number with {{service}} service. Still you can avail service by searching your account information.'
    },
  },
  searchParams:{
    question: {
      preamble: {
        en_IN: 'Please type and send the number of your option from the list given 👇 below:'
      }
    },
    error:{
      en_IN: 'Sorry, I didn\'t understand. Could please try again!.'
    },

  },
  paramInput: {
    question: {
      en_IN: 'Please Enter {{option}} to view the payment receipts. {{example}}\n\nOr Type and send "mseva" to Go ⬅️ Back to main menu.'
    },
    re_enter: {
      en_IN: 'Sorry, the value you have provided is incorrect.\nPlease re-enter the {{option}} again to fetch the bills.\n\nOr Type and send \'mseva\' to Go ⬅️ Back to main menu.'
    }
  },
  receiptSearchResults:{
    error:{
      en_IN:'Sorry. Some error occurred on server.'
    },
    norecords:{
      en_IN:'The {{searchparamoption}} :   {{paramInput}}   is not found in our records. Please Check the details you have provided once again.'
    },
    results:{
      singleRecord: {
        en_IN:'Your {{service}} payment receipt for consumer number {{id}} against property in  {{locality}},{{city}} is given 👇 below:\n\nClick on the link to view and download a copy of bill or payment receipt.\n\n {{date}} - Rs.  {{amount}} -  {{transactionNumber}}\nLink: {{receiptDocumentLink}}\n\n'
      },
      multipleRecordsSameService: {
        en_IN: 'There are multiple records found . Select one record to proceed ahead. You can always come back and choose another record.',
        receiptTemplate: {
          en_IN: 'Consumer Number - {{id}} , {{locality}} , {{city}} '
        }
      }
    },
  },
  paramInputInitiate: {
    question: {
      en_IN: 'Please type and send ‘1’ to Search and View payment receipt for other payments or services Or  mseva to Go ⬅️ Back to the main menu.'
    },
    error:{
      en_IN: 'Sorry, I didn\'t understand. Could please try again!.'
    },

  },
  receiptNumber:{
    question: {
      en_IN: 'Please type and send the number of your option from the list of receipts shown above: '
    },
  },
  multipleRecordReceipt:{
    error:{
      en_IN:'Sorry. Some error occurred on server.'
    },
    singleReceipt: {
      en_IN:'Your {{service}} payment receipt for consumer number {{id}} against property in  {{locality}},{{city}} is given 👇 below:\n\nClick on the link to view and download a copy of bill or payment receipt.\n\n {{date}} - Rs.  {{amount}} -  {{transactionNumber}}\nLink: {{receiptDocumentLink}}\n\n'
    },
    multipleReceipts: {
      en_IN: 'Your {{service}} payment receipt for consumer number {{id}} against property in  {{locality}},{{city}} is given 👇 below:\n\nClick on the link to view and download a copy of bill or payment receipt.\n\nLast {{count}} Payment Receipt Details',
      receiptTemplate: {
        en_IN: '{{date}} - Rs.  {{amount}} -  {{transactionNumber}} \nLink: {{receiptDocumentLink}}'
      }
    }
    
  },
  
};

module.exports = receipts;
