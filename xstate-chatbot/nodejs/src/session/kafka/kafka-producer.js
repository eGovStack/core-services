const config = require('../../env-variables');

const kafka = require('kafka-node'),
    HighLevelProducer = kafka.HighLevelProducer;

const client = new kafka.KafkaClient({ kafkaHost: "localhost:9092" });
const producer = new HighLevelProducer(client);

producer.on('error', function (err) { console.log('Failed to put record on kafka') });

module.exports = producer;