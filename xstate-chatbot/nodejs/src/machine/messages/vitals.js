const messages = {
  notHomeIsolatedPatient: {
    en_IN: 'You are not a home isolated patient. Please register with Cova first.',
  },
  temperature: {
    prompt: {
      en_IN: 'Please enter your body temperature',
    },
    error: {
      en_IN: 'Temperature should be between 92 and 108',
    }
  },
  pulse: {
    prompt: {
      en_IN: 'Please enter your pulse rate',
    },
  },
  spo2: {
    prompt: {
      en_IN: 'Please enter your SpO2 level. In case Oximeter is not available send 0.',
    }
  },
  symptoms: {
    lossOfSmellTaste: {
      prompt: {
        en_IN: 'Are you experiencing loss of smell or taste?',
      },
    },
    fluLikeSymptoms: {
      prompt: {
        en_IN: 'Do you have any flu like symptoms?',
      },
    },
    respiratoryIssues: {
      prompt: {
        en_IN: 'Are you having any respiratory issues? (Note time by holding your breath. If it is less than before please report)',
      },
    },
    comorbidities: {
      prompt: {
        en_IN: 'Do you have any comorbidities? (Pre existing medical Conditions like Diabetes, Heart Problem, Hypertension or any other disease)',
      },
    },
  },
  addVitals: {
    en_IN: 'Your vitals have been registered successfully'
  }
};

const grammers = {
  binaryChoice: {
    prompt: {
      en_IN: '\n1. Yes\n2. No',
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