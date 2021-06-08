const fetch = require('node-fetch');
require('url-search-params-polyfill');
const geturl = require('url');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');
const config = require('../env-variables');

class KaleyraWhatsAppProvider {
  constructor() {
    this.url = config.kaleyra.sendMessageUrl;
    this.url = this.url.replace('{{sid}}', config.kaleyra.sid);
  }

  processMessageFromUser(req) {
    try {
      const requestBody = geturl.parse(req.url, true).query;

      const reformattedMessage = {};
      reformattedMessage.user = {
        mobileNumber: requestBody.from.slice(2),
      };
      reformattedMessage.extraInfo = {
        whatsAppBusinessNumber: requestBody.wanumber,
      };

      const { type } = requestBody;
      if (type == 'text') {
        reformattedMessage.message = {
          type,
          input: requestBody.body,
        };
      } else if (type == 'location') {
        const geoDetail = `(${requestBody.location.latitude},${requestBody.location.longitude})`;
        reformattedMessage.message = {
          type,
          input: geoDetail,
        };
      } else {
        reformattedMessage.message = {
          type: 'unknown',
          input: '',
        };
      }

      return reformattedMessage;
    } catch (err) {
      console.error(`Error while processing message from user: ${err}`);
      return undefined;
    }
  }

  async sendMessageToUser(user, outputMessages, extraInfo) {
    for (const message of outputMessages) {
      const phone = user.mobileNumber;

      const headers = {
        'api-key': config.kaleyra.apikey,
      };

      const form = new FormData();

      form.append('channel', 'whatsapp');
      form.append('from', extraInfo.whatsAppBusinessNumber);
      form.append('to', `91${phone}`);

      if (typeof (message) === 'string') {
        form.append('type', 'text');
        form.append('body', message);
      } else if (message.type == 'media') {
        let buffer;
        buffer = fs.readFileSync(path.resolve(__dirname, `../../${message.output}`));
        form.append('caption', message.caption || '');
        form.append('type', 'media');
        form.append('media', buffer, {
          contentType: 'text/plain',
          name: 'file',
          filename: message.output,
        });
      } else if (message.type == 'template') {
        // TODO: Handle media template
        form.append('type', message.type);
        form.append('body', message.output);
      } else {
        form.append('type', message.type);
        form.append('body', message.output);
      }

      const request = {
        method: 'POST',
        headers,
        body: form,
      };

      const response = await fetch(this.url, request).then((res) => res.json());
      if (response && message.type === 'media' && message.output.includes('dynamic-media')) {
        fs.unlinkSync(path.resolve(__dirname, `../../${message.output}`));
      }
    }
  }
}

module.exports = new KaleyraWhatsAppProvider();
