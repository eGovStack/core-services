const fetch = require("node-fetch");
const config = require('../../../env-variables');

async function getQuery(query, variables, operationName = null) {
    
      var options = {
        method: 'POST',
        body: JSON.stringify({
          query,
          variables,
          operationName,
        }),
        headers: {
          'x-hasura-admin-secret': config.hasuraAdminSecret,
        }
      }
  
      let response = await fetch(config.hasuraUrl, options);
      let data = await response.json()
  
      return data.data;
}

module.exports = { getQuery };
