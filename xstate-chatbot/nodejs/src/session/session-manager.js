const { State, interpret } = require('xstate');
const chatStateMachine = require('../machine/chat-machine');
const channelProvider = require('../channel');
const chatStateRepository = require('./repo');
const telemetry = require('./telemetry');
const system = require('./system');
const userService = require('./user-service');
const dialog = require('../machine/util/dialog.js');

class SessionManager {
  async fromUser(reformattedMessage) {
    const { mobileNumber } = reformattedMessage.user;
    const user = await userService.getUserForMobileNumber(mobileNumber);
    reformattedMessage.user = user;
    const { userId } = user;

    let chatState = await chatStateRepository.getActiveStateForUserId(userId);
    telemetry.log(userId, 'from_user', reformattedMessage);

    // handle reset case
    const intention = dialog.get_intention(grammer.reset, reformattedMessage, true);
    // if (intention == 'reset' && chatState) {
    //     chatStateRepository.updateState(userId, false, JSON.stringify(chatState));
    //     chatState = null; // so downstream code treats this like an inactive state and creates a new machine
    // }

    let service;
    if (chatState) {
      try {
        // In case state X gets removed after an update
        service = this.getChatServiceFor(chatState, reformattedMessage);
      } catch (err) {
        console.error('Error: Child state not found. Resetting the flow');
        chatState = undefined;
      }
    }
    if (!chatState) {
      // come here if virgin dialog, old dialog was inactive, or reset case
      chatState = this.createChatStateFor(user);
      let saveState = JSON.parse(JSON.stringify(chatState));
      saveState = this.removeUserDataFromState(saveState);
      await chatStateRepository.insertNewState(userId, true, JSON.stringify(saveState));
    }
    service = this.getChatServiceFor(chatState, reformattedMessage);

    const event = (intention == 'reset') ? 'USER_RESET' : 'USER_MESSAGE';
    service.send(event, reformattedMessage);
  }

  async toUser(user, outputMessages, extraInfo) {
    channelProvider.sendMessageToUser(user, outputMessages, extraInfo);
    for (const message of outputMessages) {
      telemetry.log(user.userId, 'to_user', { message: { type: 'text', output: message } });
    }
  }

  removeUserDataFromState(state) {
    const { userId } = state.context.user;
    const { locale } = state.context.user;
    state.context.user = undefined;
    state.context.user = { locale, userId };
    state.event = {};
    state._event = {};
    if (state.history) state.history.context.user = {};
    return state;
  }

  getChatServiceFor(chatStateJson, reformattedMessage) {
    const { context } = chatStateJson;
    context.chatInterface = this;
    const { locale } = context.user;
    context.user = reformattedMessage.user;
    context.user.locale = locale;
    context.extraInfo = reformattedMessage.extraInfo;

    const state = State.create(chatStateJson);
    const resolvedState = chatStateMachine.withContext(context).resolveState(state);
    const service = interpret(chatStateMachine).start(resolvedState);

    service.onTransition((state) => {
      if (state.changed) {
        const { userId } = state.context.user;
        const stateStrings = state.toStrings();
        telemetry.log(userId, 'transition', { destination: stateStrings[stateStrings.length - 1] });

        const active = !state.done && !state.forcedClose;
        let saveState = JSON.parse(JSON.stringify(state)); // deep copy
        saveState = this.removeUserDataFromState(saveState);
        chatStateRepository.updateState(userId, active, JSON.stringify(saveState));
      }
    });

    return service;
  }

  createChatStateFor(user) {
    const service = interpret(chatStateMachine.withContext({
      chatInterface: this,
      user,
    }));
    service.start();
    return service.state;
  }

  system_error(message) {
    system.error(message);
  }
}

let grammer = {
  reset: [
    { intention: 'reset', recognize: ['reset', 'hi', 'hello'] },
  ],
};

module.exports = new SessionManager();
