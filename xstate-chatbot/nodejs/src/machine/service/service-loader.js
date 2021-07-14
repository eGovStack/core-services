const config = require('../../env-variables');

if (config.serviceProvider == 'Dummy') {
  module.exports.personService = require('./dummy-person-service');
  module.exports.vitalsService = require('./dummy-vitals-service');
  module.exports.bedsService = require('./dummy-beds-service');
  module.exports.gisService = require('./dummy-gis-service');
} else {
  module.exports.personService = require('./cova-person-service');
  module.exports.vitalsService = require('./cova-vitals-service');
  module.exports.bedsService = require('./cova-beds-service');
  module.exports.gisService = require('./gis-service');
}
