const config = require('../../env-variables');
const fetch = require('node-fetch');

class PdfService {

    async generatePdf(businessService, payment, locale, authToken, userInfo){
        let key;
        if(businessService === 'TL')
            key = 'tradelicense-receipt';

        else if(businessService === 'PT')
            key = 'property-receipt';
      
        else if(businessService === 'WS' || businessService === 'SW')
            key = 'ws-onetime-receipt';

        else
            key = 'consolidatedreceipt';
   

        let pdfUrl = config.egovServices.externalHost + 'pdf-service/v1/_create';
        pdfUrl = pdfUrl + '?key='+key+ '&tenantId=' + config.rootTenantId;

        let requestBody = {
            RequestInfo: {
                authToken: authToken,
                msgId: config.msgId + '|' + locale,
                userInfo: userInfo
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
        };

        let response = await fetch(pdfUrl, options);
        if(response.status == 201){
            let responseBody = await response.json();
            return responseBody.filestoreIds[0];
        }
        else
            return null;

    }
}

const pdfService = new PdfService();

module.exports = pdfService;