
const { getQuery } = require('../service/util/api');
const { personService } = require('../service/service-loader');
const channelProvider = require('../../channel');
const envVariables = require('../../env-variables');
const { messages } = require('../messages/reminders');
const dialog = require('../util/dialog.js');
const sha256 = require('js-sha256');
const repoProvider = require('../../session/repo');

class RemindersService {

    async triggerReminders(time=null) {
      console.log('Cron job initiated at time: ', time);
      const people = await this.getSubscribedPeople();

      if (!time) {
        time = this.getTime();
      }

      console.log('Sending reminders to people');
      this.sendMessages(people, time);
      console.log('Reminders execution end');
    }

    async getSubscribedPeople() {
      //TODO: Get only unique mobile numbers, using mobile_hash
        const query = `query GetSubscribedPeople($isSubscribed: Boolean) {
            c19_triage(where: {subscribe: {_eq: $isSubscribed}}) {
              person {
                uuid
                first_name
                mobile
              }
            }
          }
          `

        const variables = {
            "isSubscribed": true
          }
        const data = await getQuery(query, variables, null);

        const decrypedPeople = await this.decryptUserData(data.c19_triage);

        const peopleWithUniqueMobileNumbers = this.filterDuplicateMobileNumbers(decrypedPeople);

        return peopleWithUniqueMobileNumbers;
    }

    async decryptUserData(triageData) {
      let people = triageData.map(item => item.person);
      return await personService.decryptPersons(people);
    }

    filterDuplicateMobileNumbers(people) {
      const mobileNumbers = people.map(person => person.mobile)
      const peopleWithUniqueMobileNumbers = people.filter((person, index) => !mobileNumbers.includes(person.mobile, index + 1));
      return peopleWithUniqueMobileNumbers
    }

    sendMessages(people, time) {
        const extraInfo = {
          whatsAppBusinessNumber: envVariables.whatsAppBusinessNumber
        }
        
        people.forEach(async (person) => {
          const mobile = person.mobile;
          const userId = sha256.sha256(mobile)
          const chatState = await repoProvider.getActiveStateForUserId(userId);

          const message = dialog.get_message(messages[time], chatState.context.user.locale);

          person.mobileNumber = person.mobile;
          console.log('Reminder sent');
          channelProvider.sendMessageToUser(person,[message],extraInfo)
        });
        console.log('Message sent to ' + people.length + ' mobile numbers');
    }

    getTime() {
     const hour = new Date().getHours();
     switch(hour) {
       case hour >= 9 || hour <= 11:
         return 'morning';
       case hour >= 14 || hour <= 16:
         return 'afternoon'; 
       case hour >= 20 || hour <= 22:
          return 'evening'; 
       default:
          return 'default';
     }
    }
}

module.exports = new RemindersService();