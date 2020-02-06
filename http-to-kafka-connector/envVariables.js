const os = require('os');

const envVariables = {
    serviceId : process.env.NAME || 'http-to-kafka',
    ver : process.env.VERSION || '1.0.0',

    kafkaHost: process.env.KAFKA_BROKER_LIST || 'localhost:9092',
    topic: process.env.KAFKA_TOPIC || 'whatsapp-received-messages',
    maxAsyncRequests: 100,
    keyForEachMessage : process.env.KAFKA_KEY_JSONPATH || undefined,      //JsonPath in the formed json object

    contextPath: process.env.SERVER_CONTEXT_PATH || '/whatsapp-webhook',
    port: process.env.SERVER_PORT || 9001,
    endPoint : process.env.ENDPOINT || '/messages',

    httpMethods : process.env.SUPPORTED_HTTP_METHODS || "GET, POST"
}
module.exports = envVariables;
