const messages = {
  notHomeIsolatedPatient: {
    en_IN: 'You are not a home isolated patient. Please register with Cova first.',
    pa_IN: 'ਤੁਸੀਂ ਘਰੇਲੂ ਇਕਾਂਤਵਾਸ ਮਰੀਜ਼ ਨਹੀਂ ਹੋ. ਕਿਰਪਾ ਕਰਕੇ ਪਹਿਲਾਂ ਕੋਵਾ ਐਪ \nਨਾਲ ਰਜਿਸਟਰ ਕਰੋ.'
  },
  temperature: {
    prompt: {
      en_IN: 'Please enter your body temperature',
      pa_IN: 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਸਰੀਰ ਦਾ ਤਾਪਮਾਨ ਟਾਇਪ ਕਰੋ'
    },
    error: {
      en_IN: 'Temperature should be between 92 and 108',
      pa_IN: 'ਤਾਪਮਾਨ 92 ਅਤੇ 108 ਦੇ ਵਿਚਕਾਰ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ'
    }
  },
  pulse: {
    prompt: {
      en_IN: 'Please enter your pulse rate',
      pa_IN: 'ਆਪਣੀ ਨਬਜ਼ ਦੀ ਦਰ ਟਾਇਪ ਕਰੋ'
    },
  },
  spo2: {
    prompt: {
      en_IN: 'Please enter your SpO2 level. In case Oximeter is not available send 0.',
      pa_IN: 'SpO2 ਐਂਟਰ  ਕਰੋ, (ਜੇ ਆਕਸ ਮੀਟਰ ਉਪਲਬਧ ਨਹੀਂ ਹੈ ਤਾਂ 0 ਭੇਜੋ)'
    }
  },
  symptoms: {
    lossOfSmellTaste: {
      prompt: {
        en_IN: 'Are you experiencing loss of smell or taste?',
        pa_IN: 'ਕੀ ਤੁਹਾਨੂੰ ਗੰਦ ਤੇ ਸਵਾਦ ਨਹੀ ਆ ਰਿਹਾ ਹੈ?'
      },
    },
    fluLikeSymptoms: {
      prompt: {
        en_IN: 'Do you have any flu like symptoms?',
        pa_IN: 'ਕੀ ਕੋਈ ਫਲੂ ਵਰਗੇ ਲੱਛਣ ਹਨ?'
      },
    },
    respiratoryIssues: {
      prompt: {
        en_IN: 'Are you having any respiratory issues? (Note time by holding your breath. If it is less than before please report)',
        pa_IN: 'ਕੀ ਤੁਹਾਨੂੰ ਸਾਹ ਸੰਬੰਧੀ ਕੋਈ ਸਮੱਸਿਆ ਹੈ? (ਸਾਹ ਨੂੰ ਰੋਕ ਕੇ ਸਮਾਂ ਨੋਟ ਕਰੋ, ਜੇ ਇਹ ਪਹਿਲਾਂ ਨਾਲੋਂ ਘੱਟ ਹੋਵੇ ਤਾਂ ਰਿਪੋਰਟ ਕਰੋ)'
      },
    },
    comorbidities: {
      prompt: {
        en_IN: 'Do you have any comorbidities? (Pre existing medical Conditions like Diabetes, Heart Problem, Hypertension or any other disease)',
        pa_IN: 'ਕੀ ਤੁਹਾਨੁ ਪਹਿਲਾਂ ਕੋਈ ਬਿਮਾਰੀ ਹੈ ? (ਜਿਵੇਂ ਕਿ ਸ਼ੂਗਰ, ਦਿਲ ਦੀ ਸਮੱਸਿਆ, ਹਾਈਪਰਟੈਨਸ਼ਨ ਜਾਂ ਕੋਈ ਹੋਰ ਬਿਮਾਰੀ)'
      },
    },
  },
  addVitals: {
    en_IN: 'Your vitals have been registered successfully',
    pa_IN: 'ਤੁਹਾਡੇ ਮਹੱਤਵਪੂਰਨ ਲੱਛਣ ਸਫਲਤਾਪੂਰਵਕ ਰਜਿਸਟਰ ਹੋ ਗਏ ਹਨ.'
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