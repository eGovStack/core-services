const { assign } = require('xstate');
const { receiptService } = require('./service/service-loader');
const dialog = require('./util/dialog');
const pdfService = require('./util/pdf-service');
const config = require('../env-variables');


const receipts = {
    id: 'receipts',
    initial: 'services',
    states: {
      services: {
        id: 'services',
        onEntry: assign((context, event) => {
          context.slots.receipts = {};
          context.receipts = {slots: {}};
        }),
        initial: 'receiptQuestion',
        states:{
          receiptQuestion:{
            onEntry: assign((context, event) => {
              (async() => {   
                await new Promise(resolve => setTimeout(resolve, 1000));
                let { services, messageBundle } = receiptService.getSupportedServicesAndMessageBundle();
                let preamble = dialog.get_message(messages.services.question.preamble, context.user.locale);
                let { prompt, grammer } = dialog.constructListPromptAndGrammer(services, messageBundle, context.user.locale);
                context.grammer = grammer;
                prompt = prompt.replace(/\n/g,"\n\n");
                let message = `${preamble}${prompt}`+'\n\n';
                message = message + dialog.get_message(messages.lastState, context.user.locale);
                dialog.sendMessage(context, message, true);
              })();
              
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
                target: '#receiptSlip',
                actions: assign((context, event) => {
                  context.receipts.slots.service = context.intention;
                }),
              }
            ]
          },// menu.process
          error: {
            onEntry: assign( (context, event) => {
              let message =dialog.get_message(messages.services.error,context.user.locale);
              dialog.sendMessage(context, message, true);
            }),
            always : [
              {
                target: 'receiptQuestion'
              }
            ]
          } 
        }
      },
     /* trackReceipts:{
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
                    return ( event .data && event.data.length>0);
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
      },*/
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
                  cond: (context, event) => {
                    return ( event .data && event.data.length>1);
                  },
                  actions: assign((context, event) => {
                    context.receipts.slots.searchresults = event.data;
                  }),
                  target: 'listofreceipts',
                },
                {
                  cond: (context, event) => {
                    return ( event .data && event.data.length==1);
                  },
                  actions: assign((context, event) => {
                    context.receipts.slots.searchresults = event.data;
                    context.receipts.slots.receiptNumber = 1;
                  }),
                  target: '#multipleRecordReceipt',
                },
                {
                  target:'#noReceipts'
                },
              ],
              onError: {
                actions: assign((context, event) => {
                  let message = messages.receiptSlip.error;
                  //context.chatInterface.toUser(context.user, message);
                  dialog.sendMessage(context, message, true);
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
              let { services, messageBundle } = receiptService.getSupportedServicesAndMessageBundle();
              let businessService = context.receipts.slots.service;
              let receiptServiceName = dialog.get_message(messageBundle[businessService],context.user.locale);
              let receipts=context.receipts.slots.searchresults;
              let message = dialog.get_message(messages.receiptSlip.listofreceipts.multipleRecordsSameService, context.user.locale);
              message = message.replace('{{service records}}', receiptServiceName.toLowerCase());

              let { searchOptions, messageBundle2 } = receiptService.getSearchOptionsAndMessageBundleForService(context.receipts.slots.service);
              context.receipts.slots.searchParamOption = searchOptions[0];
              let { option, example } = receiptService.getOptionAndExampleMessageBundle(context.receipts.slots.service, context.receipts.slots.searchParamOption);
              let optionMessage = dialog.get_message(option, context.user.locale);

              for(let i = 0; i < receipts.length; i++) {
                let receipt = receipts[i];
                let receiptTemplate = dialog.get_message(messages.receiptSlip.listofreceipts.multipleRecordsSameService.receiptTemplate, context.user.locale);
                receiptTemplate = receiptTemplate.replace('{{id}}', receipt.id);
                receiptTemplate = receiptTemplate.replace('{{locality}}', receipt.locality);
                receiptTemplate = receiptTemplate.replace('{{city}}', receipt.city);
                receiptTemplate = receiptTemplate.replace('{{consumerNumber}}', optionMessage);
                
                message += '\n\n';
                message += (i + 1) + '. ';
                message += receiptTemplate;
              }
              dialog.sendMessage(context, message, true);
            }),
            always:[
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

          let { services, messageBundle } = receiptService.getSupportedServicesAndMessageBundle();
          let businessService = context.receipts.slots.service;
          let receiptServiceName = dialog.get_message(messageBundle[businessService],context.user.locale);

          let { searchOptions, messageBundle2 } = receiptService.getSearchOptionsAndMessageBundleForService(context.receipts.slots.service);
          context.receipts.slots.searchParamOption = searchOptions[0];
          let { option, example } = receiptService.getOptionAndExampleMessageBundle(context.receipts.slots.service, context.receipts.slots.searchParamOption);
          let optionMessage = dialog.get_message(option, context.user.locale);

          let message = dialog.get_message(messages.receiptSlip.not_found, context.user.locale);
          message = message.replace('{{searchOption}}', optionMessage);
          message = message.replace('{{service}}', receiptServiceName.toLowerCase());

          dialog.sendMessage(context, message, true);
        }),
        always:'#paramReceiptInput'
      },

      openSearchInititate: {
        id: 'openSearchInititate',
        initial: 'question',
        states: {
          question: {
            onEntry: assign((context, event) => {
              (async() => { 
                await new Promise(resolve => setTimeout(resolve, 1000));
                let { searchOptions, messageBundle } = receiptService.getSearchOptionsAndMessageBundleForService(context.receipts.slots.service);
                context.receipts.slots.searchParamOption = searchOptions[0];
                let { option, example } = receiptService.getOptionAndExampleMessageBundle(context.receipts.slots.service, context.receipts.slots.searchParamOption);
                let optionMessage = dialog.get_message(option, context.user.locale);
    
                let message = dialog.get_message(messages.searchParams.question.confirmation, context.user.locale);
                message = message.replace('{{searchOption}}', optionMessage);
                dialog.sendMessage(context, message, true);
              })();
              
  
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
                target: '#paramReceiptInput',
                cond: (context) => context.intention == 'Yes'
              },
              {
                target: '#lastState',
                actions: assign((context, event) => {
                  dialog.sendMessage(context, dialog.get_message(messages.lastState,context.user.locale));   
                }),
                cond: (context) => context.intention == 'No',
              },
              {
                target: 'error'
              }
            ]
          },
          error: {
            onEntry: assign( (context, event) => {
              dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.retry, context.user.locale), true);
            }),
            always : 'question'
          }
        }
      },


      searchReceptInitiate:{
        id:'searchReceptInitiate',
        initial:'receiptQuestion',
        states:{
          receiptQuestion:{
            onEntry: assign((context, event) => {
              (async() => {  
                await new Promise(resolve => setTimeout(resolve, 1000));
                let message = dialog.get_message(messages.searchReceptInitiate.question, context.user.locale);
                dialog.sendMessage(context, message, true);
              })();
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
              dialog.sendMessage(context, message, true);
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
          let { services, messageBundle } = receiptService.getSupportedServicesAndMessageBundle();
          let businessService = context.receipts.slots.service;
          let receiptServiceName = dialog.get_message(messageBundle[businessService],context.user.locale);

          let { option, example } = receiptService.getOptionAndExampleMessageBundle(context.receipts.slots.service,context.receipts.slots.searchParamOption);
          let optionMessage = dialog.get_message(option, context.user.locale);
          
          let message = dialog.get_message(messages.mobileLinkage.notLinked,context.user.locale);
          message = message.replace('{{searchOption}}', optionMessage);
          message = message.replace('{{service}}', receiptServiceName.toLowerCase());

          dialog.sendMessage(context, message , true);
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
              (async() => { 
                await new Promise(resolve => setTimeout(resolve, 1000)); 
                let { searchOptions, messageBundle } = receiptService.getSearchOptionsAndMessageBundleForService(context.receipts.slots.service);
                let preamble=dialog.get_message(messages.searchParams.question.preamble,context.user.locale);
                let { prompt, grammer } = dialog.constructListPromptAndGrammer(searchOptions, messageBundle, context.user.locale);
                context.grammer = grammer;
                dialog.sendMessage(context, `${preamble}${prompt}` , true);
              })();
              
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
              dialog.sendMessage(context, message , true);
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
              (async() => { 
                await new Promise(resolve => setTimeout(resolve, 1000)); 
                let { searchOptions, messageBundle } = receiptService.getSearchOptionsAndMessageBundleForService(context.receipts.slots.service);
                context.receipts.slots.searchParamOption = searchOptions[0];
                let { option, example } = receiptService.getOptionAndExampleMessageBundle(context.receipts.slots.service,context.receipts.slots.searchParamOption);
                let message = dialog.get_message(messages.paramInput.question, context.user.locale);
                let optionMessage = dialog.get_message(option, context.user.locale);
                let exampleMessage = dialog.get_message(example, context.user.locale);
  
                message = message.replace('{{option}}', optionMessage);
                message = message.replace('{{example}}', exampleMessage);
  
                dialog.sendMessage(context, message , true);
              })();
              
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
              let { searchOptions, messageBundle } = receiptService.getSearchOptionsAndMessageBundleForService(context.receipts.slots.service);
              context.receipts.slots.searchParamOption = searchOptions[0];
              let { option, example } = receiptService.getOptionAndExampleMessageBundle(context.receipts.slots.service,context.receipts.slots.searchParamOption);
              let message = dialog.get_message(messages.paramInput.re_enter, context.user.locale);
              let optionMessage = dialog.get_message(option, context.user.locale);
              message = message.replace('{{option}}', optionMessage);
              dialog.sendMessage(context, message , true);
            }),
            always:{
              target: 'receiptQuestion'
            }
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
                  dialog.sendMessage(context, message , true);
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
              /*let message = dialog.get_message(messages.receiptSearchResults.norecords, context.user.locale);
              let optionMessage = context.receipts.slots.searchParamOption;
              let inputMessage = context.receipts.slots.paramInput;
              let { searchOptions, messageBundle } = receiptService.getSearchOptionsAndMessageBundleForService(context.receipts.slots.service);
              message = message.replace('{{searchparamoption}}', dialog.get_message(messageBundle[optionMessage], context.user.locale));
              message = message.replace('{{paramInput}}', inputMessage);
              dialog.sendMessage(context, message , false);*/


              let { option, example } = receiptService.getOptionAndExampleMessageBundle(context.receipts.slots.service,context.receipts.slots.searchParamOption);
              let message = dialog.get_message(messages.paramInput.re_enter, context.user.locale);
              let optionMessage = dialog.get_message(option, context.user.locale);
              message = message.replace('{{option}}', optionMessage);
              dialog.sendMessage(context, message , false);
            }),
            always: '#paramReceiptInput',
          },
          results:{
            onEntry: assign((context, event) => {
              let receipts=context.receipts.slots.searchresults;

              let message = dialog.get_message(messages.mobileLinkage.notLinked.resultHeader, context.user.locale);
              //dialog.sendMessage(context, message , false);

              let receiptMessage = dialog.get_message(messages.multipleRecordReceipt.header, context.user.locale);
              receiptMessage = receiptMessage.replace('{{date}}', dialog.get_message(messages.multipleRecordReceipt.header.date,context.user.locale));
              receiptMessage = receiptMessage.replace('{{amount}}', dialog.get_message(messages.multipleRecordReceipt.header.amount,context.user.locale));
              receiptMessage = receiptMessage.replace('{{status}}', dialog.get_message(messages.multipleRecordReceipt.header.status,context.user.locale));

              for(let i = 0; i < receipts.length; i++) {
                let receipt = receipts[i];
                let receiptTemplate = dialog.get_message(messages.multipleRecordReceipt.multipleReceipts.receiptTemplate, context.user.locale);
                receiptTemplate = receiptTemplate.replace('{{amount}}', "₹ "+receipt.amount);
                receiptTemplate = receiptTemplate.replace('{{date}}', receipt.date);
                receiptTemplate = receiptTemplate.replace('{{status}}', dialog.get_message(messages.multipleRecordReceipt.header.paid,context.user.locale));

                receiptMessage += '\n';
                receiptMessage += receiptTemplate;
              }

              message = message + receiptMessage;
              dialog.sendMessage(context, message ,true);
              
            }),
            always:[
              {
                target:'#lastState',
                actions: assign((context, event) => {
                  dialog.sendMessage(context, dialog.get_message(messages.lastState,context.user.locale));   
                }),
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
              (async() => {   
                await new Promise(resolve => setTimeout(resolve, 1000));
                let localeList = config.supportedLocales.split(',');
                let localeIndex = localeList.indexOf(context.user.locale);
                let templateList =  config.valueFirstWhatsAppProvider.valuefirstNotificationViewReceptTemplateid.split(',');
                if(templateList[localeIndex])
                  context.extraInfo.templateId = templateList[localeIndex];
                else
                  context.extraInfo.templateId = templateList[0];
  
                var templateContent = {
                  output: context.extraInfo.templateId,
                  type: "template",
                };
                dialog.sendMessage(context, templateContent, true);
              })();
              
            }),
            on: {
              USER_MESSAGE: 'process'
            }
          },
          process: {
            onEntry: assign((context, event) => {
              let messageText = event.message.input;
              messageText = messageText.toLowerCase();
              let isValid = ((messageText === 'main menu' || messageText === 'view receipts') && dialog.validateInputType(event, 'button'));
              context.message = {
                isValid: isValid,
                messageContent: messageText
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
                target: '#pdfReceiptList',
                cond: (context, event) => {
                  return (context.message.isValid && context.message.messageContent ==='view receipts');
                }
              },
              {
                target: '#sevamenu',
                cond: (context, event) => {
                  return (context.message.isValid && context.message.messageContent ==='main menu');
                }
              }
            ]
          },
          error: {
            onEntry: assign( (context, event) => {
              let message =dialog.get_message(messages.paramInputInitiate.error,context.user.locale);
              dialog.sendMessage(context, message , true);
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
              let isValid = (parsed >= 1 && parsed <= context.receipts.slots.searchresults.length);
              context.message = {
                isValid: isValid,
                messageContent: event.message.input
              };
              context.receipts.slots.receiptNumber=parsed;
            }),
            always: [
              {
                target: '#multipleRecordReceipt',
                cond: (context, event) => {
                  return context.message.isValid;
                }
              },
              {
                target: 'error',
                cond: (context, event) => {
                  return !context.message.isValid;
                }
              }
            ]
          },
          error: {
            onEntry: assign( (context, event) => {
              let message =dialog.get_message(messages.paramInputInitiate.error,context.user.locale);
              dialog.sendMessage(context, message, true);
            }),
            always : 'receiptQuestion'
          }
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
                var businessService;
                if(context.receipts.slots.searchresults)
                  consumerCode = context.receipts.slots.searchresults[receiptIndex-1].id;
                  businessService = context.receipts.slots.searchresults[receiptIndex-1].businessService;
                return receiptService.multipleRecordReceipt(context.user,businessService,consumerCode,null,false);
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
                  dialog.sendMessage(context, message , true);
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
              let receipts = context.receipts.slots.multipleRecordReceipt;

              let message = dialog.get_message(messages.multipleRecordReceipt.multipleReceipts, context.user.locale);
              //dialog.sendMessage(context, message , false);
                
              let receiptMessage = dialog.get_message(messages.multipleRecordReceipt.header, context.user.locale);
              receiptMessage = receiptMessage.replace('{{date}}', dialog.get_message(messages.multipleRecordReceipt.header.date,context.user.locale));
              receiptMessage = receiptMessage.replace('{{amount}}', dialog.get_message(messages.multipleRecordReceipt.header.amount,context.user.locale));
              receiptMessage = receiptMessage.replace('{{status}}', dialog.get_message(messages.multipleRecordReceipt.header.status,context.user.locale));
              for(let i = 0; i < receipts.length; i++) {
                let receipt = receipts[i];
                let receiptTemplate = dialog.get_message(messages.multipleRecordReceipt.multipleReceipts.receiptTemplate, context.user.locale);
                receiptTemplate = receiptTemplate.replace('{{amount}}', "₹ "+receipt.amount);
                receiptTemplate = receiptTemplate.replace('{{date}}', receipt.date);
                receiptTemplate = receiptTemplate.replace('{{status}}', dialog.get_message(messages.multipleRecordReceipt.header.paid,context.user.locale));
    
                receiptMessage += '\n';
                receiptMessage += receiptTemplate;
              }
                //context.chatInterface.toUser(context.user,message);
              message = message + receiptMessage;
              dialog.sendMessage(context, message , true);

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
              (async() => {  
                await new Promise(resolve => setTimeout(resolve, 1000));
                let { services, messageBundle } = receiptService.getSupportedServicesAndMessageBundle();
                let preamble = dialog.get_message(messages.services.question.preamble, context.user.locale);
                let { prompt, grammer } = dialog.constructListPromptAndGrammer(services, messageBundle, context.user.locale);
                context.grammer = grammer;
                prompt = prompt.replace(/\n/g,"\n\n");
                let message = `${preamble}${prompt}`+'\n\n';
                message = message + dialog.get_message(messages.lastState, context.user.locale);
                dialog.sendMessage(context, message, true);
              })();
              
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
              dialog.sendMessage(context, message , true);
            }),
            always : [
              {
                target: 'receiptQuestion'
              }
            ]
          } 
        }
      },
      pdfReceiptList: {
        id: 'pdfReceiptList',
        initial: 'invoke',
        states:{
          invoke:{
            onEntry: assign( (context, event) => {
              (async() => {   
                await new Promise(resolve => setTimeout(resolve, 1000));
                let receiptList = [];
                let message  = dialog.get_message(messages.pdfReceiptList,context.user.locale);
                let receipts = context.receipts.slots.multipleRecordReceipt;
                if(receipts.length == 1)
                  receiptList.push(receipts);
                else
                  receiptList = receipts;
              
                for(let i = 0; i < receiptList.length; i++){
                  let receipt = receipts[i];
                  let receiptTemplate = dialog.get_message(messages.pdfReceiptList.receiptTemplate, context.user.locale);
                  receiptTemplate = receiptTemplate.replace('{{amount}}', receipt.amount);
                  receiptTemplate = receiptTemplate.replace('{{date}}', receipt.date);
  
                  message += '\n\n';
                  message += (i + 1) + '. ';
                  message += receiptTemplate;
                }
  
                dialog.sendMessage(context, message , true);
              })();
              
            }),
            on: {
              USER_MESSAGE: 'process'
            }

          },
          process: {
            onEntry: assign((context, event) => {
              let parsed = parseInt(event.message.input.trim());
              let isValid = (parsed >= 1 && parsed <= context.receipts.slots.multipleRecordReceipt.length);
              context.message = {
                isValid: isValid,
                messageContent: event.message.input
              };
              context.receipts.slots.receiptNumber=parsed;
            }),
            always: [
              {
                target: '#receiptPdf',
                cond: (context, event) => {
                  return context.message.isValid;
                }
              },
              {
                target: 'error',
                cond: (context, event) => {
                  return !context.message.isValid;
                }
              }
            ]
          },
          error: {
            onEntry: assign( (context, event) => {
              let message =dialog.get_message(messages.paramInputInitiate.error,context.user.locale);
              dialog.sendMessage(context, message , true);
            }),
            always : 'invoke'
          }
        }

      },
      receiptPdf:{
        id:"receiptPdf",
        initial:'start',
        states:{
          start:{
            invoke: {
              id: 'fetchPdfilestoreId',
              src: (context, event) => {
                var receiptIndex = context.receipts.slots.receiptNumber;
                let receiptData = context.receipts.slots.multipleRecordReceipt[receiptIndex-1];
                context.extraInfo.fileName = receiptData.id;
                
                var businessService, transactionNumber
                dialog.sendMessage(context, dialog.get_message(messages.wait,context.user.locale), true);

                (async() => {
                  if(receiptData.fileStoreId && receiptData.fileStoreId!= null){
                    var pdfContent = {
                      output: receiptData.fileStoreId,
                      type: "pdf",
                    };
                    dialog.sendMessage(context, pdfContent);
                    await new Promise(resolve => setTimeout(resolve, 3000));
                    dialog.sendMessage(context, dialog.get_message(messages.lastState,context.user.locale));
                  }
                  else {
                        businessService = receiptData.businessService;
                        transactionNumber = receiptData.transactionNumber;
                        let payment = await receiptService.multipleRecordReceipt(context.user,businessService,null,transactionNumber, true);
                        await receiptService.getPdfFilestoreId(businessService, payment, context.user);
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        dialog.sendMessage(context, dialog.get_message(messages.lastState,context.user.locale));
                  }
                })();

                return Promise.resolve();
              },
              onDone: {
                target:'#endstate'
              }

            },
            
          },
          
        }

      },
      lastState: {
        id: 'lastState',
        initial: 'invoke',
        states:{
          invoke:{
            onEntry: assign((context, event) => {}),
            on: {
              USER_MESSAGE: 'process'
            }
          },
          process: {
            onEntry: assign((context, event) => {
              var isValid = event.message.input.trim().toLowerCase() == 'mseva'
              context.receipts.slots.validInput = isValid;

            }),
            always: {
                target: 'invoke',
                cond: (context, event) => {
                  return !context.receipts.slots.validInput;
                }
            }
            

          }
        }  
        

      }

    }//receipts.states
};

