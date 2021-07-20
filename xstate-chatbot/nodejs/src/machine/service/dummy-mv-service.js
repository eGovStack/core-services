const moment = require('moment');

class MVService {
  async getMVDetailsFromMobileNumber(mobileNumber) {
    return {
      success: 1,
      message: '',
      response:
      {
        user_id: '1',
        mobile_no: '9876543210',
        role: 'MV',
        role_id: '0',
        ulb_id: '701',
        created_date: '2021-07-01 00:00:00',
        last_login: '2021-07-05 14:26:25',
        status: '1'
      }
    };
  }
  async submitEndDayReport(mvreportdetail) {
    return {
      success: 1,
      message: '',
      response: '4'
    }
  }
  async submitMVLocation(mvlocationdetail) {
    return {
      success: 1,
      message: '',
      response: '4'
    }

  }
  async submitMVLocationImage(mvlocationdetail) {
    return {
      success: 1,
      message: '',
      response: '4'
    }
  }
}

module.exports = new MVService();
