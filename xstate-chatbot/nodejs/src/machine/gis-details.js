/* eslint-disable max-len */
const { assign, actions } = require('xstate');
const moment = require('moment');
const dialog = require('./util/dialog');
const config = require('../env-variables');
const { messages, grammers } = require('./messages/gis-details')
const mediaUtil = require('./util/media');
const { personService, bedsService, gisService } = require('./service/service-loader');
const { target } = require('./chat-machine');

function isNumeric(value) {
  return /^-?\d+$/.test(value);
}
const gisFlow = {
  id: 'gisFlow',
  initial: 'selectLanguageGis',
  onEntry: assign((context, event) => {
    context.slots.property = {};
  }),
  states: {
    selectLanguageGis: {
      id: 'selectLanguageGis',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.selectLanguageGis.prompt.preamble, context.user.locale);
            const { prompt, grammer } = dialog.constructListPromptAndGrammer(messages.selectLanguageGis.prompt.options.list, messages.selectLanguageGis.prompt.options.messageBundle, context.user.locale);
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
              target: '#gisMobileNumber',
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
    gisMobileNumber: {
      id: 'gisMobileNumber',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.gisMobileNumber.prompt, context.user.locale));
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
            src: (context, event) => gisService.getGisDetailsFromMobileNumber(context.message),
            onDone: [
              {
                cond: (context, event) => event.data.success == '1',
                actions: assign((context, event) => {
                  context.slots.property.user_id = event.data.response.user_id;
                }),
                target: '#gismenu',
              },
              {
                cond: (context, event) => context.message=='Hi',
                actions: assign((context, event) => {
                  context.slots.property.user_id = event.data.response.user_id;
                }),
                target: '#selectLanguage',
              },
              {
                target: 'error',
              },
            ],
          },
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.gisMobileNumber.error, context.user.locale));
          }),
          always: 'prompt',
        },
      },

    },
    gismenu: {
      id: 'gismenu',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.gisInfo.prompt.preamble, context.user.locale);
            const { grammer, prompt } = dialog.constructListPromptAndGrammer(messages.gisInfo.prompt.options.list, messages.gisInfo.prompt.options.messageBundle, context.user.locale);
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
              cond: (context) => context.intention == 'addNewProperty',
              target: '#addNewProperty',
            },
            {
              cond: (context) => context.intention == 'validateExistingProperty',
              target: '#validateExistingProperty',
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
    addNewProperty: {
      id: 'addNewProperty',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.temporaryParcelId.prompt, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            const tempId = dialog.get_input(event, false);
            context.slots.property.tempId = tempId
            context.isValid = true;
          }),
          always: [
            {
              cond: (context) => context.isValid == true,
              target: '#houseNo',
            },
            {
              target: 'error',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.invalidOption, context.user.locale), false);
          }),
          always: 'prompt',
        },
      },
    },
    houseNo: {
      id: 'houseNo',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.addhouseNo.prompt, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            const hno_input = dialog.get_input(event, false);
            context.isValid = true;
            context.slots.property.houseNo = hno_input;
          }),
          always: [
            {
              cond: (context) => context.isValid == true,
              target: '#blockNo',
            },
            {
              target: 'error',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.invalidOption, context.user.locale));
          }),
          always: 'prompt',
        },
      },
    },
    blockNo: {
      id: 'blockNo',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.addblockNo.prompt, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            const input = dialog.get_input(event, false);
            const blockNo = parseInt(input);

            context.isValid = true;
            context.slots.property.blockNo = blockNo;
          }),
          always: [
            {
              cond: (context) => context.isValid == true,
              target: '#ownerName',
            },
            {
              target: 'error',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.invalidOption, context.user.locale));
          }),
          always: 'prompt',
        },
      },
    },
    ownerName: {
      id: 'ownerName',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.addownerName.prompt, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            const message = dialog.get_input(event, false);
            if (event.message.type == 'text' && message.length < 100 && /^[ A-Za-z]+$/.test(message.trim())) {
              context.slots.property.ownerName = message;
              context.isValid = true;
            } else {
              context.isValid = false;
            }
          }),
          always: [
            {
              cond: (context) => context.isValid == false,
              target: 'error',
            },
            {
              target: '#contactNo',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.invalidOption, context.user.locale));
          }),
          always: 'prompt',
        },
      },
    },
    contactNo: {
      id: 'contactNo',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.addcontactNo.prompt, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            const input = dialog.get_input(event, false);
            const contactNo = parseInt(input);
            if (isNumeric(contactNo) === true && input.length == '10') {
              context.isValid = true;
              context.slots.property.contactNo = contactNo;
            } else {
              context.isValid = false;
            }
          }),
          always: [
            {
              cond: (context) => context.isValid == false,
              target: 'error',
            },
            {
              target: '#propertyuse',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.addcontactNo.error, context.user.locale));
          }),
          always: 'prompt',
        },
      },
    },
    propertyuse: {
      id: 'propertyuse',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.addpropertyuse.prompt, context.user.locale);
            const { grammer, prompt } = dialog.constructListPromptAndGrammer(messages.propertyUseList.prompt.options.list, messages.propertyUseList.prompt.options.messageBundle, context.user.locale);
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
            if (context.intention === 'INTENTION_UKNOWN')
              context.isValid = false;
            else
              context.slots.property.typeOfProperty = context.intention;
          }),
          always: [
            {
              cond: (context) => context.isValid == false,
              target: 'error',
            },
            {
              target: '#noOfFloor',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.invalidOption, context.user.locale));
          }),
          always: 'prompt',
        },
      },
    },
    noOfFloor: {
      id: 'noOfFloor',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.addnoOfFloor.prompt, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            const input = dialog.get_input(event, false);
            context.isValid = true;
            context.slots.property.noOfFloors = input;
          }),
          always: [
            {
              cond: (context) => context.isValid == true,
              target: '#waterConnectionNo',
            },
            {
              target: 'error',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.invalidOption, context.user.locale));
          }),
          always: 'prompt',
        },
      },
    },
    waterConnectionNo: {
      id: 'waterConnectionNo',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.addwaterconnection.prompt, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            const waterconnection = dialog.get_input(event, false);
            context.isValid = true;
            context.slots.property.waterConnection = waterconnection;
          }),
          always: [
            {
              cond: (context) => context.isValid == true,
              target: '#sewageConnectionNo',
            },
            {
              target: 'error',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.invalidOption, context.user.locale));
          }),
          always: 'prompt',
        },
      },
    },
    sewageConnectionNo: {
      id: 'sewageConnectionNo',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.addsewageconnection.prompt, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            const sewageConnection = dialog.get_input(event, false);
            context.isValid = true;
            context.slots.property.sewageConnection = sewageConnection;
          }),
          always: [
            {
              cond: (context) => context.isValid == true,
              target: '#propertyId',
            },
            {
              target: 'error',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.invalidOption, context.user.locale));
          }),
          always: 'prompt',
        },
      },
    },
    propertyId: {
      id: 'propertyId',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.addpropertyId.prompt, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            const propertyId = dialog.get_input(event, false);
            context.isValid = true;
            context.slots.property.propertyId = propertyId;
          }),
          always: [
            {
              cond: (context) => context.isValid == true,
              target: '#addProperty',
            },
            {
              target: 'error',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.invalidOption, context.user.locale));
          }),
          always: 'prompt',
        },
      },
    },
    addProperty: {
      id: 'addProperty',
      invoke: {
        src: (context) => gisService.addPropertyDetails(context.slots.property),
        onDone: [
          {
            cond: (context, event) => event.data.success === 1,
            actions: assign((context, event) => {
              dialog.sendMessage(context, dialog.get_message(messages.propertyAdded.prompt, context.user.locale));
              context.message = undefined;
            }),
            target: '#endstate',
          },
          {
            target: '',
          },
        ],
      },

    },
    validateExistingProperty: {
      id: 'validateExistingProperty',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.validateExistingProperty.prompt, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            context.message = dialog.get_input(event, false);
            context.slots.property.UID = context.message;
          }),
          invoke: {
            src: (context, event) => gisService.getPropertyFromPropertyId(context.message),
            onDone: [
              {
                cond: (context, event) => event.data.success === 1,
                actions: assign((context, event) => {
                  let message = dialog.get_message(messages.houseNo.prompt, context.user.locale);
                  message += `:: ${event.data.response.OldHouseNo} \n`;
                  context.slots.property.OldHouseNo = event.data.response.OldHouseNo;
                  message += dialog.get_message(messages.blockNo.prompt, context.user.locale);
                  message += `:: ${event.data.response.blockNo} \n`;
                  context.slots.property.blockNo = event.data.response.blockNo;
                  message += dialog.get_message(messages.ownerName.prompt, context.user.locale);
                  message += `:: ${event.data.response.OwnerName} \n`;
                  context.slots.property.ownerName = event.data.response.OwnerName;
                  message += dialog.get_message(messages.contactNo.prompt, context.user.locale);
                  message += `:: ${event.data.response.ContactNumber} \n`;
                  context.slots.property.contactNo = event.data.response.ContactNumber;
                  message += dialog.get_message(messages.propertyUse.prompt, context.user.locale);
                  message += `:: ${event.data.response.LandUseDetail} \n`;
                  context.slots.property.typeOfProperty = event.data.response.LandUseDetail;
                  message += dialog.get_message(messages.noOfFloors.prompt, context.user.locale);
                  message += `:: ${event.data.response.NoOfFloors} \n`;
                  context.slots.property.noOfFloors = event.data.response.NoOfFloors;
                  message += dialog.get_message(messages.waterConnection.prompt, context.user.locale);
                  message += `:: ${event.data.response.WaterConnection} \n`;
                  context.slots.property.waterConnection = event.data.response.WaterConnection;
                  message += dialog.get_message(messages.sewerageConnection.prompt, context.user.locale);
                  message += `:: ${event.data.response.SewageConnection} \n`;
                  context.slots.property.sewageConnection = event.data.response.SewageConnection;
                  message += dialog.get_message(messages.proprtyId.prompt, context.user.locale);
                  message += `:: ${event.data.response.PropertyTax} \n`;
                  context.slots.property.propertyTax = event.data.response.PropertyTax;
                  dialog.sendMessage(context, message);
                }),
                target: '#updateExistingPropertyMemu',
              },

              {
                target: 'error',
              },
            ],
          },
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.invalidOption, context.user.locale));
          }),
          always: 'prompt',
        },
      },
    },
    updateExistingPropertyMemu: {
      id: 'updateExistingPropertyMemu',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            let message = dialog.get_message(messages.updateExistingPropertyMemu.prompt.preamble, context.user.locale);
            const { grammer, prompt } = dialog.constructListPromptAndGrammer(messages.updateExistingPropertyMemu.prompt.options.list, messages.updateExistingPropertyMemu.prompt.options.messageBundle, context.user.locale);
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
              cond: (context) => context.intention == 'OldHouseNo',
              target: '#updateHouseNo',
            },
            {
              cond: (context) => context.intention == 'blockNo',
              target: '#updateBlockNo',
            },
            {
              cond: (context) => context.intention == 'ownerName',
              target: '#updateownerName',
            },
            {
              cond: (context) => context.intention == 'contactNo',
              target: '#updatecontactNo',
            },
            {
              cond: (context) => context.intention == 'NoOfFloors',
              target: '#updateNoOfFloors',
            },
            {
              cond: (context) => context.intention == 'WaterConnection',
              target: '#updateWaterConnection',
            },
            {
              cond: (context) => context.intention == 'SewageConnection',
              target: '#updateSewageConnection',
            },
            {
              cond: (context) => context.intention == 'propertyId',
              target: '#updateTypeOfProperty',
            },
            {
              cond: (context) => context.intention == 'INTENTION_UKNOWN',
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
    updateHouseNo: {
      id: 'updateHouseNo',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.addhouseNo.prompt, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            const hno_input = dialog.get_input(event, false);
            context.isValid = true;
            context.slots.property.houseNo = hno_input;
          }),
          always: [
            {
              cond: (context) => context.isValid == true,
              target: '#anyOtherUpdate',
            },
            {
              target: 'error',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.invalidOption, context.user.locale));
          }),
          always: 'prompt',
        },
      },
    },
    updateBlockNo: {
      id: 'updateBlockNo',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.addblockNo.prompt, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            const input = dialog.get_input(event, false);
            const blockNo = parseInt(input);
            context.isValid = true;
            context.slots.property.blockNo = blockNo;
          }),
          always: [
            {
              cond: (context) => context.isValid == true,
              target: '#anyOtherUpdate',
            },
            {
              target: 'error',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.invalidOption, context.user.locale));
          }),
          always: 'prompt',
        },
      },
    },
    updateownerName: {
      id: 'updateownerName',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.addownerName.prompt, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            const ownerName = dialog.get_input(event, false);
            if (event.message.type == 'text' && ownerName.length < 100 && /^[ A-Za-z]+$/.test(ownerName.trim())) {
              context.slots.property.ownerName = ownerName;
              context.isValid = true;
            } else {
              context.isValid = false;
            }
          }),
          always: [
            {
              cond: (context) => context.isValid == true,
              target: '#anyOtherUpdate',
            },
            {
              target: 'error',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.invalidOption, context.user.locale));
          }),
          always: 'prompt',
        },
      },
    },
    updatecontactNo: {
      id: 'updatecontactNo',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.addcontactNo.prompt, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            const input = dialog.get_input(event, false);
            const contactNo = parseInt(input);
            if (isNumeric(contactNo) === true && input.length == '10') {
              context.isValid = true;
              context.slots.property.contactNo = contactNo;
            } else {
              context.isValid = false;
            }
          }),
          always: [
            {
              cond: (context) => context.isValid == true,
              target: '#anyOtherUpdate',
            },
            {
              target: 'error',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.invalidOption, context.user.locale));
          }),
          always: 'prompt',
        },
      },
    },
    updateNoOfFloors: {
      id: 'updateNoOfFloors',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.addnoOfFloor.prompt, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            const noOfFloors = dialog.get_input(event, false);
            context.isValid = true;
            context.slots.property.noOfFloors = noOfFloors;
          }),
          always: [
            {
              cond: (context) => context.isValid == true,
              target: '#anyOtherUpdate',
            },
            {
              target: 'error',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.invalidOption, context.user.locale));
          }),
          always: 'prompt',
        },
      },
    },
    updateWaterConnection: {
      id: 'updateWaterConnection',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.addwaterconnection.prompt, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            const waterconnection = dialog.get_input(event, false);
            context.isValid = true;
            context.slots.property.waterConnection = waterconnection;
          }),
          always: [
            {
              cond: (context) => context.isValid == true,
              target: '#anyOtherUpdate',
            },
            {
              target: 'error',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.invalidOption, context.user.locale));
          }),
          always: 'prompt',
        },
      },
    },
    updateSewageConnection: {
      id: 'updateSewageConnection',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.addsewageconnection.prompt, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            const sewageConnection = dialog.get_input(event, false);
            context.isValid = true;
            context.slots.property.sewageConnection = sewageConnection;
          }),
          always: [
            {
              cond: (context) => context.isValid == true,
              target: '#anyOtherUpdate',
            },
            {
              target: 'error',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.invalidOption, context.user.locale));
          }),
          always: 'prompt',
        },
      },
    },
    updateTypeOfProperty: {
      id: 'updateTypeOfProperty',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.addpropertyId.prompt, context.user.locale));
          }),
          on: {
            USER_MESSAGE: 'process',
          },
        },
        process: {
          onEntry: assign((context, event) => {
            const tempId = dialog.get_input(event, false);
            context.slots.property.tempId = tempId
            context.isValid = true;
          }),
          always: [
            {
              cond: (context) => context.isValid == true,
              target: '#anyOtherUpdate',
            },
            {
              target: 'error',
            },
          ],
        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.invalidOption, context.user.locale));
          }),
          always: 'prompt',
        },
      },
    },
    anyOtherUpdate: {
      id: 'anyOtherUpdate',
      initial: 'prompt',
      states: {
        prompt: {
          onEntry: assign((context, event) => {
           let message = dialog.get_message(messages.anyOtherUpdate.prompt.preamble, context.user.locale);
           const { grammer, prompt } = dialog.constructListPromptAndGrammer(messages.anyOtherUpdate.prompt.options.list, messages.anyOtherUpdate.prompt.options.messageBundle, context.user.locale);
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
              cond: (context, event) => context.intention == 'yestoupdate',
              target: '#updateExistingPropertyMemu',
            },
            {
              cond: (context, event) => context.intention == 'notoupdate',
              target: '#updateExistingProperty',
            },
            {
              cond: (context, event) => context.intention == 'INTENTION_UKNOWN',
              target: 'error',
            },
          ],

        },
        error: {
          onEntry: assign((context, event) => {
            dialog.sendMessage(context, dialog.get_message(messages.invalidOption, context.user.locale));
          }),
          always: 'prompt',
        },
      },
    },
    updateExistingProperty: {
      id: 'updateExistingProperty',
      invoke: {
        src: (context) => gisService.updatePropertyDetails(context.slots.property),
        onDone: [
          {
            cond: (context, event) => event.data.success === 1,
            actions: assign((context, event) => {
              let message = dialog.get_message(messages.updateProperty.prompt, context.user.locale);
              dialog.sendMessage(context, message);
            }),
            target: '#endstate',
          }
        ],
      },
    },
  },

};

module.exports = gisFlow;
