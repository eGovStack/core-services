const messages = {
  notHomeIsolatedPatient: {
    en_IN: 'You are not registered. Please register yourself.',
  },
  registerPatient: {
    personName: {
      prompt: {
        en_IN: 'Got it, please tell me your name'
      },
      error: {
        en_IN: 'I am sorry, I didn\'t understand. Please enter a valid name which is less than 100 characters.'
      }
    },
    personAge: {
      prompt: {
        en_IN: 'Thanks {{name}}. How old are you?'
      },
      error: {
        en_IN: 'I am sorry, I didn\'t understand. Please enter a valid age (between 0 and 120)'
      }
    },
    personGender: {
      prompt: {
        en_IN: 'Please select your gender.'
      },
      options: {
        list: ['male', 'female', 'other'],
        messageBundle: {
          male: {
            en_IN: 'Male'
          },
          female: {
            en_IN: 'Female'
          },
          other: {
            en_IN: 'Other'
          }
        }
      }
    },
    district: {
      prompt: {
        preamble: {
          en_IN: 'Please select your district',
        },
        options: {
          list: [
            '27',
            '605',
            '28',
            '29',
            '30',
            '651',
            '31',
            '32',
            '33',
            '34',
            '35',
            '36',
            '37',
            '38',
            '662',
            '41',
            '42',
            '43',
            '609',
            '40',
            '39',
            '609',
          ],
          messageBundle: {
            '27': {
              en_IN: 'Amritsar',
              pa_IN: 'ਅੰਮਿ੍ਤਸਰ',
              hi_IN: 'अमृतसर',
            },
            '605': {
              en_IN: 'Barnala',
              pa_IN: 'ਬਰਨਾਲਾ',
              hi_IN: 'बरनाला',
            },
            '28': {
              en_IN: 'Bathinda',
              pa_IN: 'ਬਠਿੰਡਾ',
              hi_IN: 'बठिंडा',
            },
            '29': {
              en_IN: 'Faridkot',
              pa_IN: 'ਫਰੀਡਕੋਟ',
              hi_IN: 'फरीदकोट',
            },
            '30': {
              en_IN: 'Fatehgarh Sahib',
              pa_IN: 'ਫਤਿਹਗੜ੍ਹ ਸਾਹਿਬ',
              hi_IN: 'फतेहगढ़ साहिब',
            },
            '651': {
              en_IN: 'Fazilka',
              pa_IN: 'ਫਾਜ਼ਿਲਕਾ',
              hi_IN: 'फाजिल्का',
            },
            '31': {
              en_IN: 'Ferozepur',
              pa_IN: 'ਫਿਰੋਜ਼ਪੁਰ',
              hi_IN: 'फिरोजपुर',
            },
            '32': {
              en_IN: 'Gurdaspur',
              pa_IN: 'ਗੁਰਦਾਸਪੁਰ',
              hi_IN: 'गुरदासपुर',
            },
            '33': {
              en_IN: 'Hoshiarpur',
              pa_IN: 'ਹੁਸ਼ਿਆਰਪੁਰ',
              hi_IN: 'होशियारपुर',
            },
            '34': {
              en_IN: 'Jalandhar',
              pa_IN: 'ਜਲੰਧਰ',
              hi_IN: 'जलंधर',
            },
            '35': {
              en_IN: 'Kapurthala',
              pa_IN: 'ਕਪੂਰਥਲਾ',
              hi_IN: 'कपूरथला',
            },
            '36': {
              en_IN: 'Ludhiana',
              pa_IN: 'ਲੁਧਿਆਣਾ',
              hi_IN: 'लुधियाना',
            },
            '37': {
              en_IN: 'Mansa',
              pa_IN: 'ਮਾਨਸਾ',
              hi_IN: 'मानसा',
            },
            '38': {
              en_IN: 'Moga',
              pa_IN: 'ਮੋਗਾ',
              hi_IN: 'मोगा',
            },
            '662': {
              en_IN: 'Pathankot',
              pa_IN: 'ਪਠਾਨਕੋਟ',
              hi_IN: 'पठानकोट',
            },
            '41': {
              en_IN: 'Patiala',
              pa_IN: 'ਪਟਿਆਲਾ',
              hi_IN: 'पटियाला',
            },
            '42': {
              en_IN: 'Rupnagar',
              pa_IN: 'ਰੂਪਨਗਰ',
              hi_IN: 'रूपनगर',
            },
            '43': {
              en_IN: 'Sangrur',
              pa_IN: 'ਸੰਗਰੂਰ',
              hi_IN: 'संगरूर',
            },
            '608': {
              en_IN: 'S.A.S Nagar',
              pa_IN: 'ਐਸ.ਏ.ਐਸ.ਨਗਰ',
              hi_IN: 'एस.ए.एस नगर',
            },
            '40': {
              en_IN: 'Shahid Bhagat Singh Nagar',
              pa_IN: 'ਸ਼ਹੀਦ ਭਗਤ ਸਿੰਘ ਨਗਰ',
              hi_IN: 'शहीद भगत सिंह नगर',
            },
            '39': {
              en_IN: 'Sri Muktsar Sahib',
              pa_IN: 'ਸ਼੍ਰੀ ਮੁਕਤਸਰ ਸਾਹਿਬ',
              hi_IN: 'श्री मुक्तसर साहिब',
            },
            '609': {
              en_IN: 'Tarn Taran',
              pa_IN: 'ਤਰਨ ਤਾਰਨ',
              hi_IN: 'तरनतारन',
            },
          }
        }
      }
    },
    address: {
      prompt: {
        en_IN: 'Please enter your address',
      }
    },
    symptomsDate: {
      prompt: {
        en_IN: 'Symptoms start date (DD/MM/YY)',
      }
    },
    covidPositiveDate: {
      prompt: {
        en_IN: 'Covid Positive date (DD/MM/YY)',
      }
    },
    registeredPatientSuccess: {
      en_IN: 'Registered successfully'
    }
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