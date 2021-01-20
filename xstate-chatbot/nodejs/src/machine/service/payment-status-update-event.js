const config = require('../../env-variables');
const valueFirst = require('../../channel/value-first');        // TODO: import channel
const fetch = require("node-fetch");
const dialog = require('../util/dialog');

const consumerGroupOptions = require('../../session/kafka/kafka-consumer-group-options');

const kafka = require('kafka-node');

class PaymentStatusUpdateEventFormatter{

  constructor() {
    let consumerGroup = new kafka.ConsumerGroup(consumerGroupOptions, config.paymentUpdateTopic);
    let self = this;
    consumerGroup.on('message', function(message) {
        if(message.topic === config.paymentUpdateTopic) {
            self.paymentStatusMessage(JSON.parse(message.value))
            .then(() => {
                console.log("payment message sent to citizen");        // TODO: Logs to be removed
            })
            .catch(error => {
                console.error('error while sending event message');
                console.error(error.stack || error);
            });
        }
    });
}

  async paymentStatusMessage(request){
    let payment = request.Payment;
    var reformattedMessage = {};
  
    if(payment.additionalDetails && payment.additionalDetails.isWhatsapp){
      let tenantId = payment.tenantId;
      tenantId = tenantId.split(".")[0]; 
      let pdfUrl = config.externalHost + 'pdf-service/v1/_create';
      pdfUrl = pdfUrl + '?key=consolidatedreceipt' + '&tenantId=' + tenantId;

      let requestBody = {
        RequestInfo: {
          authToken: request.RequestInfo.authToken
        },
        Payments:[]
      };
      requestBody.Payments.push(payment);

      let options = {
        method: 'POST',
        origin: '*',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
      let response = await fetch(pdfUrl, options);
      if(response.status == 201){
        let responseBody = await response.json();
        let user = {
          mobileNumber: payment.mobileNumber
        };
        let extraInfo = {
          whatsAppBusinessNumber: config.whatsAppBusinessNumber.slice(2),
          filestoreId: responseBody.filestoreIds[0]
        };

        let messages = await this.prepareSucessMessage(payment);
    
        await valueFirst.sendMessageToUser(user, messages,extraInfo);
      }
    }

  }

  async prepareSucessMessage(payment){
    let message=[];
    let locale = "en_IN";
    let template = dialog.get_message(messageBundle.paymentSucess,locale);
    template = template.replace('{{transaction_number}}',payment.transactionNumber);

    var content = {
      message:template,
      type: "text"
    };
    message.push(content);

    var pdfContent ={
      type: "pdf"
    };
    message.push(pdfContent);

    return message;
  }

}

let messageBundle = {
  paymentSucess:{
    en_IN: "Thank you😃! You have successfully paid your bill through mSeva Punjab. Your transaction number is {{transaction_number}}.\n\nPlease find attached receipt for your reference.\n"
  },
  paymentFail:{
    en_IN: "Sorry😥! The Payment Transaction has failed due to authentication failure. Your transaction reference number is {{transaction_number}}.\nIf the amount is debited from your account please give us 2-3 hours to get confirmation on payment.\nIf the amount is  not deducted from your account you can retry using the following payment link:\n{{link}}"
  }

};

let paymentStatusUpdateEvents = new PaymentStatusUpdateEventFormatter();

module.exports = paymentStatusUpdateEvents;
