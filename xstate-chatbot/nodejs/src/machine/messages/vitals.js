const messages = {
  notHomeIsolatedPatient: {
    en_IN: 'You are not a home isolated patient. Please register with Cova first. https://play.google.com/store/apps/details?id=in.gov.punjab.cova&hl=en_IN&gl=US',
    pa_IN: 'ਤੁਸੀਂ ਘਰੇਲੂ ਇਕਾਂਤਵਾਸ ਮਰੀਜ਼ ਨਹੀਂ ਹੋ. ਕਿਰਪਾ ਕਰਕੇ ਪਹਿਲਾਂ ਕੋਵਾ ਐਪ ਨਾਲ ਰਜਿਸਟਰ ਕਰੋ. https://play.google.com/store/apps/details?id=in.gov.punjab.cova&hl=en_IN&gl=US',
    hi_IN: 'आप घरेलू आइसोलेशन के मरीज नहीं हैं। कृपया पहले कोवा ऐप में रजिस्टर करें। https://play.google.com/store/apps/details?id=in.gov.punjab.cova&hl=en_IN&gl=US',
  },
  temperature: {
    prompt: {
      en_IN: 'Please enter your body temperature',
      pa_IN: 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਸਰੀਰ ਦਾ ਤਾਪਮਾਨ ਟਾਇਪ ਕਰੋ',
      hi_IN: 'कृपया अपने शरीर का तापमान टाइप करें',
    },
    error: {
      en_IN: 'Temperature should be between 92 and 108',
      pa_IN: 'ਤਾਪਮਾਨ 92 ਅਤੇ 108 ਦੇ ਵਿਚਕਾਰ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ',
      hi_IN: 'तापमान 92 और 108. के बीच होना चाहिए',
    }
  },
  pulse: {
    prompt: {
      en_IN: 'Please enter your pulse rate',
      pa_IN: 'ਆਪਣੀ ਨਬਜ਼ ਦੀ ਦਰ ਟਾਇਪ ਕਰੋ',
      hi_IN: 'अपनी पल्स रेट टाइप करें',
    },
  },
  spo2: {
    prompt: {
      en_IN: 'Please enter your SpO2 level. In case Oximeter is not available send 0.',
      pa_IN: 'SpO2 ਐਂਟਰ  ਕਰੋ, (ਜੇ ਆਕਸ ਮੀਟਰ ਉਪਲਬਧ ਨਹੀਂ ਹੈ ਤਾਂ 0 ਭੇਜੋ)',
      hi_IN: 'SpO2 दर्ज करें (यदि ऑक्स मीटर उपलब्ध नहीं है तो 0 भेजें)',
    }
  },
  symptoms: {
    lossOfSmellTaste: {
      prompt: {
        en_IN: 'Are you experiencing loss of smell or taste?',
        pa_IN: 'ਕੀ ਤੁਹਾਨੂੰ ਗੰਦ ਤੇ ਸਵਾਦ ਨਹੀ ਆ ਰਿਹਾ ਹੈ?',
        hi_IN: 'क्या आपको गंदगी का स्वाद नहीं आता?',
      },
    },
    fluLikeSymptoms: {
      prompt: {
        en_IN: 'Do you have any flu like symptoms?',
        pa_IN: 'ਕੀ ਕੋਈ ਫਲੂ ਵਰਗੇ ਲੱਛਣ ਹਨ?',
        hi_IN: 'क्या कोई फ्लू जैसे लक्षण हैं?',
      },
    },
    respiratoryIssues: {
      prompt: {
        en_IN: 'Are you having any respiratory issues? (Note time by holding your breath. If it is less than before please report)',
        pa_IN: 'ਕੀ ਤੁਹਾਨੂੰ ਸਾਹ ਸੰਬੰਧੀ ਕੋਈ ਸਮੱਸਿਆ ਹੈ? (ਸਾਹ ਨੂੰ ਰੋਕ ਕੇ ਸਮਾਂ ਨੋਟ ਕਰੋ, ਜੇ ਇਹ ਪਹਿਲਾਂ ਨਾਲੋਂ ਘੱਟ ਹੋਵੇ ਤਾਂ ਰਿਪੋਰਟ ਕਰੋ)',
        hi_IN: 'क्या आपको सांस की कोई समस्या है? (अपनी सांस रोककर रखें और समय नोट करें, अगर यह पहले से कम है तो इसकी सूचना दें)',
      },
    },
    comorbidities: {
      prompt: {
        en_IN: 'Do you have any comorbidities? (Pre existing medical Conditions like Diabetes, Heart Problem, Hypertension or any other disease)',
        pa_IN: 'ਕੀ ਤੁਹਾਨੁ ਪਹਿਲਾਂ ਕੋਈ ਬਿਮਾਰੀ ਹੈ ? (ਜਿਵੇਂ ਕਿ ਸ਼ੂਗਰ, ਦਿਲ ਦੀ ਸਮੱਸਿਆ, ਹਾਈਪਰਟੈਨਸ਼ਨ ਜਾਂ ਕੋਈ ਹੋਰ ਬਿਮਾਰੀ)',
        hi_IN: 'क्या आपको पहले कोई बीमारी हुई है? (जैसे मधुमेह, हृदय रोग, उच्च रक्तचाप या कोई अन्य बीमारी)',
      },
    },
    diabetes: {
      prompt: {
        en_IN: 'Do you have Diabetes?',
      },
    }
  },
  addVitals: {
    en_IN: 'Your vitals have been registered successfully',
    pa_IN: 'ਤੁਹਾਡੇ ਮਹੱਤਵਪੂਰਨ ਲੱਛਣ ਸਫਲਤਾਪੂਰਵਕ ਰਜਿਸਟਰ ਹੋ ਗਏ ਹਨ.',
    hi_IN: 'आपके लक्षण सफलतापूर्वक दर्ज कर लिए गए हैं।',
  }
};

const grammers = {
  binaryChoice: {
    prompt: {
      en_IN: '\n1. Yes\n2. No',
      pa_IN: '\n1. ਜੀ\n2. ਨਹੀਂ',
      hi_IN: '\n1. हाँ \n2. नहीं',
    },
    grammer: [
      { intention: 'YES', recognize: ['1'] },
      { intention: 'NO', recognize: ['2'] },
    ],
  },
};

module.exports.messages = messages;
module.exports.grammers = grammers;