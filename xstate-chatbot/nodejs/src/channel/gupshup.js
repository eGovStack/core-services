const fetch = require('node-fetch');
require('url-search-params-polyfill');
const config = require('../env-variables');

// This is a template file for whatsapp provider integration.
// Refer to this file for onboarding of new whatsapp provider to the chatbot service.

class GupShupWhatsAppProvider {
  processMessageFromUser(req) {
    const reformattedMessage = {};
    const requestBody = req.body;

    if (requestBody.type != 'message') {
      return undefined;
    }

    const { type } = requestBody.payload;
    let input;
    if (type === 'location') {
      const location = requestBody.payload.payload;
      input = `(${location.latitude},${location.longitude})`;
    } else {
      input = requestBody.payload.payload.text;
    }

    reformattedMessage.message = {
      input,
      type,
    };
    reformattedMessage.user = {
      mobileNumber: requestBody.payload.sender.phone.slice(2),
    };

    return reformattedMessage;
  }

  async sendMessageToUser(user, outputMessages) {
    if (!Array.isArray(outputMessages)) {
      const message = outputMessages;
      outputMessages = [message];
      console.warn('Output array had to be constructed. Remove the use of deeprecated function from the code. \ndialog.sendMessage() function should be used to send any message instead of any previously used methods.');
    }
    for (const message of outputMessages) {
      const phone = user.mobileNumber;

      const url = 'https://api.gupshup.io/sm/api/v1/msg';

      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        apiKey: config.gupshup.apikey,
      };

      const urlSearchParams = new URLSearchParams();

      urlSearchParams.append('channel', 'whatsapp');
      urlSearchParams.append('source', config.whatsAppBusinessNumber);
      urlSearchParams.append('destination', `91${phone}`);
      urlSearchParams.append('src.name', config.gupshup.botname);
      urlSearchParams.append('message', message);

      const request = {
        method: 'POST',
        headers,
        body: urlSearchParams,
      };

      await fetch(url, request);
    }
  }
}

module.exports = new GupShupWhatsAppProvider();
