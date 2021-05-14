let messages = {
  selectLanguage: {
    prompt: {
      preamble: {
        en_IN: 'Hi there! Welcome to the Swasth Alliance COVID-19 Chat! I am  going to be your Swasth Sakhi. Swasth is a not for profit powered by India’s leading healthcare and technology companies as a public interest initiative. (For more information on Swasth click here https://www.swasth.app/home) The good folks at Swasth set me up to assist you with your COVID-19 questions and concerns. Please select your preferred language.',
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