const sha256 = require('js-sha256');

class UserService {

  async getUserForMobileNumber(mobileNumber) {
    let user = {};
    user.userId = sha256.sha256(mobileNumber);
    user.mobileNumber = mobileNumber;
    // user.name = user.userInfo.name;
    // user.locale = 'en_IN';
    return user;
  }

}

module.exports = new UserService();