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
  
};

module.exports = messages;