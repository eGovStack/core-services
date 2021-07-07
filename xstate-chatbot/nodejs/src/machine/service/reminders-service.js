const channelProvider = require('../../channel')
const envVariables = require('../../env-variables');
const dialog = require('../util/dialog.js');
const repoProvider = require('../../session/repo');

class RemindersService {
  async triggerReminders() {
    console.log('Sending reminders to people');
    let userIdList = await repoProvider.getUserId(true);
    await this.sendMessages(userIdList);
    console.log('Reminders execution end');
  }

  async sendMessages(userIdList) {
    const extraInfo = {
      whatsAppBusinessNumber: envVariables.whatsAppBusinessNumber,
    };
    for (let userId of userIdList) {
      let chatState = await repoProvider.getActiveStateForUserId(userId);
      if(chatState.context.user.userId == 'eecb3833-6be9-402f-ab9d-ea6484bdc366'){
        if(chatState.value !='start' || chatState.value.sevamenu != 'question'){
          let mobileNumber = await this.getMobileNumberFromUserId(userId);
          if(mobileNumber == null)
            continue;

          let user = { mobileNumber: mobileNumber };
          let message = dialog.get_message(messages.reminder, chatState.context.user.locale);
          channelProvider.sendMessageToUser(user, [message], extraInfo);
        }
      }
    }
  }

  async getMobileNumberFromUserId(userId){
    let url = envVariables.egovServices.egovServicesHost + '/user/_search';

    let requestBody = {
      RequestInfo: null,
      uuid: [userId],
      userType: "CITIZEN"
    };

    let options = {
      method: 'POST',
      origin: '*',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    }

    let response = await fetch(url, options);
    if(response.status == 200){
      let responseBody = await response.json();
      let mobileNumber = responseBody.user[0].mobileNumber;
      return mobileNumber;
    }
     
    return null;
  }
}

let messages = {
  reminder:{
    en_IN: 'You have not selected any option.\n\n👉 To continue, please type and send mseva.',
    hi_IN: 'आपने कोई विकल्प नहीं चुना है।\n\n👉 जारी रखने के लिए, कृपया टाइप करें और mseva भेजें'
  }

}

module.exports = new RemindersService();