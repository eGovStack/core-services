const { Machine, assign } = require('xstate');
const pgr = require('./pgr');
const bills = require('./bills');
const receipts = require('./receipts');
const userProfileService = require('./service/egov-user-profile');
const dialog = require('./util/dialog.js');

const sevaMachine = Machine({
  id: 'mseva',
  initial: 'start',
  on: {
    USER_RESET: {
      target: '#welcome',
      // actions: assign( (context, event) => dialog.sendMessage(context, dialog.get_message(messages.reset, context.user.locale), false))
    }
  },
  states: {
    start: {
      on: {
        USER_MESSAGE: [
          {
            cond: (context) => context.user.locale,
            target: '#welcome'
          },
          {
            target: '#onboarding'
          }
        ]
      }
    },
    onboarding: {
      id: 'onboarding',
      initial: 'onboardingLocale',
      states:{
        onboardingLocale: {
          id: 'onboardingLocale',
          initial: 'question',
          states: {
            question: {
              onEntry: assign((context, event) => {
                context.onboarding = {};
                let message = messages.onboarding.onboardingLocale.question;
                context.grammer = grammer.locale.question;
                dialog.sendMessage(context, message, true);
              }),
              on: {
                USER_MESSAGE: 'process'
              }
            },
            process: {
              onEntry: assign((context, event) => {
                if(dialog.validateInputType(event, 'text'))
                  context.intention = dialog.get_intention(context.grammer, event, true);
                else 
                  context.intention = dialog.INTENTION_UNKOWN;
                if(context.intention != dialog.INTENTION_UNKOWN) {
                  context.user.locale = context.intention;
                } else {
                  context.user.locale = 'en_IN';
                }
                context.onboarding.locale = context.user.locale;
              }),
              always: '#onboardingWelcome'
            }
          }
        },
        onboardingWelcome: {
          id: 'onboardingWelcome',
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.onboarding.onboardingWelcome, context.user.locale);
            dialog.sendMessage(context, message, false);
          }),
          always: '#onboardingName'
        },
        onboardingName: {
          id: 'onboardingName',
          initial: 'preCondition',
          states: {
            preCondition: {
              always: [
                {
                  target: '#onBoardingUserProfileConfirmation',
                  cond: (context) => context.user.name 
                },
                {
                  target: 'question'
                }
              ]
            },
            question: {
              onEntry: assign((context, event) => {
                let message = dialog.get_message(messages.onboarding.onboardingName.question, context.user.locale);
                dialog.sendMessage(context, message);
              }),
              on: {
                USER_MESSAGE: 'process'
              }
            },
            process: {
              onEntry: assign((context, event) => {
                if(!dialog.validateInputType(event, 'text'))
                  return;
                  context.onboarding.name = dialog.get_input(event, false);
              }),
              always: [
                {
                  cond: (context) => context.onboarding.name,
                  target: '#onboardingNameConfirmation'
                },
                {
                  target: '#onboardingUpdateUserProfile'
                }
              ]
            }
          }
        },
        onBoardingUserProfileConfirmation: {
          id: 'onBoardingUserProfileConfirmation',
          initial: 'question',
          states: {
            question: {
              onEntry: assign((context, event) => {
                let message = dialog.get_message(messages.onboarding.onBoardingUserProfileConfirmation.question, context.user.locale);
                message = message.replace('{{name}}', context.user.name);
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
                  target: '#onboardingUpdateUserProfile',
                  cond: (context) => context.intention == 'Yes'
                },
                {
                  target: '#changeName',
                  cond: (context) => context.intention == 'No',
                }
              ]
            }
          }
        },
        changeName: {
          id: 'changeName',
          initial: 'invoke',
          states: {
            invoke: {
              onEntry: assign((context, event) => {
                let message = dialog.get_message(messages.onboarding.changeName.question, context.user.locale);
                dialog.sendMessage(context, message);
              }),
              on: {
                USER_MESSAGE: 'process'
              }

            },
            process: {
              onEntry: assign((context, event) => {
                if(!dialog.validateInputType(event, 'text'))
                  return;
                  context.onboarding.name = dialog.get_input(event, false);
              }),
              always: {
                  target: '#onboardingNameConfirmation',
                  cond: (context) => context.onboarding.name,
              }
            }
          }
              
        },
        onboardingNameConfirmation: {
          id: 'onboardingNameConfirmation',
          initial: 'question',
          states: {
            question: {
              onEntry: assign((context, event) => {
                let message = dialog.get_message(messages.onboarding.onboardingNameConfirmation, context.user.locale);
                message = message.replace('{{name}}', context.onboarding.name);
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
                  target: '#onboardingUpdateUserProfile',
                  actions: assign((context, event) => {
                    context.user.name = context.onboarding.name;
                  }),
                  cond: (context) => context.intention == 'Yes',
                },
                {
                  target: '#changeName',
                  cond: (context) => context.intention == 'No',
                },
                {
                  target: 'error'
                }
              ]
            },
            error: {
              onEntry: assign((context, event) => {
                let message = dialog.get_message(dialog.global_messages.error.retry, context.user.locale);
                dialog.sendMessage(context, message, false);
              }),
              always: 'question'
            }
          }
        },
        onboardingUpdateUserProfile: {
          id: 'onboardingUpdateUserProfile',
          invoke: {
            id: 'updateUserProfile',
            src: (context, event) => userProfileService.updateUser(context.user, context.onboarding, context.extraInfo.tenantId),
            onDone: [
              {
                target: '#onboardingThankYou',
                actions: assign((context, event) => {
                  context.user.name = context.onboarding.name;
                  context.user.locale = context.onboarding.locale;
                  context.onboarding = undefined;
                }),
                cond: (context) => context.onboarding.name
              },
              {
                target: '#welcome'
              }
            ],
            onError: {
              target: '#welcome'
            }
          }
        },
        onboardingThankYou: {
          id: 'onboardingThankYou',
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.onboarding.onboardingThankYou, context.user.locale);
            message = message.replace('{{name}}', context.user.name);
            dialog.sendMessage(context, message, false);
          }),
          always: '#welcome'
        },
      }
    },
    welcome: {
      id: 'welcome',
      initial: 'preCondition',
      states: {
        preCondition: {
              always: [
                {
                  target: 'invoke',
                  cond: (context) => context.user.locale 
                },
                {
                  target: '#onboarding'
                }
              ]
        },
        invoke: {
              onEntry: assign((context, event) => {
                var message = dialog.get_message(messages.welcome, context.user.locale);
                if(context.user.name)
                  message = message.replace('{{name}}', context.user.name);
                else 
                  message = message.replace(' {{name}}', 'Citizen');
                dialog.sendMessage(context, message, false);
              }),
              always: '#sevamenu'
        }

      }      
    },
    updateLocale: {
      id: 'updateLocale',
      onEntry: assign((context, event) => {
        var message = dialog.get_message(messages.updateLocaleMessage, context.user.locale);
        if(context.user.name)
          message = message.replace('{{name}}', context.user.name);
        else 
          message = message.replace(' {{name}}', '');
        dialog.sendMessage(context, message, false);
      }),
      always: '#sevamenu'
    },
    locale: {
      id: 'locale',
      initial: 'question',
      states: {
        question: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.locale.question, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process'
          }
        },
        process: {
          invoke: {
            id: 'updateUserLocale',
            src: (context, event) => {
              if(dialog.validateInputType(event, 'text')) {
                context.intention = dialog.get_intention(grammer.locale.question, event, true);
              } else {
                context.intention = dialog.INTENTION_UNKOWN;
              }
              if (context.intention === dialog.INTENTION_UNKOWN) {
                context.user.locale = 'en_IN';
                dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.proceeding, context.user.locale));
              } else {
                context.user.locale = context.intention;
              }
              return userProfileService.updateUser(context.user, context.extraInfo.tenantId);
            },
            onDone: [
              {
                target: '#updateLocale',
                cond: (context) => context.intention != dialog.INTENTION_UNKOWN
              },
              {
                target: '#sevamenu',
                cond: (context) => context.intention === dialog.INTENTION_UNKOWN
              }
            ],
            onError: {
              target: '#welcome'
            }
          }
        }
      }
    },
    sevamenu : { 
      id: 'sevamenu',
      initial: 'question',
      states: {
        question: {
          onEntry: assign( (context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.sevamenu.question, context.user.locale), true);
          }),
          on: {
            USER_MESSAGE: 'process'
          }
        },
        process: {
          onEntry: assign((context, event) => {
            if(dialog.validateInputType(event, 'text'))
              context.intention = dialog.get_intention(grammer.menu.question, event, true);
            else
              context.intention = dialog.INTENTION_UNKOWN;
          }),
          always: [
            {
              target: '#pgr',
              cond: (context) => context.intention == 'file_new_complaint'
            },
            {
              target: '#pgr',
              cond: (context) => context.intention == 'track_existing_complaints'
            },
            {
              target: '#bills', 
              cond: (context) => context.intention == 'pt_bills'
            },
            {
              target: '#bills', 
              cond: (context) => context.intention == 'ws_bills'
            },
            {
              target: '#receipts', 
              cond: (context) => context.intention == 'receipts'
            },
            {
              target: '#locale', 
              cond: (context) => context.intention == 'locale'
            },
            {
              target: 'error'
            }
          ]
        }, // sevamenu.process
        error: {
          onEntry: assign( (context, event) => {
            dialog.sendMessage(context, dialog.get_message(dialog.global_messages.error.retry, context.user.locale), false);
          }),
          always : 'question'
        }, // sevamenu.error 
        pgr: pgr,
        bills: bills,
        receipts: receipts
      } // sevamenu.states
    }, // sevamenu
    endstate: {
      id: 'endstate',
      always: 'start',
      // type: 'final', //Another approach: Make it a final state so session manager kills this machine and creates a new one when user types again
      // onEntry: assign((context, event) => {
      //   dialog.sendMessage(context, dialog.get_message(messages.endstate, context.user.locale));
      // })
    },
    system_error: {
      id: 'system_error',
      always: {
        target: '#welcome',
        actions: assign((context, event) => {
          let message = dialog.get_message(dialog.global_messages.system_error, context.user.locale);
          dialog.sendMessage(context, message, false);
          context.chatInterface.system_error(event.data);
        })
      }
    }
  }, // states
}); // Machine

