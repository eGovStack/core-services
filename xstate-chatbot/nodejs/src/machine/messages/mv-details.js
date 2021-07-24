const messages = {
  selectLanguagemv: {
    prompt: {
      preamble: {
        en_IN: 'Sat Sri Akal! Welcome to the SBM Chatbot.',
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
  mvMenu: {
    prompt: {
      preamble: {
        en_IN: 'Please select your timeline',
        pa_IN: 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਟਾਈਮਲਾਈਨ ਦੀ ਚੋਣ ਕਰੋ',
        hi_IN: 'कृपया अपनी टाइमलाइन चुनें',
      },
      options: {
        list: ['startOfDayReport', 'intermediateReport', 'endOfDayReport'],
        messageBundle: {
          startOfDayReport: {
            en_IN: 'Start of Day Report',
            pa_IN: 'ਡੇਅ ਰਿਪੋਰਟ ਦੀ ਸ਼ੁਰੂਆਤ',
            hi_IN: 'दिन की शुरुआत रिपोर्ट',
          },
          intermediateReport: {
            en_IN: 'Intermediate Report',
            pa_IN: 'ਇੰਟਰਮੀਡੀਏਟ ਰਿਪੋਰਟ',
            hi_IN: 'इंटरमीडिएट रिपोर्ट',
          },
          endOfDayReport: {
            en_IN: 'End of Day Report',
            pa_IN: 'ਡੇਅ ਦੀ ਰਿਪੋਰਟ ਦੀ ਸਮਾਪਤੀ',
            hi_IN: 'दिन के अंत की रिपोर्ट',
          },
        },
      },
    },
  },

  locationSuccess: {
    prompt: {
      en_IN: 'Thank you! . Your location has been successfully captured',
      pa_IN: 'ਤੁਹਾਡਾ ਧੰਨਵਾਦ! . ਤੁਹਾਡਾ ਟਿਕਾਣਾ ਸਫਲਤਾਪੂਰਵਕ ਹਾਸਲ ਕਰ ਲਿਆ ਗਿਆ ਹੈ',
      hi_IN: 'धन्यवाद! . आपका स्थान सफलतापूर्वक कैप्चर कर लिया गया है',
    },
  },

  imageUpload: {
    prompt: {
      en_IN: 'Please attach a Picture',
      pa_IN: 'ਕਿਰਪਾ ਕਰਕੇ ਇੱਕ ਤਸਵੀਰ ਪੇਸਟ ਕਰੋ',
      hi_IN: 'कृपया एक तस्वीर पेस्ट करें',
    },
  },

  mvMobileNumber: {
    prompt: {
      en_IN: 'Please Enter your Mobile Number for Validation',
      pa_IN: 'ਕਿਰਪਾ ਕਰਕੇ ਪ੍ਰਮਾਣਿਕਤਾ ਲਈ ਆਪਣਾ ਮੋਬਾਈਲ ਨੰਬਰ ਦਰਜ ਕਰੋ',
      hi_IN: 'कृपया सत्यापन के लिए अपना मोबाइल नंबर दर्ज करें',
    },
    error: {
      en_IN: 'Your Entered Mobile Number is Invalid',
      pa_IN: 'ਤੁਹਾਡਾ ਦਰਜ ਕੀਤਾ ਮੋਬਾਈਲ ਨੰਬਰ ਅਵੈਧ ਹੈ',
      hi_IN: 'आपका दर्ज किया गया मोबाइल नंबर अमान्य है',
    },
  },

  mvLocation: {
    prompt: {
      en_IN: 'Please share your present Location ',
      pa_IN: 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਮੌਜੂਦਾ ਸਥਿਤੀ ਨੂੰ ਸਾਂਝਾ ਕਰੋ',
      hi_IN: 'कृपया अपना वर्तमान स्थान साझा करें',
    },
    error: {
      en_IN: 'Invalid Location. \n\nIf you would like to reset the chat flow, send "Hi".',
      pa_IN: 'ਗਲਤ ਸਥਿਤੀ  \ n  ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਸਥਿਤੀ ਦਾਖਲ ਕਰੋ ਜਾਂ ਫੇਰ ਗੱਲਬਾਤ ਦੇ ਪ੍ਰਵਾਹ ਨੂੰ ਮੁੜ ਸੈੱਟ ਕਰਨ ਲਈ "Hi" ਟਾਈਪ ਕਰੋ.',
      hi_IN: 'अमान्य स्थान   \n \nकृपया फिर से स्थान दर्ज करें या वार्तालाप प्रवाह को रीसेट करने के लिए "Hi" टाइप करें।',
    },
  },

  endOfDayReport: {
    prompt: {
      en_IN: '<b>Please fill details for the day</b>',
      pa_IN: 'ਕਿਰਪਾ ਕਰਕੇ ਦਿਨ ਲਈ ਵੇਰਵੇ ਭਰੋ',
      hi_IN: 'कृपया दिन के लिए विवरण भरें',
    },
  },

  noofHouseholds: {
    prompt: {
      en_IN: 'Please Enter No of Households visited',
      pa_IN: 'ਕਿਰਪਾ ਕਰਕੇ ਆਏ ਘਰਾਂ ਦੀ ਗਿਣਤੀ ਦਰਜ ਕਰੋ',
      hi_IN: 'कृपया देखे गए परिवारों की संख्या दर्ज करें',
    },
    error: {
      en_IN: 'Wrong Input Entered',
      pa_IN: 'ਗਲਤ ਇੰਪੁੱਟ ਦਰਜ ਕੀਤੀ',
      hi_IN: 'गलत इनपुट दर्ज किया गया',
    },
  },
  trainingConducted: {
    prompt: {
      en_IN: 'Training Conducted (Yes/No)',
      pa_IN: 'ਸਿਖਲਾਈ ਆਯੋਜਿਤ (ਹਾਂ / ਨਹੀਂ)',
      hi_IN: 'प्रशिक्षण आयोजित (हां/नहीं)',
    },
    error: {
      en_IN: 'Please Enter the Valid Input (Yes/No) ',
      pa_IN: 'ਕਿਰਪਾ ਕਰਕੇ ਵੈਧ ਇਨਪੁਟ ਦਿਓ (ਹਾਂ / ਨਹੀਂ)',
      hi_IN: 'कृपया मान्य इनपुट दर्ज करें (हां/नहीं)',
    }
  },
  noOfParticipantsInTraining: {
    prompt: {
      en_IN: 'Please Total No Of Participants in Training',
      pa_IN: 'ਕ੍ਰਿਪਾ ਕਰਕੇ ਸਿਖਲਾਈ ਵਿਚ ਹਿੱਸਾ ਲੈਣ ਵਾਲਿਆਂ ਦੀ ਕੁੱਲ ਗਿਣਤੀ',
      hi_IN: 'कृपया प्रशिक्षण में प्रतिभागियों की कुल संख्या',
    },
    error: {
      en_IN: 'Please Enter the Valid No of Participants  ',
      pa_IN: 'ਕਿਰਪਾ ਕਰਕੇ ਭਾਗੀਦਾਰਾਂ ਦੀ ਵੈਲਡ ਨੰਬਰ ਦਰਜ ਕਰੋ',
      hi_IN: 'कृपया प्रतिभागियों की मान्य संख्या दर्ज करें',
    }

  },
  visitSchoolOrReligiousInstitution: {
    prompt: {
      en_IN: 'Visit to School / Religious Institution (Yes /No )',
      pa_IN: 'ਸਕੂਲ / ਧਾਰਮਿਕ ਸੰਸਥਾ ਦਾ ਦੌਰਾ (ਹਾਂ / ਨਹੀਂ)',
      hi_IN: 'स्कूल/धार्मिक संस्थान का दौरा (हां/नहीं)',
    },
  },
  visitMRFOrProcessingUnit: {
    prompt: {
      en_IN: 'Visit to MRF/ Processing Unit ( Yes / No )',
      pa_IN: 'ਐਮਆਰਐਫ / ਪ੍ਰੋਸੈਸਿੰਗ ਯੂਨਿਟ (ਹਾਂ / ਨਹੀਂ) ਦਾ ਦੌਰਾ',
      hi_IN: 'एमआरएफ/प्रसंस्करण इकाई का दौरा (हां/नहीं)',
    },
  },
  otherWork: {
    prompt: {
      en_IN: 'Any other work (Specify)',
      pa_IN: 'ਕੋਈ ਹੋਰ ਕੰਮ (ਨਿਰਧਾਰਤ ਕਰੋ)',
      hi_IN: 'कोई अन्य कार्य (निर्दिष्ट करें)',
    },
    error: {
      en_IN: 'please Any other work (Specify)',
      pa_IN: 'ਕ੍ਰਿਪਾ ਕਰਕੇ ਕੋਈ ਹੋਰ ਕੰਮ (ਨਿਰਧਾਰਤ ਕਰੋ)',
      hi_IN: 'कृपया कोई अन्य कार्य (निर्दिष्ट करें)',
    }
  },
  submitmvIntermediateReport: {
    prompt: {
      en_IN: 'Intermediate Report have been submitted successfully.',
      pa_IN: 'ਇੰਟਰਮੀਡੀਏਟ ਵੇਰਵੇ ਸਫਲਤਾਪੂਰਵਕ ਦਰਜ ਕੀਤੇ ਗਏ ਹਨ.',
      hi_IN: 'इंटरमीडिएट विवरण सफलतापूर्वक सबमिट कर दिया गया है।',
    }
  },
  submitmvEndReport: {
    prompt: {
      en_IN: 'End of Day Report have been submitted successfully.',
      pa_IN: 'ਡੇਅ ਦੀ ਅੰਤ ਵੇਰਵੇ ਸਫਲਤਾਪੂਰਵਕ ਦਰਜ ਕੀਤੇ ਗਏ ਹਨ.',
      hi_IN: 'दिन के अंत की विवरण सफलतापूर्वक सबमिट कर दिया गया है।',
    }
  },
  invalidOptionsbm: {
    en_IN: 'Please enter valid input',
    pa_IN: 'ਕਿਰਪਾ ਕਰਕੇ ਵੈਧ ਇੰਪੁੱਟ ਦਾਖਲ ਕਰੋ',
    hi_IN: 'कृपया मान्य इनपुट दर्ज करें',
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
