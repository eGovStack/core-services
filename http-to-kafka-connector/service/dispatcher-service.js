const JSONPath = require('JSONPath'),
    KafkaDispatcher = require('../dispatcher/kafka-dispatcher').KafkaDispatcher,
    config = require('../envVariables')

class DispatcherService {
    constructor(KafkaDispatcher, config) {
        this.config = config;
        this.kafkaDispatcher = new KafkaDispatcher(config);
    }
    dispatch(req, res) {

        const message = {};

        message.method = req.method;
        message.headers = req.headers;    
        message.body = req.body;
        message.queryParams = req.query;
        message.url = req.protocol + '://' + req.get('host') + req.originalUrl;
        message.timestamp = Date.now();
        
        var messageKey = undefined;
        if(config.keyForEachMessage) {
            messageKey = JSONPath({json: message, path : config.keyForEachMessage, callback : () => {}})[0];
        } 

        const data = JSON.stringify(message);

        console.log('Received Request : ' + JSON.stringify(message));

        this.kafkaDispatcher.dispatch(messageKey, data, this.getRequestCallBack(req, res));
    }
    
    health(req, res) {
        this.kafkaDispatcher.health((healthy) => {
            if (healthy)
                this.sendSuccess(res, { id: 'api.health' });
            else
                this.sendError(res, { id: 'api.health', params: { err: 'API is unhealthy' } });
        })
    }

    getRequestCallBack(req, res) {
        return (err, data) => {
            if (err) {
                console.log('error', err);
                this.sendError(res, {  });
            }
            else {
                this.sendSuccess(res, {  });
            }
        }
    }
    sendError(res, options) {
        const resObj = {
            id: options.id || config.serviceId,
            ver: options.ver || config.ver,
            ts: new Date().getTime(),
            params: options.params || {},
            responseCode: options.responseCode || 'SERVER_ERROR'
        }
        res.status(500);
        res.json(resObj);
    }
    sendSuccess(res, options) {
        const resObj = {
            id: options.id || config.serviceId,
            ver: options.ver || config.ver,
            ts: new Date().getTime(),
            params: options.params || {},
            responseCode: options.responseCode || 'SUCCESS'
        }
        res.status(200);
        res.json(resObj);
    }
}

module.exports = new DispatcherService(KafkaDispatcher, config);
