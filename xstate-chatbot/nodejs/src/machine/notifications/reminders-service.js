
const { getQuery } = require('../service/util/api');
const { personService } = require('../service/service-loader');
const channelProvider = require('../../channel');
const envVariables = require('../../env-variables');
const { messages } = require('../messages/reminders');
const dialog = require('../util/dialog.js');
const sha256 = require('js-sha256');
const repoProvider = require('../../session/repo');
const sessionManager = require('../../session/session-manager');

class RemindersService {
    async triggerReminders() {
      const people = await personService.fetchAllHomeIsolatedPatients();

      console.log('Sending reminders to people');
      this.sendMessages(people);
      console.log('Reminders execution end');
    }

    sendMessages(people) {
        const extraInfo = {
          whatsAppBusinessNumber: envVariables.whatsAppBusinessNumber
        }
        console.log(people, "pppppp");
        people.data.forEach(async (person) => {
          const mobile = person.patient_mobile;
          const userId = sha256.sha256(mobile);
          // const chatState = await repoProvider.getActiveStateForUserId(userId);
          const message = dialog.get_message(messages.reminder, "en_IN");
          console.log('Reminder sent');
          const context = {
            user: {
              userId: userId,
              mobileNumber: mobile,
              locale: 'en_IN'
            },
            chatInterface: sessionManager,
            extraInfo
          }
          dialog.sendMessage(context, message);
          // channelProvider.sendMessageToUser(person,[message],extraInfo)
        });
        console.log('Message sent to ' + people.length + ' mobile numbers');
    }
}

module.exports = new RemindersService();