let messages = {
  reset: {
    en_IN: 'Ok. Let\'s start over.',
    hi_IN: 'ठीक। फिर से शुरू करते हैं।'
  },
  onboarding: {
    onboardingWelcome:{
      en_IN: 'Dear Citizen,\n\nWelcome to mSeva Punjab 🙏\n\nNow you can file/ track your complaints and pay your bills via WhatsApp.',
      hi_IN: 'प्रिय नागरिक,\n\nएमसेवा पंजाब में आपका स्वागत है 🙏\n\nअब आप व्हाट्सएप के माध्यम से अपनी शिकायतें दर्ज/ट्रैक कर सकते हैं और अपने बिलों का भुगतान कर सकते हैं।'
    }, 
    onboardingLocale: {
      question: 'Please select the language of your choice 👇\n\nनीचे दिए गए पर्याय में से आपकी पसंदीदा भाषा का चयन करें।\n\n👉    Type 1 for English\n👉    हिन्दी के लिये २ टाइप करे\n👉    ਪੰਜਾਬੀ ਲਈ 3 ਟਾਈਪ ਕਰੋ'
    },
    onboardingName: {
      question: {
        en_IN: 'As per our records,  we have not found any name linked to this mobile number.\n\n👉  Please write your name to continue.',
        hi_IN: 'हमारे रिकॉर्ड के अनुसार, हमें इस मोबाइल नंबर से जुड़ा कोई नाम नहीं मिला है।\n\n👉 जारी रखने के लिए कृपया अपना नाम लिखें।'
      }      
    },
    onBoardingUserProfileConfirmation: {
      question: {
        en_IN: 'As per our records,  we have found the name  *“{{name}}”* linked with this mobile number.\n\n👉  Type and send 1 to confirm the name.\n\n👉  Type and send 2 to change the name.',
        hi_IN: 'हमारे रिकॉर्ड के अनुसार, हमें इस मोबाइल नंबर से जुड़ा हुआ नाम *“{{name}}”* मिला है।\n\n👉 नाम की पुष्टि करने के लिए 1 टाइप करें और भेजें।\n\n👉 टाइप करें और बदलने के लिए 2 भेजें। नाम।'
      }      
    },
    changeName: {
      question: {
        en_IN: 'Please provide your name to continue.',
        hi_IN: 'जारी रखने के लिए कृपया अपना नाम प्रदान करें।'
      }
    },
    onboardingNameConfirmation: {
      en_IN: "Confirm Name : {{name}} ?\n\n👉  Type and Send *1* to confirm the name.\n\n👉  Type and Send *2* to change the name.",
      hi_IN: "कृपया अपने नाम {{name}} की पुष्टि करने के लिए “1” टाइप करें। यदि आप अपना नाम बदलना चाहते हैं, तो “2” टाइप कीजिए।"
    },
    onboardingThankYou: {
      en_IN: 'Thanks for providing the confirmation 👍 We are happy to serve you 😊',
      hi_IN: 'विवरण के लिए आपका बहुत-बहुत धन्यवाद {{name}}, हम आपकी सेवा करके प्रसन्न हैं।'
    }  
  },
  locale : {
    question: {
      en_IN: "Please choose your preferred language\n1. English\n2. हिंदी",
      hi_IN: "कृपया अपनी पसंदीदा भाषा चुनें\n1. English\n2. हिंदी"
    }
  },
  welcome: {
    en_IN: 'Dear {{name}},\n\nWelcome to mSeva Punjab 🙏.\n\nNow you can file/ track your complaints and pay your bills via WhatsApp.\n',
    hi_IN: 'नमस्ते {{name}},\n\nmSeva पंजाब में आपका स्वागत है 🙏।\n\nअब आप WhatsApp द्वारा कई सुविधाओं का लाभ ले सकते है जैसे शिकायत दर्ज करना, बिल का भुगतान करना।'
  },
  sevamenu: {
    question: {
      en_IN : 'How can we serve you today? Please type and send the number of your option👇\n\n1. File a complaint\n2. Track your complaints.\n3. Pay Water & Sewerage Bill.\n4. Pay Prperty Tax Bill.\n5. View Payments Receipts.\n6. Change Language.\n\n👉  At any stage type and send mseva to go back to the main menu.',
      hi_IN: 'कृपया नीचे 👇 दिए गए सूची से अपना विकल्प टाइप करें और भेजें:\n\n1. शिकायतों के लिए\n2. बिलों के लिए\n3. रसीदों के लिए\n4. भाषा बदलने के लिए'
    }
  },
  endstate: {
    en_IN: 'Goodbye. Say hi to start another conversation',
    hi_IN: 'अलविदा। एक और बातचीत शुरू करने के लिए नमस्ते कहें'
  },
  updateLocaleMessage:{
    en_IN: 'Thank you {{name}} for updating the Language of your choice.\n',
    hi_IN: 'अपनी पसंद की भाषा को अपडेट करने के लिए धन्यवाद {{name}} ।\n'
  }
}

let grammer = {
  locale: {
    question: [
      {intention: 'en_IN', recognize: ['1', 'english']},
      {intention: 'hi_IN', recognize: ['2', 'hindi']}
    ]
  },
  menu: {
    question: [
      {intention: 'file_new_complaint', recognize: ['1', 'file', 'new']},
      {intention: 'track_existing_complaints', recognize: ['2', 'track', 'existing']},
      {intention: 'ws_bills', recognize: ['3', 'wsbill']},
      {intention: 'pt_bills', recognize: ['4', 'ptbill']},
      {intention: 'receipts', recognize: ['5','receipt']},
      {intention: 'locale', recognize: ['6','language', 'english', 'hindi']}
    ]
  },
  confirmation: {
    choice: [
      {intention: 'Yes', recognize: ['1', 'yes', 'Yes']},
      {intention: 'No', recognize: ['2', 'no', 'No']}
    ]
  }
}

module.exports = sevaMachine;
