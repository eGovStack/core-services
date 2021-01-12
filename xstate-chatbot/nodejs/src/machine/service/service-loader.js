const config = require('../../env-variables');
const dummyPGRService = require('./dummy-pgr');
const egovPGRService = require('./egov-pgr');
const dummyBillService = require('./dummy-bill');
const egovBillService = require('./egov-bill');
const dummyReceiptService = require('./dummy-receipts');
const egovReceiptService = require('./egov-receipts');
const pgrStatusUpdateEvents = require('./pgr-status-update-events');

if(config.serviceProvider === 'eGov') {
    console.log("Using eGov Services");
    module.exports.pgrService = egovPGRService;
    module.exports.billService = egovBillService;
    module.exports.receiptService = egovReceiptService;
    module.exports.pgrStatusUpdateEvents = pgrStatusUpdateEvents;
}
else {
    console.log("Using Dummy Services");
    module.exports.pgrService = dummyPGRService;
    module.exports.billService = dummyBillService;
    module.exports.receiptService = dummyReceiptService;
}