let messages = {
  services:{
    question: {
      preamble: {
        en_IN: 'Type and send the option number to view payment history for the preferred service  👇',
        hi_IN: 'कृपया नीचे 👇 दिए गए सूची से अपना विकल्प टाइप करें और भेजें:'
      },
    },
    error:{
      en_IN: 'Selected option seems to be invalid 😐\n\nPlease select the valid option to proceed further.',
      hi_IN: 'मुझे क्षमा करें, मुझे समझ नहीं आया। फिर से कोशिश करें।'
    },
  },
  trackReceipts:{
    error:{
      en_IN: 'Sorry. Some error occurred on server!',
      hi_IN: 'माफ़ करना। सर्वर पर कुछ त्रुटि हुई!'
    },
  },
  receiptSlip:{
    not_found:{
      en_IN: 'Sorry 😥 !  Your mobile number is not linked to selected service.\n\n👉 We can still proceed to view payment history using the *{{searchOption}}* mentioned in your {{service}} bill/receipt.',
      hi_IN: 'सॉरी 😥 ! आपका मोबाइल नंबर चयनित सेवा से लिंक नहीं है।'
    },
    error:{
      en_IN:'Sorry. Some error occurred on server.',
      hi_IN: 'माफ़ करना। सर्वर पर कुछ त्रुटि हुई!'
    },
    listofreceipts:{
      singleRecord: {
        en_IN:'👉  {{service}} payment receipt\n\nConnection No       {{id}}\nAmount Paid       Rs. {{amount}}\nDate of Payment       {{date}}\n\nReceipt Link : {{receiptDocumentLink}}\n\n',
        hi_IN: 'आपकी {{service}} {{locality}}, {{city}} में संपत्ति के खिलाफ उपभोक्ता संख्या {{id}} के लिए भुगतान रसीद नीचे दी गई है 👇:\n\n भुगतान की प्रति देखने और डाउनलोड करने के लिए लिंक पर क्लिक करें ।\n\n {{date}} - रु {{amount}} - {{transactionNumber}} \n पलक: {{receiptDocumentLink}}\n\n'
      },
      multipleRecordsSameService: {
        en_IN: 'Following {{service records}} records found linked to your mobile number.\n\nPlease type and send the applicable option number to view the payment history 👇',
        hi_IN: 'कई रिकॉर्ड मिले हैं। आगे बढ़ने के लिए एक रिकॉर्ड का चयन करें। आप हमेशा वापस आ सकते हैं और एक और रिकॉर्ड चुन सकते हैं।',
        receiptTemplate: {
          en_IN: '*{{consumerNumber}}*\n{{id}}\n*Locality:* {{locality}} , {{city}}',
          hi_IN: '*उपभोक्ता संख्या*\n{{id}} ,\n*इलाका:* {{locality}} , {{city}}'
        }
      }
    },
  },
  searchReceptInitiate:{
    question:{
      en_IN:'Please type and send ‘1’ to Search and View for past payments which are not linked to your mobile number.',
      hi_IN:'पिछले भुगतानों के खोज और दृश्य के लिए जो आपके मोबाइल नंबर से लिंक नहीं हैं| कृपया 1 टाइप करें और भेजें',
    },
    error:{
      en_IN: 'Selected option seems to be invalid 😐\n\nPlease select the valid option to proceed further.',
      hi_IN: 'मुझे क्षमा करें, मुझे समझ नहीं आया। फिर से कोशिश करें।'
    },


  },
  mobileLinkage:{
    notLinked: {
      en_IN: 'Sorry 😥 !  Your mobile number is not linked to selected service.\n\n👉 We can still proceed to view payment history using the {{searchOption}} mentioned in your {{service}} bill/receipt.',
      hi_IN: 'ऐसा लगता है कि आपके द्वारा उपयोग किया जा रहा मोबाइल नंबर {{service}} सेवा से लिंक नहीं है। कृपया अपने खाता नंबर को {{service}} सेवा से जोड़ने के लिए शहरी स्थानीय निकाय पर जाएँ। फिर भी आप अपनी खाता जानकारी खोजकर सेवा का लाभ उठा सकते हैं।',
      resultHeader:{
        en_IN: 'Here are your past bill payment 👇\n\n',
        hi_IN: 'ये रहा आपका भुगतान इतिहास 👇\n\n',
      }
    },
  },
  searchParams:{
    question: {
      preamble: {
        en_IN: 'Please type and send the number for your option👇\n\n*1.* Yes\n*2.* No',
        hi_IN: 'कृपया टाइप करें और अपने विकल्प के लिए नंबर भेजें👇\n\n1.हां\n2.नहीं'
      },
      confirmation: {
        en_IN: 'Type and send option number to indicate if you know the *{{searchOption}}* 👇\n\n*1.* Yes\n*2.* No',
        hi_IN: 'क्या आपके पास भुगतान के लिए आगे बढ़ने के लिए {{searchOption}} है ?\n'
      }
    },
    error:{
      en_IN: 'Selected option seems to be invalid 😐\n\nPlease select the valid option to proceed further.',
      hi_IN: 'मुझे क्षमा करें, मुझे समझ नहीं आया। फिर से कोशिश करें।'
    },
  },
  paramInput: {
    question: {
      en_IN: 'Please enter the *{{option}}*\n\n{{example}}',
      hi_IN: 'भुगतान रसीदें देखने के लिए कृपया *{{option}}* डालें।\n\n{{example}}'
    },
    re_enter: {
      en_IN: 'The entered {{option}} is not found in our records.\n\nPlease check the entered details and try again.\n\n👉 To go back to the main menu, type and send mseva.',
      hi_IN: 'क्षमा करें, आपके द्वारा प्रदान किया गया मान गलत है। \n कृपया फिर से बिल प्राप्त करने के लिए {{option}} फिर से दर्ज करें।\n\nऔर टाइप करें "mseva" और मुख्य मेनू पर वापस जाएं।'
    }
  },
  receiptSearchResults:{
    error:{
      en_IN:'Sorry. Some error occurred on server.',
      hi_IN: 'माफ़ करना। सर्वर पर कुछ त्रुटि हुई!'
    },
    norecords:{
      en_IN:'The {{searchparamoption}} :   {{paramInput}}   is not found in our records.\n\nPlease check the entered details and try again.',
      hi_IN: 'आपके द्वारा प्रदान किए गए विवरण {{searchparamoption}} :   {{paramInput}} हमारे रिकॉर्ड में नहीं पाया जाता है। कृपया आपके द्वारा प्रदान किए गए विवरण को एक बार फिर से देखें।'
    },
    results:{
      singleRecord: {
        en_IN:'👉  {{service}} payment receipt\n\nConnection No       {{id}}\nAmount Paid       Rs. {{amount}}\nDate of Payment       {{date}}\n\nReceipt Link : {{receiptDocumentLink}}\n\n',
        hi_IN: 'आपकी {{service}} {{locality}}, {{city}} में संपत्ति के खिलाफ उपभोक्ता संख्या {{id}} के लिए भुगतान रसीद नीचे दी गई है 👇:\n\n भुगतान की प्रति देखने और डाउनलोड करने के लिए लिंक पर क्लिक करें ।\n\n {{date}} - रु {{amount}} - {{transactionNumber}} \n पलक: {{receiptDocumentLink}}\n\n'
      },
      multipleRecordsSameService: {
        en_IN: 'Following {{service records}} records found linked to your mobile number.\n\nPlease type and send the applicable option number to view the payment history 👇',
        hi_IN: 'कई रिकॉर्ड मिले हैं। आगे बढ़ने के लिए एक रिकॉर्ड का चयन करें। आप हमेशा वापस आ सकते हैं और एक और रिकॉर्ड चुन सकते हैं।',
        receiptTemplate: {
          en_IN: 'Consumer Number - {{id}}\nLocality: {{locality}} , {{city}}',
          hi_IN: 'उपभोक्ता संख्या - {{id}} , {{locality}} , {{city}}'
        }
      }
    },
  },
  paramInputInitiate: {
    question: {
      en_IN: '👉 To view last payment receipt, type and send *1*\n\n👉 To go back to the main menu, type and send *mseva*.',
      hi_IN: '👉 अंतिम भुगतान रसीद देखने के लिए, टाइप करें और भेजें *1* \n\n👉 मुख्य मेनू पर वापस जाने के लिए, *mseva* टाइप करें और भेजें।'
    },
    error:{
      en_IN: 'Selected option seems to be invalid 😐\n\nPlease select the valid option to proceed further.',
      hi_IN: 'मुझे क्षमा करें, मुझे समझ नहीं आया। फिर से कोशिश करें।'
    },

  },
  receiptNumber:{
    question: {
      en_IN: 'Please type and send the number of your option from the list of receipts shown above:',
      hi_IN: 'कृपया ऊपर दिखाए गए रसीदों की सूची से अपना विकल्प टाइप करें और भेजें: '
    },
  },
  multipleRecordReceipt:{
    error:{
      en_IN:'Sorry. Some error occurred on server.',
      hi_IN: 'माफ़ करना। सर्वर पर कुछ त्रुटि हुई!'
    },
    singleReceipt: {
      en_IN:'Your {{service}} payment receipt for consumer number {{id}} against property in  {{locality}},{{city}} is given 👇 below:\n\nClick on the link to view and download a copy of payment receipt.\n\n {{date}} - Rs.  {{amount}} -  {{transactionNumber}}\nLink: {{receiptDocumentLink}}\n\n',
      hi_IN: 'आपकी {{service}} {{locality}}, {{city}} में संपत्ति के खिलाफ उपभोक्ता संख्या {{id}} के लिए भुगतान रसीद नीचे दी गई है 👇:\n\n भुगतान की प्रति देखने और डाउनलोड करने के लिए लिंक पर क्लिक करें ।\n\n {{date}} - रु {{amount}} - {{transactionNumber}} \n पलक: {{receiptDocumentLink}}\n\n'
    },
    multipleReceipts: {
      en_IN: 'Here is your payment history 👇\n\n',
      hi_IN: 'ये रहा आपका भुगतान इतिहास 👇',
      receiptTemplate: {
        en_IN: '{{date}}    {{status}}       {{amount}}',
        hi_IN: '{{date}}    {{status}}       {{amount}}'
      }
    },
    header:{
      en_IN: '*{{date}}*                 *{{status}}*     *{{amount}}*',
      hi_IN: '*{{date}}*                 *{{status}}*     *{{amount}}*',
      date:{
        en_IN:'Date',
        hi_IN:'तारीख'
      },
      amount:{
        en_IN:'Amount',
        hi_IN:'रकम'
      },
      status:{
        en_IN:'Status',
        hi_IN:'स्थिति'
      },
      paid:{
        en_IN:'Paid',
        hi_IN:'भुगतान किया'
      }
    }
    
  },
  pdfReceiptList:{
    en_IN:"To view the receipt, please type and send the option number 👇",
    hi_IN:"रसीद देखने के लिए कृपया टाइप करें और अपने विकल्प के लिए नंबर भेजें 👇",
    receiptTemplate:{
      en_IN: "*Paid:* ₹ {{amount}} | *Date:* {{date}}",
      hi_IN: "*भुगतान किया गया:* ₹ {{amount}} | *तारीख:* {{date}}"
    }
  },
  lastState:{
    en_IN: '👉 To go back to the main menu, type and send *mseva*.',
    hi_IN: '👉 मुख्य मेनू पर वापस जाने के लिए, टाइप करें और *mseva* भेजें।',
    template: {
      en_IN: '*Consumer Number*\n{{id}}\n*Amount Paid*   {{amount}}\n*Paid On*   {{date}}',
      hi_IN: '*Consumer Number*\n{{id}}\n*Amount Paid*   {{amount}}\n*Paid On*   {{date}}'
    }
  },
  wait:{
    en_IN: "Please wait while your receipt is being generated.",
    hi_IN: "कृपया प्रतीक्षा करें जब तक कि आपकी रसीद उत्पन्न न हो जाए।"
  }
  
};
let grammer = {
  confirmation: {
    choice: [
      {intention: 'Yes', recognize: ['1']},
      {intention: 'No', recognize: ['2']}
    ]
  }
};

module.exports = receipts;