let messages = {
  selectLanguage: {
    prompt: {
      preamble: {
        en_IN: 'Sat Sri Akal ! Welcome to the COVID-19 Chatbot of Punjab Government Mission Fateh (For more information please download COVA app). Mission Fateh has set me up to assist you with your COVID-19 questions and concerns. Please select your preferred language.',
      },
      options: {
        list: [ 'pa_IN', 'hi_IN', 'en_IN' ],
        messageBundle: {
          en_IN: {
            en_IN: 'English',
          },
          hi_IN: {
            en_IN: 'हिंदी',
          },
          pa_IN: {
            en_IN: 'ਪੰਜਾਬੀ',
          },
        },
      },
    },
  },
  menu: {
    prompt: {
      preamble: {
        en_IN: 'What would you like to do?',
        pa_IN: 'ਤੁਸੀ ਕੀ ਕਰਨਾ ਚਾਹੋਗੇ?',
        hi_IN: 'आप क्या करना पसंद करेंगे?',
      },
      options: {
        list: [ 'covidInfo', 'addVitals' ],
        messageBundle: {
          covidInfo: {
            en_IN: 'Get information about Covid',
            pa_IN: 'ਕੋਵਿਡ ਬਾਰੇ ਜਾਣਕਾਰੀ ਪ੍ਰਾਪਤ ਕਰੋ',
            hi_IN: 'कोविड के बारे में पता करें',
          },
          addVitals: {
            en_IN: 'Register your vitals',
            pa_IN: 'ਆਪਣੇ ਲੱਛਣ ਰਜਿਸਟਰ ਕਰੋ',
            hi_IN: 'अपने लक्षण दर्ज करें',
          },
        },
      },
    },
  },
};

module.exports = messages;