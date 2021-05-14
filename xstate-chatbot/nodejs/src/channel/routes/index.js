const express = require('express'),
    router = express.Router(),
    config = require('../../env-variables'),
    sessionManager = require('../../session/session-manager'),
    channelProvider = require('../');
    remindersService = require('../../machine/notifications/reminders-service');

router.post('/message', async (req, res) =>  {
    processHttpRequest(req, res);
});

router.get('/message', async (req, res) =>  {
    processHttpRequest(req, res);
});

router.post('/reminder', async (req, res) =>  {
  remindersService.triggerReminders();
});

async function processHttpRequest(req, res) {
    try {
        let reformattedMessage = await channelProvider.processMessageFromUser(req);
        if(reformattedMessage)
            sessionManager.fromUser(reformattedMessage);
    } catch(e) {
        console.log(e);
    }
    res.end();
}

router.get('/health', (req, res) => res.sendStatus(200));

module.exports = router;
