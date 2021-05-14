const messages = {
  notHomeIsolatedPatient: {
    en_IN: 'You are not a home isolated patient. Please register with Cova first.',
  },
  temperature: {
    prompt: {
      en_IN: 'Please enter your temperature',
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
      en_IN: 'Please enter your SpO2 level',
    }
  },
  symptoms: {
    preamble: {
      en_IN: 'Are you experienceing any of the following symptoms',
    },
    postscript: {
      en_IN: '\n\nPlease enter the numbers corresponding to your symptoms separated by comma(,). If you aren\'t experiencing any of the symptoms, please enter 0.'
    },
    options: {
      list: [ 'lostSmellTaste', 'flu', 'respiratory', 'comorbidities' ],
      messageBundle: {
        lostSmellTaste: {
          en_IN: 'Loss of smell and taste',
        },
        flu: {
          en_IN: 'Flu like symptoms',
        },
        respiratory: {
          en_IN: 'Respiratory symptoms',
        },
        comorbidities: {
          en_IN: 'Comorbidities',
        }
      }
    }
  },
  addVitals: {
    en_IN: 'Your vitals have been registered successfully'
  }
};

module.exports = messages;