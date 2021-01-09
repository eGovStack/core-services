const kafka = require('kafka-node');
const config = require('../../env-variables');
const pgrStatusUpdate = require('../../channel/PGRStatusUpdateEventFormatter');

let receiveJob = config.pgrUpdateTopic;

const Consumer = kafka.Consumer;
let client = new kafka.KafkaClient({kafkaHost: config.kafkaHost});

let payload = [
  { 
    topic: receiveJob, 
    partition: 0
  },
];

var options = {
  groupId: 'pgr-v2-consumer-group',
  fromOffset: 'latest'
};

const consumer = new Consumer(
  client,
  payload,
  options
);

consumer.on("ready", function() {
    console.log("consumer is ready");
});

consumer.on("message", function(message) {
  console.log("record received on consumer for sending template message");
  try {
    pgrStatusUpdate.templateMessgae(JSON.parse(message.value))
      .then(() => {
        console.log("template message send to citizen");
      })
      .catch(error => {
        console.error(error.stack || error);
      });
  } catch (error) {
    console.error("error in sending template message " + error.message);
    console.error(error.stack || error);
  }
});

consumer.on("error", function(err) {
  console.error("error in consumer " + err.message);
  console.error(err.stack || err);
});

consumer.on("offsetOutOfRange", function(err) {
  console.error("offsetOutOfRange");
  console.error(err.stack || err);
});

module.exports = consumer;