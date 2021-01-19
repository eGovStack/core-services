const config = require('../../env-variables');
const valueFirst = require('../../channel/value-first');        // TODO: import channel
const fetch = require("node-fetch");

const consumerGroupOptions = require('../../session/kafka/kafka-consumer-group-options');

const kafka = require('kafka-node');

class PaymentStatusUpdateEventFormatter{

    async paymentStatusMessage(data){
      var request = JSON.parse(data);
      let payment = reques.Payments;
      var reformattedMessage = {};
        
        if(payment.additionalDetails && payment.additionalDetails.fromWhatsApp){
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
          if(response.status == 200){
            reformattedMessage = await this.prepareMessage(response,payment);
            let user = reformattedMessage.user;
            let messages = reformattedMessage.message;
            let extraInfo = reformattedMessage.extraInfo;
            await valueFirst.sendMessageToUser(user, messages,extraInfo);
          }
        }

    }

   async prepareMessage(response,payment){
     let reformattedMessage = {};

     reformattedMessage.user = {
      mobileNumber: payment.mobileNumber
     };

     reformattedMessage.message=[];
     var content = {
       type: "pdf"
     };
     reformattedMessage.message.push(content);

     reformattedMessage.extraInfo = {
      whatsAppBusinessNumber: config.whatsAppBusinessNumber,
      filestoreId: response.filestoreIds[0]
     };

     return reformattedMessage;
   }

}

let paymentStatusUpdateEvents = new PaymentStatusUpdateEventFormatter();

module.exports = paymentStatusUpdateEvents;