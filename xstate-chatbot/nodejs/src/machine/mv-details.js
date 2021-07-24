/* eslint-disable max-len */
const { assign, actions } = require('xstate');
const moment = require('moment');
const dialog = require('./util/dialog');
const config = require('../env-variables');
const { messages, grammers } = require('./messages/mv-details')
const mediaUtil = require('./util/media');
const { mvService } = require('./service/service-loader');


const mvFlow = {
  id: 'mvFlow',
  initial: 'selectLanguagemv',
  onEntry: assign((context, event) => {
    context.slots.mv = {};
  }),
  states: {
    selectLanguagemv: {
      id: 'selectLanguagemv',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.selectLanguagemv.prompt.preamble, context.user.locale);
            const { prompt, grammer } = dialog.constructListPromptAndGrammer(messages.selectLanguagemv.prompt.options.list, messages.selectLanguagemv.prompt.options.messageBundle, context.user.locale);
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
              target: '#mvMobileNumber',
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
    }, // selectLanguagemv
    mvMobileNumber: {
      id: 'mvMobileNumber',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.mvMobileNumber.prompt, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            context.message = dialog.get_input(event, false);
          }),
          invoke: {
            src: (context, event) => mvService.getMVDetailsFromMobileNumber(context.message),
            onDone: [
              {
                cond: (context, event) => event.data.success == '1',
                actions: assign((context, event) => {
                  context.slots.mv.user_id = event.data.response.user_id;

                }),
                target: '#mvMenu',
              },
              {
                target: 'error',
              },
            ],
          },
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.mvMobileNumber.error), false);
          }),
          always: 'prompt',
        },
      },
    },
    mvMenu: {
      id: 'mvMenu',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.mvMenu.prompt.preamble, context.user.locale);
            const { grammer, prompt } = dialog.constructListPromptAndGrammer(messages.mvMenu.prompt.options.list, messages.mvMenu.prompt.options.messageBundle, context.user.locale);
            message += prompt;
            context.grammer = grammer;
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
              cond: (context) => context.intention == 'startOfDayReport',
              target: '#startOfDayReport',
            },
            {
              cond: (context) => context.intention == 'intermediateReport',
              target: '#intermediateReport',
            },
            {
              cond: (context) => context.intention == 'endOfDayReport',
              target: '#endOfDayReport',
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
    },
    startOfDayReport: {
      id: 'startOfDayReport',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            const mediaMessage = mediaUtil.createMediaMessage(`${config.staticMediaPath}/location_sharing_info`, 'jpeg', undefined, '');
            dialog.sendMessage(context, mediaMessage, false);
            dialog.sendMessage(context, dialog.get_message(messages.mvLocation.prompt, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            if (event.message.type === 'location') {
              const str = event.message.input.toString().substring(1, event.message.input.length - 1);
              const latlong = str.split(',');
              const latitude = latlong[0];
              const longitude = latlong[1];
              input = `(${latitude},${longitude})`;
              context.slots.mv.longitude = longitude;
              context.slots.mv.latitude = latitude;
              context.isValid = true;
            } else {
              context.isValid = false;
            }
          }),
          invoke: {
            src: (context, event) => mvService.submitMVLocation(context.slots.mv),
            onDone: [
              {
                actions: assign((context, event) => {
                  let message = dialog.get_message(messages.locationSuccess.prompt, context.user.locale);
                  dialog.sendMessage(context, message);
                }),
                target: '#endstate',
              },
            ],
          },
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.mvLocation.error, context.user.locale), false);
          }),
          always: 'prompt',
        },
      },
    },
    intermediateReport: {
      id: 'intermediateReport',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            const mediaMessage = mediaUtil.createMediaMessage(`${config.staticMediaPath}/location_sharing_info`, 'jpeg', undefined, '');
            dialog.sendMessage(context, mediaMessage, false);
            dialog.sendMessage(context, dialog.get_message(messages.mvLocation.prompt, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            if (event.message.type === 'location') {
              const str = event.message.input.toString().substring(1, event.message.input.length - 1);
              const latlong = str.split(',');
              const latitude = latlong[0];
              const longitude = latlong[1];
              input = `(${latitude},${longitude})`;
              context.slots.mv.longitude = longitude;
              context.slots.mv.latitude = latitude;
              context.isValid = true;
            } else {
              context.isValid = false;
            }
          }),
          always: [

            {
              cond: (context) => context.isValid == true,
              target: '#imageUploadSbm',
            },
            {
              target: 'error',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.mvLocation.error, context.user.locale), false);
          }),
          always: 'prompt',
        },
      },
    },
    imageUploadSbm: {
      id: 'imageUploadSbm',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.imageUpload.prompt, context.user.locale);
            dialog.sendMessage(context, message);
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
             if(dialog.validateInputType(event, 'image')) {
            context.slots.mv.image = event.message.input;
            context.message.isValid = true;
              }
          }),
          always: [
            {
              cond: (context) => context.isValid == true,
              target: '#submitMvReportLocationWithImage',
            },
            {
              target: 'error',
            },
          ]
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.invalidOptionsbm, context.user.locale));
          }),
          always: 'prompt',
        },
      },
    },
    submitMvReportLocationWithImage: {
      id: 'submitMvReportLocationWithImage',
      invoke: {
        src: (context) => mvService.submitMVLocationImage(context.slots.mv),
        onDone: [
          {
            cond: (context, event) => event.data.success === 1,
            actions: assign((context, event) => {
              dialog.sendMessage(context, dialog.get_message(messages.submitmvIntermediateReport.prompt, context.user.locale));
            }),
            target: '#endstate',
          },
          {
            target: '',
          },
        ],
      },

    },
    endOfDayReport: {
      id: 'endOfDayReport',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.noofHouseholds.prompt, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            const input = dialog.get_input(event);
            if (input >= 0 && input <= 108) {
              context.isValid = true;
              context.slots.mv.noofHouseholds = input;
            } else {
              context.isValid = false;
            }
          }),
          always: [
            {
              cond: (context) => context.isValid == true,
              target: '#trainingConducted',
            },
            {
              target: 'error',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.noofHouseholds.error, context.user.locale));
          }),
          always: 'prompt',
        },
      },
    },
    trainingConducted: {
      id: 'trainingConducted',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            context.grammer = grammers.binaryChoice.grammer;
            let message = dialog.get_message(messages.trainingConducted.prompt, context.user.locale);
            message += dialog.get_message(grammers.binaryChoice.prompt, context.user.locale);
            dialog.sendMessage(context, message);
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            context.intention = dialog.get_intention(context.grammer, event, true);
            context.slots.mv.trainingConducted = context.intention;
            if (context.intention == 'YES' || context.intention == 'NO')
              context.isValid = true;
            else
              context.isValid = false;
          }),
          always: [

            {
              cond: (context) => context.isValid == false,
              target: 'error',
            },
            {
              target: '#noOfParticipantsInTraining',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.trainingConducted.error), false);
          }),
          always: 'prompt',
        },
      },
    },
    NoOfParticipantsInTraining: {
      id: 'noOfParticipantsInTraining',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.noOfParticipantsInTraining.prompt, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            const input = dialog.get_input(event);
            if (input >= 0 && input <= 108) {
              context.isValid = true;
              context.slots.mv.noOfParticipantsInTraining = input;
            } else {
              context.isValid = false;
            }
          }),
          always: [
            {
              cond: (context) => context.isValid == true,
              target: '#visitSchoolOrReligiousInstitution',
            },
            {
              target: 'error',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.noOfParticipantsInTraining.error), false);
          }),
          always: 'prompt',
        },
      },
    },
    visitSchoolOrReligiousInstitution: {
      id: 'visitSchoolOrReligiousInstitution',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            context.grammer = grammers.binaryChoice.grammer;
            let message = dialog.get_message(messages.visitSchoolOrReligiousInstitution.prompt, context.user.locale);
            message += dialog.get_message(grammers.binaryChoice.prompt, context.user.locale);
            dialog.sendMessage(context, message);
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            context.intention = dialog.get_intention(context.grammer, event, true);
            context.slots.mv.visitSchoolOrReligiousInstitution = context.intention;
            if (context.intention == 'YES' || context.intention == 'NO')
              context.isValid = true;
            else
              context.isValid = false;
          }),
          always: [

            {
              cond: (context) => context.isValid == false,
              target: 'error',
            },
            {
              target: '#visitMRFOrProcessingUnit',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.trainingConducted.error), false);
          }),
          always: 'prompt',
        },
      },
    },
    visitMRFOrProcessingUnit: {
      id: 'visitMRFOrProcessingUnit',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            context.grammer = grammers.binaryChoice.grammer;
            let message = dialog.get_message(messages.visitMRFOrProcessingUnit.prompt, context.user.locale);
            message += dialog.get_message(grammers.binaryChoice.prompt, context.user.locale);
            dialog.sendMessage(context, message);
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            context.intention = dialog.get_intention(context.grammer, event, true);
            context.slots.mv.visitMRFOrProcessingUnit = context.intention;
            if (context.intention == 'YES' || context.intention == 'NO')
              context.isValid = true;
            else
              context.isValid = false;
          }),
          always: [

            {
              cond: (context) => context.isValid == false,
              target: 'error',
            },
            {
              target: '#otherWork',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.trainingConducted.error), false);
          }),
          always: 'prompt',
        },
      },
    },
    otherWork: {
      id: 'otherWork',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.otherWork.prompt, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            const message = dialog.get_input(event, false);
            if (event.message.type == 'text' && message.length < 100 && /^[ A-Za-z]+$/.test(message.trim())) {
              context.slots.mv.otherWork = message;
              context.validMessage = true;
            } else {
              context.validMessage = false;
            }
          }),
          always: [
            {
              cond: (context) => context.validMessage,
              target: '#submitmvEndReport',
            },
            {
              target: 'error',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.otherWork.error), false);
          }),
          always: 'prompt',
        },
      },
    },
    submitmvEndReport: {
      id: 'submitmvEndReport',
      invoke: {
        src: (context) => mvService.submitEndDayReport(context.slots.mv),
        onDone: [
          {
            actions: assign((context, event) => {
              let message = dialog.get_message(messages.submitmvEndReport.prompt, context.user.locale);
              dialog.sendMessage(context, message);
            }),
            target: '#endstate',
          },
        ],
      },
    },

  },
};

module.exports = mvFlow;

