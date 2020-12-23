const fetch = require("node-fetch");
require('url-search-params-polyfill');

class GupShupWhatsAppProvider {

    processMessageFromUser(req) {
        let reformattedMessage = {}
        let requestBody = req.body;
        
        let type = requestBody.payload.type;
        let input;
        if(type === "location") {
            let location = requestBody.payload.payload;
            input = '(' + location.latitude + ',' + location.longitude + ')';
        } else {
            input = requestBody.payload.payload.text;
        }

        reformattedMessage.message = {
            input: input,
            type: type
        }
        reformattedMessage.user = {
            mobileNumber: requestBody.payload.sender.phone.slice(2)
        };

        return reformattedMessage;
    }

    sendMessageToUser(user, outputMessages) {
        if(!Array.isArray(outputMessages)) {
            let message = outputMessages;
            outputMessages = [ message ];
            console.warn('Output array had to be constructed. Remove the use of deeprecated function from the code. \ndialog.sendMessage() function should be used to send any message instead of any previously used methods.');
        }
        for(let message of outputMessages) {
            let phone = user.mobileNumber;

            let url = "https://api.gupshup.io/sm/api/v1/msg";

            let headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'apiKey': "81ee6fe7c9854228c2270996a3340c1f"
            }

            var urlSearchParams = new URLSearchParams();
            
            urlSearchParams.append("channel", "whatsapp");
            urlSearchParams.append("source", "917834811114");
            urlSearchParams.append("destination", '91' + phone);
            urlSearchParams.append("src.name", "mSevaChatbot");
            urlSearchParams.append("message", message);

            var request = {
                method: "POST",
                headers: headers,
                body: urlSearchParams
            }

            fetch(url, request);
        }
    }
}

module.exports = new GupShupWhatsAppProvider();