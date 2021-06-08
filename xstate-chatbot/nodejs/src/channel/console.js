const config = require('../env-variables');

class ConsoleProvider {
  processMessageFromUser(req) {
    const requestBody = req.body;
    const reformattedMessage = {
      message: {
        type: requestBody.message.type,
        input: requestBody.message.input,
      },
      user: {
        mobileNumber: requestBody.user.mobileNumber,
      },
      extraInfo: {
        whatsAppBusinessNumber: requestBody.extraInfo.whatsAppBusinessNumber,
        tenantId: config.rootTenantId,
      },
    };
    return reformattedMessage;
  }

  sendMessageToUser(user, outputMessages, extraInfo) {
    if (!Array.isArray(outputMessages)) {
      const message = outputMessages;
      outputMessages = [message];
      console.warn('Output array had to be constructed. Remove the use of deeprecated function from the code. \ndialog.sendMessage() function should be used to send any message instead of any previously used methods.');
    }

    // console.log(user);
    for (const message of outputMessages) {
      console.log(message);
    }
  }
}

module.exports = new ConsoleProvider();
