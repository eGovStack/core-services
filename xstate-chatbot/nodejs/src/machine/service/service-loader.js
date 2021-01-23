const config = require('../../env-variables');

if(config.serviceProvider === 'eGov') {
    console.log("Using eGov Services");
    module.exports.pgrService = require('./egov-pgr');
    module.exports.billService = require('./egov-bill');
    module.exports.receiptService = require('./egov-receipts');
}
else {
    console.log("Using Dummy Services");
    module.exports.pgrService = require('./dummy-pgr');
    module.exports.billService = require('./dummy-bill');
    module.exports.receiptService = require('./dummy-receipts');
}

if(config.kafka.kafkaConsumerEnabled) {
    module.exports.pgrStatusUpdateEvents = require('./pgr-status-update-events');
    module.exports.paymentStatusUpdateEvents = require('./payment-status-update-event');
}
