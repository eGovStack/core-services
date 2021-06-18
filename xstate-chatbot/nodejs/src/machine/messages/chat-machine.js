const messages = {
  selectLanguage: {
    prompt: {
      preamble: {
        en_IN: 'Sat Sri Akal ! Welcome to the COVID-19 Chatbot of Punjab Government Mission Fateh (For more information please download COVA app). Mission Fateh has set me up to assist you with your COVID-19 questions and concerns. Please select your preferred language.',
      },
      options: {
        list: ['pa_IN', 'hi_IN', 'en_IN'],
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
        en_IN: 'You can get information about Bed availability, vaccination centres, Fateh kit and other important information about Self care in Home Isolation. You can also resister yourself as patient under Home isolation and your daily vitals shall be recorded.  Our team from health shall be monitoring your vitals and can contact you on your registered number in case of need. \n\nWhat would you like to do?',
        pa_IN: 'ਇਸ ਚੈਟਬੋਟ ਰਾਹੀਂ ਤੁਸੀਂ ਬੈੱਡਜ਼ ਦੀ ਉਪਲਬਧਤਾ, ਟੀਕਾਕਰਨ ਕੇਂਦਰਾਂ, ਫਤਹਿ ਕਿੱਟ ਅਤੇ ਘਰੇਲੂ ਇਕਾਂਤਵਾਸ ਵਿਚ ਸਵੈ-ਦੇਖਭਾਲ ਬਾਰੇ ਅਤੇ ਹੋਰ ਜ਼ਰੂਰੀ ਜਾਣਕਾਰੀ ਪ੍ਰਾਪਤ ਕਰ ਸਕਦੇ ਹੋ । ਤੁਸੀਂ ਆਪਣੇ ਆਪ ਨੂੰ  ਘਰੇਲੂ ਇਕਾਂਤਵਾਸ ਮਰੀਜ਼ ਵਜੋਂ ਰਜਿਸਟਰ ਵੀ ਕਰ ਸਕਦੇ ਹੋ ਅਤੇ ਤੁਹਾਡੇ COVID-19 ਸੰਬੰਧਿਤ  ਲੱਛਣ  ਵੀ  ਰਿਕਾਰਡ ਕੀਤੇ ਜਾਣਗੇ। ਜ਼ਰੂਰਤ ਪੈਣ \'ਤੇ  ਸਿਹਤ ਵਿਭਾਗ ਦੀ ਟੀਮ ਤੁਹਾਡੇ ਰਜਿਸਟਰਡ ਨੰਬਰ ਤੇ ਤੁਹਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰੇਗੀ।\n\nਤੁਸੀ ਕੀ ਕਰਨਾ ਚਾਹੋਗੇ?',
        hi_IN: 'इस चैटबॉट से आप बिस्तरों की उपलब्धता, टीकाकरण केंद्र, विजय किट और घर में एकांतवास में स्वयं की देखभाल और अन्य महत्वपूर्ण जानकारी प्राप्त कर सकते हैं। आप खुद को घरेलू आइसोलेशन रोगी के रूप में भी पंजीकृत कर सकते हैं और आपके COVID-19 संबंधित लक्षणों को दर्ज किया जाएगा। जरूरत पड़ने पर स्वास्थ्य विभाग की टीम आपके रजिस्टर्ड नंबर पर आपसे संपर्क करेगी।\n\nआप क्या करना पसंद करेंगे?',
      },
      options: {
        list: ['covidInfo', 'addVitals', 'rrt', 'rmo','bedsavailability'],
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
          rrt: {
            en_IN: 'For RRT team members Only',
            pa_IN: 'ਸਿਰਫ  (RRT) ਆਰਆਰਟੀ ਟੀਮ ਦੇ ਮੈਂਬਰਾਂ ਲਈ',
            hi_IN: '​​केवल आरआरटी ​​टीम (RRT) के सदस्यों के लिए',
          },
          rmo: {
            en_IN: 'For RMO members Only',
            pa_IN: 'ਸਿਰਫ  (RMO) ਆਰ.ਐੱਮ.ਓ ਟੀਮ ਦੇ ਮੈਂਬਰਾਂ ਲਈ',
            hi_IN: '​​केवल आरएमओ ​​टीम (RMO) के सदस्यों के लिए',
          },
          bedsavailability: {
            en_IN: 'Beds Availability (L2/L3)',
            pa_IN: 'ਪਲੰਘ ਦੀ ਉਪਲਬਧਤਾ (L2 / L3)',
            hi_IN: 'बिस्तरों की उपलब्धता (L2/L3)',
          },
        },
      },
    },
  },
};

module.exports = messages;
