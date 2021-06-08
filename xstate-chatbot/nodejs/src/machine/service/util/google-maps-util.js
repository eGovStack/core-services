const fetch = require('node-fetch');
const config = require('../../../env-variables');

// Input latlng is a string containing pair of numbers separated by , and without but surrounding braces
async function getCityAndLocality(latlng) {
  const apiKey = config.googleAPIKey;
  const reverseGeocodeURL = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng}&key=${apiKey}`;

  const response = await fetch(reverseGeocodeURL);
  const responseJson = await response.json();

  if (responseJson.status === 'OK') {
    const city = extractCityFrom(responseJson);
    const locality = extractLocalityFrom(responseJson);
    return {
      city,
      locality,
    };
  }
  return {
    city: null,
    locality: null,
  };
}

function extractCityFrom(response) {
  return searchResponseFor('locality', response);
}

function extractLocalityFrom(response) {
  let locality = searchResponseFor('sublocality_level_2', response);
  if (locality === null) {
    locality = searchResponseFor('sublocality_level_1', response);
  }
  return locality;
}

function searchResponseFor(key, response) {
  const { results } = response;
  for (let i = 0; i < results.length; i++) {
    const { address_components } = results[i];
    for (let j = 0; j < address_components.length; j++) {
      const { types } = address_components[j];
      if (types.includes(key)) {
        return address_components[j].long_name;
      }
    }
  }
  return null;
}

module.exports = getCityAndLocality;
