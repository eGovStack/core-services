const express = require('express'),
    router = express.Router(),
    config = require('../envVariables'),
    dispatcherService = require('../service/dispatcher-service');

router.get(config.contextPath + '/health', (req, res) => dispatcherService.health(req, res));

if(config.httpMethods.indexOf("POST") != -1) {
    console.log("POST endpoint open")
    router.post(config.contextPath + config.endPoint, (req, res) => { dispatcherService.dispatch(req, res); });
}
if(config.httpMethods.indexOf('GET') != -1) {
    console.log("GET endpoint open")
    router.get(config.contextPath + config.endPoint, (req, res) => { dispatcherService.dispatch(req, res); });
}

module.exports = router;
