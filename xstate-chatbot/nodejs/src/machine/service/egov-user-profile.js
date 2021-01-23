const config = require('../../env-variables');
const fetch = require('node-fetch');

class UserProfileService {
  async updateUser(user, tenantId) {
    user.userInfo.locale = user.locale;
    if(user.name)
      user.userInfo.name = user.name;

    let requestBody = {
      RequestInfo: {
        authToken: user.authToken
      },
      user: user.userInfo
    };
    let url = config.egovServices.egovServicesHost + config.egovServices.userServiceUpdateProfilePath + '?tenantId=' + tenantId;

    let options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    }

    let response = await fetch(url, options);
    if(response.status === 200) {
      let responseBody = await response.json();
      return responseBody;
    } else {
      console.error('Error Updating the user profile');
      let responseBody = await response.json();
      console.error(JSON.stringify(responseBody));
      return undefined;
    }
  }
}

module.exports = new UserProfileService();