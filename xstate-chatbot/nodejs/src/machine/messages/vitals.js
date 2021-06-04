const messages = {
  rrtSrfId: {
    prompt: {
      en_IN: 'Please enter Patient\'s SRF ID ',
      pa_IN: 'ਕਿਰਪਾ ਕਰਕੇ ਮਰੀਜ਼ ਦੀ SRF ID ਦਾਖਲ ਕਰੋ',
      hi_IN: 'कृपया रोगी की SRF ID दर्ज करें'
    },
    error: {
      en_IN: 'Invalid SRF Id. \n\nIf you would like to reset the chat flow, send "Hi".',
      pa_IN: 'ਗਲਤ SRF ਆਈਡੀ. . n \ n  ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ SRF ID ਦਾਖਲ ਕਰੋ ਜਾਂ ਫੇਰ ਗੱਲਬਾਤ ਦੇ ਪ੍ਰਵਾਹ ਨੂੰ ਮੁੜ ਸੈੱਟ ਕਰਨ ਲਈ "Hi" ਟਾਈਪ ਕਰੋ.',
      hi_IN: 'अमान्य SRF ID  \n \nकृपया फिर से SRF ID दर्ज करें या वार्तालाप प्रवाह को रीसेट करने के लिए "Hi" टाइप करें।'
    },
    success: {
      en_IN: 'SRF Id successfully noted. Please continue entering patient\'s vitals.',
      pa_IN: 'ਮਰੀਜ਼ ਦੀ SRF ID ਸਫਲਤਾਪੂਰਵਕ ਨੋਟ ਕੀਤੀ ਗਈ. ਕਿਰਪਾ ਕਰਕੇ ਮਰੀਜ਼ ਦੇ ਲੱਛਣਾਂ ਨੂੰ ਦਾਖਲ ਕਰੋ.',
      hi_IN: 'मरीज की SRF ID सफलतापूर्वक नोट कर ली गई। कृपया रोगी के लक्षण दर्ज करें।'
    },
  },
  rrtMobileNumber: {
    prompt: {
      en_IN: 'Please enter Patient\'s Mobile Number ',
      pa_IN: 'ਕਿਰਪਾ ਕਰਕੇ ਮਰੀਜ਼ ਦੀ ਮੋਬਾਈਲ ਨੰ ਦਾਖਲ ਕਰੋ',
      hi_IN: 'कृपया रोगी की मोबाइल नंबर  दर्ज करें'
    },
    error: {
      en_IN: 'Invalid Mobile Id. \n\nIf you would like to reset the chat flow, send "Hi".',
      pa_IN: 'ਗਲਤ ਮੋਬਾਈਲ ਨੰ . n \ n  ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਮੋਬਾਈਲ ਨੰ ਦਾਖਲ ਕਰੋ ਜਾਂ ਫੇਰ ਗੱਲਬਾਤ ਦੇ ਪ੍ਰਵਾਹ ਨੂੰ ਮੁੜ ਸੈੱਟ ਕਰਨ ਲਈ "Hi" ਟਾਈਪ ਕਰੋ.',
      hi_IN: 'अमान्य मोबाइल नंबर  \n \nकृपया फिर से मोबाइल नंबर दर्ज करें या वार्तालाप प्रवाह को रीसेट करने के लिए "Hi" टाइप करें।'
    },
   },
  notHomeIsolatedPatient: {
    en_IN: 'You are not a home isolated patient. Please register your self.',
    pa_IN: 'ਤੁਸੀਂ ਘਰੇਲੂ ਇਕਾਂਤਵਾਸ ਮਰੀਜ਼ ਨਹੀਂ ਹੋ. ਕਿਰਪਾ ਕਰਕੇ ਪਹਿਲਾਂਰਜਿਸਟਰ ਕਰੋ',
    hi_IN: 'आप घरेलू आइसोलेशन के मरीज नहीं हैं। कृपया पहले रजिस्टर करें',
  },
  registerPatient: {
    personName: {
      prompt: {
        en_IN: 'Please tell me your name',
        pa_IN: 'ਕ੍ਰਿਪਾ ਕਰਕੇ ਆਪਣਾ ਨਾਮ ਦੱਸੋ',
        hi_IN: 'कृपया अपना नाम बताएं'
      },
      error: {
        en_IN: 'I am sorry, I didn\'t understand. Please enter a valid name which is less than 100 characters.',
        pa_IN: 'ਮੈਨੂੰ ਮਾਫ ਕਰਨਾ, ਮੈਨੂੰ ਸਮਝ ਨਹੀਂ ਆਇਆ ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਪ੍ਰਮਾਣਿਕ ​​ਨਾਮ ਦਾਖਲ ਕਰੋ ਜੋ 100 ਅੱਖਰਾਂ ਤੋਂ ਘੱਟ ਹੈ.',
        hi_IN: 'मुझे खेद है, मुझे समझ में नहीं आया। कृपया एक मान्य नाम दर्ज करें जो 100 वर्णों से कम हो।'
      }
    },
    personAge: {
      prompt: {
        en_IN: 'Thanks {{name}}. How old are you?',
        pa_IN: 'ਧੰਨਵਾਦ {{name}}. ਤੁਹਾਡੀ ਉਮਰ ਕੀ ਹੈ?',
        hi_IN: 'धन्यवाद {{name}}। आप कितने साल के हैं?'
      },
      error: {
        en_IN: 'I am sorry, I didn\'t understand. Please enter a valid age (between 0 and 120)',
        pa_IN: 'ਮੈਨੂੰ ਮਾਫ ਕਰਨਾ, ਮੈਨੂੰ ਸਮਝ ਨਹੀਂ ਆਇਆ ਕਿਰਪਾ ਕਰਕੇ ਉਮਰ (0 ਅਤੇ 120 ਦੇ ਵਿਚਕਾਰ) ਦਾਖਲ ਕਰੋ',
        hi_IN: 'मुझे खेद है, मुझे समझ में नहीं आया। कृपया आयु दर्ज करें (0 और 120 के बीच)'
      }
    },
    personGender: {
      prompt: {
        en_IN: 'Please select your gender.',
        pa_IN: 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਲਿੰਗ ਦੀ ਚੋਣ ਕਰੋ.',
        hi_IN: 'कृपया अपना लिंग चुनें।'
      },
      options: {
        list: ['male', 'female', 'other'],
        messageBundle: {
          male: {
            en_IN: 'Male',
            pa_IN: 'ਮਰਦ',
            hi_IN: 'पुरुष '
          },
          female: {
            en_IN: 'Female',
            pa_IN: 'ਔਰਤ',
            hi_IN: 'महिला'
          },
          other: {
            en_IN: 'Other',
            pa_IN: 'ਹੋਰ',
            hi_IN: 'अन्य'
          }
        }
      }
    },
    district: {
      prompt: {
        preamble: {
          en_IN: 'Please select your district',
          pa_IN: 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਜ਼ਿਲ੍ਹਾ ਦੀ ਚੋਣ ਕਰੋ',
          hi_IN: 'कृपया अपने जिले का चयन करें'
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
            '608',
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
        pa_IN: 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਪਤਾ ਦਾਖਲ ਕਰੋ',
        hi_IN: 'कृपया अपना पता दर्ज करें'
      }
    },
    symptomsDate: {
      prompt: {
        en_IN: 'Symptoms start date (DD/MM/YY)',
        pa_IN: 'ਲੱਛਣ ਸ਼ੁਰੂ ਹੋਣ ਦੀ ਮਿਤੀ (DD/MM/YY)',
        hi_IN: 'लक्षण शुरू होने की तारीख (DD/MM/YY)'
      }
    },
    covidPositiveDate: {
      prompt: {
        en_IN: 'Covid Positive date (DD/MM/YY)',
        pa_IN: 'ਕੋਵਿਡ ਸਕਾਰਾਤਮਕ ਤਾਰੀਖ (ਤਾਰੀਖ / ਮਹੀਨਾ / ਸਾਲ)',
        hi_IN: 'कोविड पॉजिटिव तारीख (दिन/माह/वर्ष)'
      }
    },
    registerPatientSrfId: {
      prompt: {
        en_IN: 'Please enter your SRF ID ( Check your Covid test report for SRF ID)',
        pa_IN: 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ  SRF ID ਲਿਖੋ  ( SRF ID ਲਈ ਆਪਣੀ ਕੋਵੀਡ ਟੈਸਟ ਰਿਪੋਰਟ ਵੇਖੋ)',
        hi_IN: 'कृपया अपना एसआरएफ आईडी दर्ज करें (एसआरएफ आईडी के लिए अपनी कोविड परीक्षण रिपोर्ट देखें)'
      },
    },
    registeredPatientSuccess: {
      en_IN: 'Registered successfully',
      pa_IN: 'ਤੁਸੀਂ ਸਫਲਤਾਪੂਰਵਕ ਆਪਣੇ ਆਪ ਨੂੰ ਰਜਿਸਟਰ ਕਰ ਲਿਆ ਹੈ',
      hi_IN: 'आपने अपना पंजीकरण सफलतापूर्वक कर लिया है'
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
        pa_IN: 'ਕੀ ਤੁਹਾਨੰ ਮਧੁਮੇਹ ਹੈ ?',
        hi_IN: 'क्या आपको मधुमेह है?'
      },
    }
  },
  fatehkit: {
    prompt: {
      en_IN: 'Fateh kit delivered ?',
      pa_IN: 'ਫਤਿਹ ਕਿੱਟ ਮਿਲੀ ਹੈ?',
      hi_IN: 'फतेह किट मिला?'
    }
},
heartrelated: {
  prompt: {
    en_IN: 'Any Heart Related Problem ',
    pa_IN: 'ਦਿਲ ਨਾਲ ਸਬੰਧਤ ਕੋਈ ਵੀ ਸਮੱਸਿਆ',
    hi_IN: 'दिल से जुड़ी कोई भी समस्या'
  }
},
kidneyrelated: {
  prompt: {
    en_IN: 'Any Kidney Related Problem  ',
    pa_IN: 'ਕਿਡਨੀ ਨਾਲ ਸੰਬੰਧਤ ਕੋਈ ਵੀ ਸਮੱਸਿਆ',
    hi_IN: 'किडनी से जुड़ी कोई भी समस्या'
  }
},
cancerrelated: {
  prompt: {
    en_IN: 'Cancer ',
    pa_IN: 'ਕੈਨਸਰ ',
    hi_IN: 'कैंसर'
  }
},
  addVitals: {
    en_IN: 'Your vitals have been registered successfully. Our team from health department is monitoring you vitals and in case of need they will contact you . You can register vitals again whenever there is an important change. You may also contact state helpline 104   or the district control room at numbers mentioned below',
    pa_IN: 'ਤੁਹਾਡੇ ਮਹੱਤਵਪੂਰਨ ਲੱਛਣ ਸਫਲਤਾਪੂਰਵਕ ਰਜਿਸਟਰ ਹੋ ਗਏ ਹਨ.. ਸਿਹਤ ਵਿਭਾਗ ਦੀ ਸਾਡੀ ਟੀਮ ਇਹਨਾ ਦੀ ਨਿਗਰਾਨੀ ਕਰ ਰਹੀ ਹੈ ਅਤੇ ਲੋੜ ਪੈਣ \'ਤੇ ਉਹ ਤੁਹਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰਨਗੇ. ਜਦੋਂ ਵੀ ਕੋਈ ਮਹੱਤਵਪੂਰਣ ਤਬਦੀਲੀ ਹੁੰਦੀ ਹੈ ਤਾਂ ਤੁਸੀਂ ਦੁਬਾਰਾ ਲੱਛਣ ਰਜਿਸਟਰ ਕਰ ਸਕਦੇ ਹੋ. ਤੁਸੀਂ ਸਟੇਟ ਹੈਲਪਲਾਈਨ 104 ਜਾਂ  ਹੇਠਾਂ ਦੱਸੇ ਨੰਬਰਾਂ \'ਤੇ ਜ਼ਿਲ੍ਹਾ ਕੰਟਰੋਲ ਰੂਮ ਨਾਲ ਵੀ ਸੰਪਰਕ ਕਰ ਸਕਦੇ ਹੋ',
    hi_IN: 'आपके महत्वपूर्ण लक्षण सफलतापूर्वक दर्ज कर लिए गए हैं।स्वास्थ्य विभाग की हमारी टीम इनकी निगरानी कर रही है और जरूरत पड़ने पर वे आपसे संपर्क करेंगे। जब भी कोई महत्वपूर्ण परिवर्तन होता है तो आप लक्षणों को फिर से पंजीकृत कर सकते हैं। आप राज्य हेल्पलाइन 104 या नीचे दिए गए नंबरों पर जिला नियंत्रण कक्ष से भी संपर्क कर सकते हैं।',
  },
  noUserFound:{
    en_IN: 'No Patient Associated with this number',
    pa_IN: 'ਕੋਈ ਵੀ ਮਰੀਜ਼ ਇਸ ਨੰਬਰ ਨਾਲ ਜੁੜਿਆ ਨਹੀਂ ਹੈ',
    hi_IN: 'इस नंबर से कोई मरीज नहीं जुड़ा है ।',

  },
  selectPerson:{
    en_IN: 'Select the Patient No. ',
    pa_IN: 'ਮਰੀਜ਼ ਨੰਬਰ ਦੀ ਚੋਣ ਕਰੋ',
    hi_IN: 'रोगी संख्या का चयन करें',

  },
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
