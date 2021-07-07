const sha256 = require('js-sha256');
const channelProvider = require('../../channel')
const envVariables = require('../../env-variables');
const dialog = require('../util/dialog.js');
const repoProvider = require('../../session/repo');

class RemindersService {
  async triggerReminders() {
    const people = await personService.fetchAllHomeIsolatedPatients();

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
      console.log(JSON.stringify(chatState));
      break;
    }
  }
}

module.exports = new RemindersService();
