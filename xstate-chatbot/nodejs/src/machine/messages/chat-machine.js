let messages = {
  selectLanguage: {
    prompt: {
      preamble: {
        en_IN: 'Hi there! Welcome to the Punjab Cova! Please select your preferred language.',
      },
      options: {
        list: [ 'en_IN', 'hi_IN', 'pa_IN' ],
        messageBundle: {
          en_IN: {
            en_IN: 'English',
          },
          hi_IN: {
            en_IN: 'हिंदी',
          },
          pa_IN: {
            en_IN: 'ਪੰਜਾਬੀ'
          },
        },
      },
    },
  },
  menu: {
    prompt: {
      preamble: {
        en_IN: 'What would you like to do?',
      },
      options: {
        list: [ 'covidInfo', 'addVitals' ],
        messageBundle: {
          covidInfo: {
            en_IN: 'Get Covid related information',
          },
          addVitals: {
            en_IN: 'Register my vitals',
          },
        },
      },
    },
  },
  covidInfo: {
    en_IN: 'Covid related information'
  }
};

module.exports = messages;