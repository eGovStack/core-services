class ConsoleProvider {
    processMessageFromUser(req) {
        return req.body;
    }

    sendMessageToUser(user, outputMessages) {
        if(!Array.isArray(outputMessages)) {
            let message = outputMessages;
            outputMessages = [ message ];
            console.warn('Output array had to be constructed. Remove the use of deeprecated function from the code. \ndialog.sendMessage() function should be used to send any message instead of any previously used methods.');
        }

        // console.log(user);
        for(let message of outputMessages) {
            console.log(message);
        }
    }
}

module.exports = new ConsoleProvider();