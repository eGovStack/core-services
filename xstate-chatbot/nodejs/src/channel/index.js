const config = require('../env-variables');

if(config.whatsAppProvider == 'GupShup') {
    console.log('Using GupShup as the channel')
    module.exports = require('./gupshup');
} else if(config.whatsAppProvider == 'ValueFirst') {
    console.log('Using ValueFirst as the channel')
    module.exports = require('./value-first');
} else if(config.whatsAppProvider == 'Kaleyra') {
    console.log('Using Kaleyra as the channel');
    module.exports = require('./kaleyra');
} else {
    console.log('Using console as the output channel');
    module.exports = require('./console');
}
