const fetch = require('node-fetch');
const urlencode = require('urlencode');
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const uuid = require('uuid-random');
const geturl = require('url');
const path = require('path');
const config = require('../env-variables');
require('url-search-params-polyfill');

const valueFirstRequestBody = '{"@VER":"1.2","USER":{"@USERNAME":"","@PASSWORD":"","@UNIXTIMESTAMP":""},"DLR":{"@URL":""},"SMS":[]}';

const textMessageBody = '{"@UDH":"0","@CODING":"1","@TEXT":"","@TEMPLATEINFO":"","@PROPERTY":"0","@ID":"","ADDRESS":[{"@FROM":"","@TO":"","@SEQ":"","@TAG":""}]}';

const imageMessageBody = '{"@UDH":"0","@CODING":"1","@TEXT":"","@CAPTION":"","@TYPE":"image","@CONTENTTYPE":"image\/png","@TEMPLATEINFO":"","@PROPERTY":"0","@ID":"","ADDRESS":[{"@FROM":"","@TO":"","@SEQ":"","@TAG":""}]}';

const templateMessageBody = '{"@UDH":"0","@CODING":"1","@TEXT":"","@CAPTION":"","@TYPE":"","@CONTENTTYPE":"","@TEMPLATEINFO":"","@PROPERTY":"0","@ID":"","ADDRESS":[{"@FROM":"","@TO":"","@SEQ":"1","@TAG":""}]}';

class ValueFirstWhatsAppProvider {
  async checkForMissedCallNotification(requestBody) {
    if (requestBody.Call_id || requestBody.operartor || requestBody.circle) return true;

    return false;
  }

  async getMissedCallValues(requestBody) {
    const reformattedMessage = {};

    reformattedMessage.message = {
      input: 'hi',
      type: 'text',
    };

    reformattedMessage.user = {
      mobileNumber: requestBody.mobile_number.slice(2),
    };
    reformattedMessage.extraInfo = {
      whatsAppBusinessNumber: config.whatsAppBusinessNumber,
      tenantId: config.rootTenantId,
      missedCall: true,
    };
    return reformattedMessage;
  }

