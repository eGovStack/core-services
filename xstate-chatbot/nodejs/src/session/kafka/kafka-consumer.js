const config = require('../../env-variables');
const kafka = require('kafka-node');

var options = {
    kafkaHost: config.kafkaHost,
    groupId: config.kafkaConsumerGroupId,
    autoCommit: true,
    protocol: ["roundrobin"],
    fromOffset: "latest",
    outOfRangeOffset: "earliest"
};
  
var consumerGroup = new kafka.ConsumerGroup(options, '');

module.exports = consumerGroup;