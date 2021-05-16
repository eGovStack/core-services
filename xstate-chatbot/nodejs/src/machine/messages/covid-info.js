const messages = {
  covidInfoMenu: {
    prompt: {
      preamble: {
        en_IN: 'What would you like to know?'
      },
      options: {
        list: [ 'selfCare', 'fatehKit', 'bedAvailability', 'vaccinationCenters' ],
        messageBundle: {
          selfCare: {
            en_IN: 'How to do Self Care  in Covid'
          },
          fatehKit: {
            en_IN: 'How to use Fateh Kit'
          },
          bedAvailability: {
            en_IN: 'Where to check covid Beds Availability'
          },
          vaccinationCenters: {
            en_IN: 'Information about Vaccination Centers'
          },
        }
      }
    },
  },
  selfCareInfo: {
    en_IN: 'You can find detailed information regarding Self Care in COVID-19 here https://pmidc.punjab.gov.in/wp-content/uploads/2021/05/home-isolation.pdf. \nPlease follow these simple tips to stay healthy and safe!'
  },
  fatehKitInfo: {
    en_IN: 'You can find information on how to use Fateh Kit here https://youtu.be/cMxBWejWyes'
  },
  bedAvailabilityInfo: {
    en_IN: 'You can find information regarding Beds Availability centers here http://statecovidcontrolroom.punjab.gov.in/'
  },
  vaccinationCentersInfo: {
    en_IN: 'You can find information regarding COVID-19 vaccination centers here https://nhm.punjab.gov.in/'
  }
};

module.exports = messages;