  async fileStoreAPICall(fileName, fileData) {
    let url = config.egovServices.egovServicesHost + config.egovServices.egovFilestoreServiceUploadEndpoint;
    url = `${url}&tenantId=${config.rootTenantId}`;
    const form = new FormData();
    form.append('file', fileData, {
      filename: fileName,
      contentType: 'image/jpg',
    });
    const response = await axios.post(url, form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    const filestore = response.data;
    return filestore.files[0].fileStoreId;
  }

  async convertFromBase64AndStore(imageInBase64String) {
    imageInBase64String = imageInBase64String.replace(/ /g, '+');
    const buff = Buffer.from(imageInBase64String, 'base64');
    const tempName = `pgr-whatsapp-${Date.now()}.jpg`;

    /* fs.writeFile(tempName, buff, (err) => {
            if (err) throw err;
        }); */

    const filestoreId = await this.fileStoreAPICall(tempName, buff);

    return filestoreId;
  }

  async getUserMessage(requestBody) {
    const reformattedMessage = {};
    let type;
    let input;
    if (requestBody.media_type) type = requestBody.media_type;
    else type = 'unknown';

    if (type === 'location') {
      input = `(${requestBody.latitude},${requestBody.longitude})`;
    } else if (type === 'image') {
      const imageInBase64String = requestBody.media_data;
      input = await this.convertFromBase64AndStore(imageInBase64String);
    } else if (type === 'unknown' || type === 'document') input = ' ';
    else {
      input = requestBody.text;
    }

    reformattedMessage.message = {
      input,
      type,
    };
    reformattedMessage.user = {
      mobileNumber: requestBody.from.slice(2),
    };
    reformattedMessage.extraInfo = {
      whatsAppBusinessNumber: requestBody.to,
      tenantId: config.rootTenantId,
    };

    return reformattedMessage;
  }

  async isValid(requestBody) {
    try {
      if (await this.checkForMissedCallNotification(requestBody)) // validation for misscall
      { return true; }

      const type = requestBody.media_type;

      if (type === 'text' || type === 'image') return true;

      if (type || type.length >= 1) return true;
    } catch (error) {
      console.error('Invalid request');
    }
    return false;
  }

  async getTransformedRequest(requestBody) {
    const missCall = await this.checkForMissedCallNotification(requestBody);
    let reformattedMessage = {};

    if (missCall) reformattedMessage = await this.getMissedCallValues(requestBody);
    else reformattedMessage = await this.getUserMessage(requestBody);

    return reformattedMessage;
  }

  async downloadImage(url, filename) {
    const writer = fs.createWriteStream(filename);

    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }

  async getFileForFileStoreId(filestoreId) {
    let url = config.egovServices.egovServicesHost + config.egovServices.egovFilestoreServiceDownloadEndpoint;
    url = `${url}?`;
    url = `${url}tenantId=${config.rootTenantId}`;
    url = `${url}&`;
    url = `${url}fileStoreIds=${filestoreId}`;

    const options = {
      method: 'GET',
      origin: '*',
    };

    let response = await fetch(url, options);
    response = await (response).json();
    const fileURL = response.fileStoreIds[0].url.split(',');
    let fileName = geturl.parse(fileURL[0]);
    fileName = path.basename(fileName.pathname);
    fileName = fileName.substring(13);
    await this.downloadImage(fileURL[0].toString(), fileName);
    const file = fs.readFileSync(fileName, 'base64');
    fs.unlinkSync(fileName);
    return file;
  }

  async getTransformedResponse(user, messages, extraInfo) {
    const userMobile = user.mobileNumber;

    const fromMobileNumber = extraInfo.whatsAppBusinessNumber;
    if (!fromMobileNumber) console.error('Receipient number can not be empty');

    const requestBody = JSON.parse(valueFirstRequestBody);
    requestBody.USER['@USERNAME'] = config.valueFirstWhatsAppProvider.valueFirstUsername;
    requestBody.USER['@PASSWORD'] = config.valueFirstWhatsAppProvider.valueFirstPassword;

    for (let i = 0; i < messages.length; i++) {
      let output;
      let type;
      if (typeof messages[i] === 'string') {
        type = 'text';
        output = messages[i];
      }

      if (typeof messages[i] === 'object') {
        type = messages[i].type;
        output = messages[i].output;
      }

      let messageBody;
      if (type === 'text') {
        messageBody = JSON.parse(textMessageBody);
        const encodedMessage = urlencode(output, 'utf8');
        messageBody['@TEXT'] = encodedMessage;
      } else if (type === 'media') {
        const buffer = fs.readFileSync(path.resolve(__dirname, `../../${output}`), 'base64');
        var uniqueImageMessageId = uuid();
        messageBody = JSON.parse(imageMessageBody);
        messageBody['@TEXT'] = buffer;
        messageBody['@ID'] = uniqueImageMessageId;
        if (messages[i].mediaType === 'pdf') {
          messageBody['@TYPE'] = 'document';
          messageBody['@CONTENTTYPE'] = 'application/pdf';
          messageBody['@CAPTION'] = messages[i].caption;
        }
      } else {
        // TODO for non-textual messages
        let fileStoreId;
        if (message) fileStoreId = message;
        const base64Image = await this.getFileForFileStoreId(fileStoreId);
        var uniqueImageMessageId = uuid();
        messageBody = JSON.parse(imageMessageBody);
        if (type === 'pdf') {
          messageBody['@TYPE'] = 'document';
          messageBody['@CONTENTTYPE'] = 'application/pdf';
          messageBody['@CAPTION'] = `${extraInfo.fileName}-${Date.now()}`;
        }
        messageBody['@TEXT'] = base64Image;
        messageBody['@ID'] = uniqueImageMessageId;
      }
      messageBody.ADDRESS[0]['@FROM'] = fromMobileNumber;
      messageBody.ADDRESS[0]['@TO'] = `91${userMobile}`;

      requestBody.SMS.push(messageBody);
    }

    return requestBody;
  }

  async sendMessage(requestBody) {
    const url = config.valueFirstWhatsAppProvider.valueFirstURL;

    const headers = {
      'Content-Type': 'application/json',
    };

    const request = {
      method: 'POST',
      headers,
      origin: '*',
      body: JSON.stringify(requestBody),
    };
    const response = await fetch(url, request);
    if (response.status === 200) {
      console.log('Message sent to user using vFirst');
      const messageBack = await response.json();
      if (messageBack.MESSAGEACK.Err) {
        console.error(messageBack.MESSAGEACK.Err.Desc);
        return messageBack;
      }

      return messageBack;
    }

    console.error('Error in sending message');
    return undefined;
  }

  async processMessageFromUser(req) {
    console.log('Received message from vFirst');
    let reformattedMessage = {};
    let requestBody = req.query;

    if (Object.keys(requestBody).length === 0) requestBody = req.body;

    // var requestValidation= await this.isValid(requestBody);

    // if(requestValidation){
    reformattedMessage = await this.getTransformedRequest(requestBody);
    return reformattedMessage;
    // }
  }

  async sendMessageToUser(user, messages, extraInfo) {
    let requestBody = {};
    if (extraInfo.missedCall) {
      await this.sendMessageForTemplate([{
        user,
        extraInfo: {
          templateId: config.valueFirstWhatsAppProvider.valueFirstWelcomeMessageTemplateId,
        },
      }]);
    } else {
      requestBody = await this.getTransformedResponse(user, messages, extraInfo);
      this.sendMessage(requestBody);
    }
  }

  async sendMessageForTemplate(reformattedMessages) {
    if (reformattedMessages.length > 0) {
      const requestBody = JSON.parse(valueFirstRequestBody);
      requestBody.USER['@USERNAME'] = config.valueFirstWhatsAppProvider.valueFirstUsername;
      requestBody.USER['@PASSWORD'] = config.valueFirstWhatsAppProvider.valueFirstPassword;

      for (const message of reformattedMessages) {
        const messageBody = JSON.parse(templateMessageBody);
        const templateParams = message.extraInfo.params;
        let combinedStringForTemplateInfo = message.extraInfo.templateId;
        const userMobile = message.user.mobileNumber;

        if (templateParams) {
          for (const param of templateParams) combinedStringForTemplateInfo = `${combinedStringForTemplateInfo}~${param}`;
        }

        messageBody['@TEMPLATEINFO'] = combinedStringForTemplateInfo;

        messageBody.ADDRESS[0]['@FROM'] = config.whatsAppBusinessNumber;
        messageBody.ADDRESS[0]['@TO'] = `91${userMobile}`;

        requestBody.SMS.push(messageBody);
      }
      this.sendMessage(requestBody);
    }
  }
}

module.exports = new ValueFirstWhatsAppProvider();
