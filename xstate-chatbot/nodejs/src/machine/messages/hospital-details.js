const messages = {
  nodalOfficer: {
    prompt: {
      en_IN: 'Dear Nodal officer - Hospital ! It is time for bed availability updation!',
      pa_IN: 'ਪਿਆਰੇ ਨੋਡਲ ਅਧਿਕਾਰੀ - ਹਸਪਤਾਲ! ਇਹ ਮੰਜੇ ਦੀ ਉਪਲਬਧਤਾ ਨੂੰ ਅਪਡੇਟ ਕਰਨ ਦਾ ਸਮਾਂ ਹੈ',
      hi_IN: 'प्रिय नोडल अधिकारी - अस्पताल ! बिस्तर की उपलब्धता अद्यतन करने का समय आ गया है',
    },
  },
  L2hospitalDetails: {
    en_IN: 'Hospitals Type is L2 ',
    pa_IN: 'ਹਸਪਤਾਲਾਂ ਦੀ ਕਿਸਮ L2 ਹੈ',
    hi_IN: 'अस्पताल का प्रकार L2 है।',

  },
  l2HospitalUpdate: {
    prompt: {
      en_IN: 'Is Any Updation Required in the Previous data ? ',
      pa_IN: 'ਕੀ ਪਿਛਲੇ ਵੇਰਵਿਆਂ ਵਿੱਚ ਕੋਈ ਅਪਡੇਸ਼ਨ ਲੋੜੀਂਦਾ ਹੈ?',
      hi_IN: 'क्या पिछले विवरण में किसी अद्यतन की आवश्यकता है?',
    },
    error: {
      en_IN: 'Not A Correct Option.Please enter 1 or 2 ',
      pa_IN: 'ਇਹ ਸਹੀ ਵਿਕਲਪ ਨਹੀਂ. ਕਿਰਪਾ ਕਰਕੇ 1 ਜਾਂ 2 ਦਰਜ ਕਰੋ',
      hi_IN: 'सही विकल्प नहीं है। कृपया 1 या 2 दर्ज करें',
    },
    success: {
      en_IN: 'No change',
      pa_IN: 'ਕੋਈ ਤਬਦੀਲੀ ਨਹੀ',
      hi_IN: 'कोई परिवर्तन नहीं होता है।',
    },

  },
  l2UpdateExistingDetails: {
    prompt: {
      en_IN: 'Updated the Previous data as :',
      pa_IN: 'ਪਿਛਲੇ ਵੇਰਵਿਆਂ ਨੂੰ ਇਸ ਤਰਾਂ ਅਪਡੇਟ ਕਰੋ',
      hi_IN: 'पिछले विवरण को इस प्रकार अपडेट करें',
    },

  },
  confirmedCOVIDPatientsOnOxygen: {
    prompt: {
      en_IN: 'Number of confirmed COVID Patients on Oxygen Support ',
      pa_IN: 'ਆਕਸੀਜਨ ਸਹਾਇਤਾ ਤੇ ਪੁਸ਼ਟੀ ਕੀਤੇ COVID ਮਰੀਜ਼ਾਂ ਦੀ ਗਿਣਤੀ',
      hi_IN: 'ऑक्सीजन सपोर्ट पर पुष्टि किए गए COVID रोगियों की संख्या',
    },
    error: {
      en_IN: 'Please enter the correct Number of confirmed COVID Patients on Oxygen Support',
      pa_IN: 'ਕਿਰਪਾ ਕਰਕੇ ਆਕਸੀਜਨ ਸਹਾਇਤਾ ਤੇ ਪੁਸ਼ਟੀ ਕੀਤੇ COVID ਮਰੀਜ਼ਾਂ ਦੀ ਸਹੀ ਗਿਣਤੀ ਦਾਖਲ ਕਰੋ',
      hi_IN: 'कृपया ऑक्सीजन सपोर्ट पर पुष्टि किए गए COVID रोगियों की सही संख्या दर्ज करें',
    },

  },
  confirmedPreviousCOVIDPatientsOnOxygen: {
    prompt: {
      en_IN: 'Previous Recorded Number of confirmed COVID Patients on Oxygen Support ',
      pa_IN: 'ਆਕਸੀਜਨ ਸਹਾਇਤਾ ਤੇ ਪੁਸ਼ਟੀ ਕੀਤੀ COVID ਮਰੀਜ਼ਾਂ ਦੀ ਪਿਛਲੀ ਰਿਕਾਰਡ ਕੀਤੀ ਗਈ  ਗਿਣਤੀ',
      hi_IN: 'पिछला रिकॉर्ड ऑक्सीजन समर्थन पर पुष्टि किए गए COVID रोगियों की संख्या',
    },

  },
  confirmedCOVIDPatientsWithoutOxygen: {
    prompt: {
      en_IN: 'Number of confirmed COVID Patients Without Oxygen Support ',
      pa_IN: 'ਆਕਸੀਜਨ ਸਹਾਇਤਾ ਤੇ ਪੁਸ਼ਟੀ ਕੀਤੇ COVID ਮਰੀਜ਼ਾਂ ਦੀ ਗਿਣਤੀ',
      hi_IN: 'ऑक्सीजन सपोर्ट पर पुष्टि किए गए COVID रोगियों की संख्या',
    },
    error: {
      en_IN: 'Please enter the correct Number of confirmed COVID Patients Without Oxygen Support',
      pa_IN: 'ਕਿਰਪਾ ਕਰਕੇ ਆਕਸੀਜਨ ਸਹਾਇਤਾ ਤੋਂ ਬਿਨਾਂ ਪੁਸ਼ਟੀ ਕੀਤੇ COVID ਮਰੀਜ਼ਾਂ ਦੀ ਸਹੀ ਗਿਣਤੀ ਦਾਖਲ ਕਰੋ',
      hi_IN: 'कृपया बिना ऑक्सीजन सहायता के पुष्टि किए गए COVID रोगियों की सही संख्या दर्ज करें',
    },

  },
  confirmedPreviousCOVIDPatientsWithoutOxygen: {
    prompt: {
      en_IN: 'Previous Recorded Number of confirmed COVID Patients Without Oxygen Support ',
      pa_IN: 'ਆਕਸੀਜਨ ਸਹਾਇਤਾ ਤੇ ਪੁਸ਼ਟੀ ਕੀਤੇ COVID ਮਰੀਜ਼ਾਂ ਦੀ ਪਿਛਲੀ ਰਿਕਾਰਡ ਕੀਤੀ ਗਈ  ਗਿਣਤੀ',
      hi_IN: 'ऑक्सीजन सपोर्ट पर पुष्टि किए गए COVID रोगियों की संख्या',
    },

  },
  l2SuspectedCOVIDPatientsOnOxygen: {
    prompt: {
      en_IN: 'Number of Suspected COVID Patients on Oxygen Support ',
      pa_IN: 'ਆਕਸੀਜਨ ਸਹਾਇਤਾ ਤੇ ਪੁਸ਼ਟੀ ਕੀਤੇ COVID ਮਰੀਜ਼ਾਂ ਦੀ ਗਿਣਤੀ',
      hi_IN: 'ऑक्सीजन सपोर्ट पर पुष्टि किए गए COVID रोगियों की संख्या',
    },
    error: {
      en_IN: 'Please enter the Correct Number of Suspected COVID Patients on Oxygen Support',
      pa_IN: 'ਕਿਰਪਾ ਕਰਕੇ ਆਕਸੀਜਨ ਸਹਾਇਤਾ ਤੇ ਸ਼ੱਕੀ COVID ਮਰੀਜ਼ਾਂ ਦੀ ਸਹੀ ਗਿਣਤੀ ਦਾਖਲ ਕਰੋ',
      hi_IN: 'कृपया ऑक्सीजन सपोर्ट पर संदिग्ध COVID रोगियों की सही संख्या दर्ज करें',
    },

  },
  l2PreviousSuspectedCOVIDPatientsOnOxygen: {
    prompt: {
      en_IN: 'Previous Recorded Number of Suspected COVID Patients on Oxygen Support ',
      pa_IN: 'ਆਕਸੀਜਨ ਸਹਾਇਤਾ ਤੇ ਸ਼ੱਕੀ COVID ਮਰੀਜ਼ਾਂ ਦੀ ਪਿਛਲੀ ਰਿਕਾਰਡ ਕੀਤੀ ਗਿਣਤੀ',
      hi_IN: 'पिछला रिकॉर्ड ऑक्सीजन समर्थन पर संदिग्ध COVID रोगियों की संख्या',
    },

  },
  l2SuspectedCOVIDPatientsWithoutOxygen: {
    prompt: {
      en_IN: ' Number of Suspected COVID Patients Without Oxygen Support ',
      pa_IN: 'ਆਕਸੀਜਨ ਸਹਾਇਤਾ ਤੋਂ ਬਿਨਾਂ ਸ਼ੱਕੀ COVID ਮਰੀਜ਼ਾਂ ਦੀ ਗਿਣਤੀ',
      hi_IN: 'बिना ऑक्सीजन सपोर्ट के संदिग्ध कोविड मरीजों की संख्या',
    },
    error: {
      en_IN: 'Please enter the Correct Number of Suspected COVID Patients on Oxygen Support',
      pa_IN: 'ਕਿਰਪਾ ਕਰਕੇ ਆਕਸੀਜਨ ਸਹਾਇਤਾ ਤੇ ਸ਼ੱਕੀ COVID ਮਰੀਜ਼ਾਂ ਦੀ ਸਹੀ ਗਿਣਤੀ ਦਾਖਲ ਕਰੋ',
      hi_IN: 'कृपया ऑक्सीजन सपोर्ट पर संदिग्ध COVID रोगियों की सही संख्या दर्ज करें',
    },

  },
  l2PreviousSuspectedCOVIDPatientsWithoutOxygen: {
    prompt: {
      en_IN: 'Previous Recorded Number of Suspected COVID Patients Without Oxygen Support ',
      pa_IN: 'ਆਕਸੀਜਨ ਸਮਰਥਨ ਦੇ ਬਗੈਰ ਪਿਛਲੇ ਰਿਕਾਰਡ ਕੀਤੇ ਸੰਕਟਿਤ ਮਰੀਜ਼ਾਂ ਦੀ ਗਿਣਤੀ',
      hi_IN: 'पिछला रिकॉर्ड किए गए संदिग्ध COVID रोगियों की संख्या बिना ऑक्सीजन सहायता ',
    },

  },
  l2TotaldischargedCOVIDPatients: {
    prompt: {
      en_IN: 'Total discharged COVID patients till date ',
      pa_IN: 'ਅੱਜ ਤੱਕ ਕੁੱਲ ਡਿਸਚਾਰਜ COVID ਦੇ ਮਰੀਜ਼',
      hi_IN: 'अब तक कुल डिस्चार्ज किए गए COVID मरीज',
    },
    error: {
      en_IN: 'Please enter the Correct Number of discharged COVID patients till date',
      pa_IN: 'ਕਿਰਪਾ ਕਰਕੇ ਅੱਜ ਤੱਕ ਡਿਸਚਾਰਜ COVID ਮਰੀਜ਼ਾਂ ਦੀ ਸਹੀ ਗਿਣਤੀ ਦਾਖਲ ਕਰੋ',
      hi_IN: 'कृपया अब तक डिस्चार्ज किए गए COVID रोगियों की सही संख्या दर्ज करें',
    },

  },
  l2PreviousTotaldischargedCOVIDPatients: {
    prompt: {
      en_IN: 'Previous Recorded the Total discharged COVID patients till date ',
      pa_IN: 'ਪਿਛਲਾ ਅੱਜ ਤੱਕ ਡਿਸਚਾਰਜ COVID ਮਰੀਜ਼ਾਂ ਨੂੰ ਰਿਕਾਰਡ ਕੀਤਾ ਗਿਆ',
      hi_IN: 'पिछला अब तक कुल डिस्चार्ज किए गए COVID रोगियों को रिकॉर्ड किया गया है',
    },

  },
  l2TotalCOVIDdeaths: {
    prompt: {
      en_IN: ' Total COVID deaths till date ',
      pa_IN: 'ਅੱਜ ਤੱਕ ਕੁੱਲ COVID ਮੌਤ',
      hi_IN: 'अब तक कुल COVID मौतें',
    },
    error: {
      en_IN: 'Please enter the Correct Number of COVID death till date',
      pa_IN: 'ਕਿਰਪਾ ਕਰਕੇ ਅੱਜ ਤਕ ਕੋਵਾਈਡ ਦੀ ਮੌਤ ਦੀ ਸਹੀ ਗਿਣਤੀ ਦਾਖਲ ਕਰੋ',
      hi_IN: 'कृपया अब तक COVID से होने वाली मौतों की सही संख्या दर्ज करें',
    },

  },
  l2PreviousTotalCOVIDdeaths: {
    prompt: {
      en_IN: 'Previous Recorded the Total COVID deaths till date ',
      pa_IN: 'ਪਿਛਲੇ ਅੱਜ ਤੱਕ ਕੁੱਲ COVID ਮੌਤਾਂ ਨੂੰ ਰਿਕਾਰਡ ਕੀਤਾ ਗਿਆ',
      hi_IN: 'पिछला अब तक कुल COVID मौतों को रिकॉर्ड किया गया है',
    },

  },
  l2availableL2OxygenBeds: {
    prompt: {
      en_IN: 'Available  L2 Oxygen beds :  ',
      pa_IN: 'ਉਪਲਬਧ ਐਲ 2 ਆਕਸੀਜਨ ਬਿਸਤਰੇ',
      hi_IN: 'उपलब्ध एल२ ऑक्सीजन बेड',
    },
    error: {
      en_IN: 'Please Enter Available  L2 Oxygen beds',
      pa_IN: 'ਕਿਰਪਾ ਕਰਕੇ ਉਪਲਬਧ ਐਲ 2 ਆਕਸੀਜਨ ਬਿਸਤਰੇ ਦਾਖਲ ਕਰੋ',
      hi_IN: 'कृपया उपलब्ध L2 ऑक्सीजन बेड दर्ज करें',
    },
  },
  l2previousAvailableL2OxygenBeds: {
    prompt: {
      en_IN: 'Available L2 Oxygen Beds :  ',
      pa_IN: 'ਉਪਲਬਧ ਐਲ 2 ਆਕਸੀਜਨ ਬਿਸਤਰੇ',
      hi_IN: 'उपलब्ध एल२ ऑक्सीजन बेड',
    },

  },
  total: {
    prompt: {
      en_IN: 'Total ',
      pa_IN: 'ਕੁੱਲ',
      hi_IN: 'संपूर्ण',
    },
  },
  l2SubmitDetails: {
    en_IN: 'Your Details have been submitted successfully ',
    pa_IN: 'ਤੁਹਾਡੇ ਵੇਰਵੇ ਸਫਲਤਾਪੂਰਵਕ ਦਰਜ ਕੀਤੇ ਗਏ ਹਨ',
    hi_IN: 'आपका विवरण सफलतापूर्वक सबमिट कर दिया गया है',
  },
  L3hospitalDetails: {
    en_IN: 'Hospitals Type is L3 ',
    pa_IN: 'ਹਸਪਤਾਲਾਂ ਦੀ ਕਿਸਮ L3 ਹੈ.',
    hi_IN: 'अस्पताल का प्रकार L3 है',

  },
  L2L3hospitalDetails: {
    en_IN: 'Hospitals Type is L2 L3 ',
    pa_IN: 'ਹਸਪਤਾਲਾਂ ਦੀ ਕਿਸਮ L2 L3 ਹੈ.',
    hi_IN: 'अस्पताल का प्रकार L2 L3 है',

  },
  l3BedswithoutVentilators: {
    prompt: {
      en_IN: 'Number of available  L3 Beds without ventilators :  ',
      pa_IN: 'ਵੈਂਟੀਲੇਟਰਾਂ ਤੋਂ ਬਿਨਾਂ ਉਪਲੱਬਧ ਐਲ 3 ਬੈੱਡਾਂ ਦੀ ਗਿਣਤੀ',
      hi_IN: 'बिना वेंटिलेटर के उपलब्ध L3 बिस्तरों की संख्या',
    },
    error: {
      en_IN: 'please Enter correct Number of available  L3 Beds without ventilators',
      pa_IN: 'ਕਿਰਪਾ ਕਰਕੇ ਬਿਨਾਂ ਵੈਂਟੀਲੇਟਰਾਂ ਦੇ ਉਪਲੱਬਧ L3 ਬੈੱਡਾਂ ਦੀ ਸਹੀ ਗਿਣਤੀ ਦਰਜ ਕਰੋ',
      hi_IN: 'कृपया बिना वेंटिलेटर के उपलब्ध L3 बिस्तरों की सही संख्या दर्ज करें',
    },
  },
  l3PreviousBedswithoutVentilators: {
    prompt: {
      en_IN: 'Previous Recorded Number of available  L3 Beds without ventilators   ',
      pa_IN: 'ਪਿਛਲੀ ਰਿਕਾਰਡ ਕੀਤੀ ਉਪਲਬਧ ਵੈਨਟੀਲੇਟਰਾਂ ਤੋਂ ਬਿਨਾਂ ਉਪਲੱਬਧ L3 ਬੈੱਡਾਂ ਦੀ ਗਿਣਤੀ',
      hi_IN: 'बिना वेंटिलेटर के उपलब्ध L3 बिस्तरों की पिछली रिकॉर्ड संख्या',
    },

  },
  l3BedswithVentilators: {
    prompt: {
      en_IN: 'Number of available  L3 Beds with ventilators  ',
      pa_IN: 'ਵੈਂਟੀਲੇਟਰਾਂ ਵਾਲੇ ਉਪਲਬਧ L3 ਬੈੱਡਾਂ ਦੀ ਗਿਣਤੀ',
      hi_IN: 'वेंटिलेटर के साथ उपलब्ध L3 बिस्तरों की संख्या',
    },
    error: {
      en_IN: 'please Enter the Number of available  L3 Beds with ventilators',
      pa_IN: 'ਕਿਰਪਾ ਕਰਕੇ ਵੈਂਟੀਲੇਟਰਾਂ ਵਾਲੇ ਉਪਲਬਧ L3 ਬੈੱਡਾਂ ਦੀ ਗਿਣਤੀ ਦਰਜ ਕਰੋ.',
      hi_IN: 'कृपया वेंटिलेटर के साथ उपलब्ध L3 बिस्तरों की संख्या दर्ज करें',
    },
  },
  l3PreviousBedswithVentilators: {
    prompt: {
      en_IN: 'Previous Recorded Number of available  L3 Beds with ventilators :  ',
      pa_IN: 'ਪਿਛਲਾ ਰਿਕਾਰਡ ਕੀਤਾ ਵੈਨਟੀਲੇਟਰਾਂ ਵਾਲੇ ਉਪਲਬਧ L3 ਬੈੱਡਾਂ ਦੀ ਗਿਣਤੀ',
      hi_IN: 'पिछले वेंटिलेटर के साथ उपलब्ध L3 बिस्तरों की रिकॉर्ड संख्या',
    },

  },
  l3PatientsintubatedwithoutVentilator: {
    prompt: {
      en_IN: 'Number of COVID Patients intubated ( invasive ventilator) :  ',
      pa_IN: 'COVID ਦੇ ਰੋਗੀਆਂ ਦੀ ਗਿਣਤੀ (ਹਮਲਾਵਰ ਵੈਂਟੀਲੇਟਰ)',
      hi_IN: 'COVID रोगियों की संख्या इंटुबैटेड (इनवेसिव वेंटिलेटर)',
    },
    error: {
      en_IN: 'please Enter the Number of available  L3 Beds with ventilators',
      pa_IN: 'ਕਿਰਪਾ ਕਰਕੇ ਵੈਂਟੀਲੇਟਰਾਂ ਵਾਲੇ ਉਪਲਬਧ L3 ਬੈੱਡਾਂ ਦੀ ਗਿਣਤੀ ਦਰਜ ਕਰੋ',
      hi_IN: 'कृपया वेंटिलेटर के साथ उपलब्ध एल3 बिस्तरों की संख्या दर्ज करें',
    },
  },
  l3PreviousPatientsintubatedwithoutVentilator: {
    prompt: {
      en_IN: 'Previous Recorded Number of COVID Patients intubated ( invasive ventilator)',
      pa_IN: 'पिछले रिकॉर्ड किए गए COVID रोगियों की संख्या इंटुबैटेड (इनवेसिव वेंटिलेटर)',
      hi_IN: 'ਪਿਛਲੇ COVID ਮਰੀਜ਼ਾਂ ਦੀ ਰਿਕਾਰਡ ਗਿਣਤੀ',
    },

  },
  l3DischargedPatientswithoutVentilator: {
    prompt: {
      en_IN: ' Number of Total discharged COVID patients till date ',
      pa_IN: 'ਅੱਜ ਤਕ ਕੁੱਲ ਛੁੱਟੀ ਵਾਲੇ COVID ਮਰੀਜ਼ਾਂ ਦੀ ਗਿਣਤੀ',
      hi_IN: 'अब तक कुल डिस्चार्ज किए गए COVID रोगियों की संख्या',
    },
    error: {
      en_IN: 'please Enter the Number of available  L3 Beds with ventilators',
      pa_IN: 'ਕਿਰਪਾ ਕਰਕੇ ਵੈਂਟੀਲੇਟਰਾਂ ਵਾਲੇ ਉਪਲਬਧ L3 ਬੈੱਡਾਂ ਦੀ ਗਿਣਤੀ ਦਰਜ ਕਰੋ.',
      hi_IN: 'कृपया वेंटिलेटर के साथ उपलब्ध L3 बिस्तरों की संख्या दर्ज करें',
    },
  },
  l3PreviousDischargedPatientswithoutVentilator: {
    prompt: {
      en_IN: 'Previous Recorded Total discharged COVID patients till date (withoutVentilator) :  ',
      pa_IN: 'ਪਿਛਲਾ ਰਿਕਾਰਡ ਕੀਤਾ ਕੁੱਲ ਛੁੱਟੀ ਵਾਲੇ COVID ਮਰੀਜ਼ ਅੱਜ ਤੱਕ (ਬਿਨਾ ਵੈਂਟੀਲੇਟਰ)',
      hi_IN: 'पिछला रिकॉर्ड किया गया कुल डिस्चार्ज किए गए COVID रोगी अब तक (बिना वेंटिलेटर के)',
    },
  },
  l3TotalDeathswithoutVentilator: {
    prompt: {
      en_IN: ' Total COVID deaths till date (withoutVentilator) :  ',
      pa_IN: 'ਅੱਜ ਤੱਕ ਕੁੱਲ COVID ਮੌਤ (ਬਿਨਾ ਵੈਂਟੀਲੇਟਰ):',
      hi_IN: 'अब तक की कुल COVID ​​​​मौतें (बिना वेंटिलेटर के):',
    },
    error: {
      en_IN: 'please Enter the Number of available  L3 Beds without ventilators',
      pa_IN: 'ਕਿਰਪਾ ਕਰਕੇ ਬਿਨਾਂ ਵੈਂਟੀਲੇਟਰਾਂ ਦੇ ਉਪਲੱਬਧ L3 ਬੈੱਡਾਂ ਦੀ ਗਿਣਤੀ ਦਰਜ ਕਰੋ',
      hi_IN: 'कृपया बिना वेंटिलेटर के उपलब्ध एल3 बिस्तरों की संख्या दर्ज करें',
    },
  },
  l3PreviousTotalDeathswithoutVentilator: {
    prompt: {
      en_IN: 'Previous Recorded Total COVID deaths till date (without ventilators) :  ',
      pa_IN: 'ਪਿਛਲਾ ਰਿਕਾਰਡ ਕੀਤਾ ਕੁਲ COVID ਮੌਤ ਅੱਜ ਤੱਕ (ਬਿਨਾਂ ਵੈਂਟੀਲੇਟਰਾਂ ਦੇ)',
      hi_IN: 'पिछला रिकॉर्ड की गई कुल COVID मौतें अब तक (बिना वेंटिलेटर के)',
    },
  },
  l3PatientsICUwithVentilator: {
    prompt: {
      en_IN: ' Number of COVID patients on ICU/NIV/CPAP/BPAP/HFNO (With ventilators) :  ',
      pa_IN: 'ਆਈਸੀਯੂ / ਐਨਆਈਵੀ / ਸੀਪੀਏਪੀ / ਬੀਪੀਏਪੀ / ਐਚਐਫਐਨਓ (ਵੈਂਟੀਲੇਟਰਾਂ ਦੇ ਨਾਲ) ਤੇ ਕੋਵੀਡ ਮਰੀਜ਼ਾਂ ਦੀ ਗਿਣਤੀ',
      hi_IN: 'आईसीयू/एनआईवी/सीपीएपी/बीपीएपी/एचएफएनओ (वेंटिलेटर के साथ) पर कोविड रोगियों की संख्या',
    },
    error: {
      en_IN: 'please Enter the Number of available  L3 Beds with ventilators',
      pa_IN: 'ਕਿਰਪਾ ਕਰਕੇ ਵੈਂਟੀਲੇਟਰਾਂ ਵਾਲੇ ਉਪਲਬਧ L3 ਬੈੱਡਾਂ ਦੀ ਗਿਣਤੀ ਦਰਜ ਕਰੋ',
      hi_IN: 'कृपया वेंटिलेटर के साथ उपलब्ध L3 बिस्तरों की संख्या दर्ज करें',
    },
  },
  l3PreviousPatientsICUwithVentilator: {
    prompt: {
      en_IN: 'Previous Recorded Number of COVID patients on ICU/NIV/CPAP/BPAP/HFNO (With ventilators):  ',
      pa_IN: 'ਪਿਛਲੇ ਆਈਸੀਯੂ / ਐਨਆਈਵੀ / ਸੀਪੀਏਪੀ / ਬੀਪੀਏਪੀ / ਐਚਐਫਐਨਓ (ਵੈਂਟੀਲੇਟਰਾਂ ਦੇ ਨਾਲ) ਤੇ ਕੋਵੀਡ ਮਰੀਜ਼ਾਂ ਦੀ ਰਿਕਾਰਡ ਕੀਤੀ ਗਈ ਗਿਣਤੀ',
      hi_IN: 'आईसीयू/एनआईवी/सीपीएपी/बीपीएपी/एचएफएनओ (वेंटिलेटर के साथ) पर पिछले रिकॉर्ड किए गए कोविड रोगियों की संख्या',
    },
  },
  l3DischargedPatientswithVentilator: {
    prompt: {
      en_IN: ' Total discharged COVID patients till date (With ventilators):  ',
      pa_IN: 'ਅੱਜ ਤੱਕ ਕੁੱਲ ਛੁੱਟੀ ਵਾਲੇ ਕੋਵਿਡ ਮਰੀਜ਼ (ਵੈਂਟੀਲੇਟਰਾਂ ਨਾਲ)',
      hi_IN: 'अब तक कुल डिस्चार्ज किए गए COVID मरीज (वेंटिलेटर के साथ)',
    },
    error: {
      en_IN: 'please Enter the Number of available  L3 Beds with ventilators',
      pa_IN: 'ਕਿਰਪਾ ਕਰਕੇ ਵੈਂਟੀਲੇਟਰਾਂ ਵਾਲੇ ਉਪਲਬਧ L3 ਬੈੱਡਾਂ ਦੀ ਗਿਣਤੀ ਦਰਜ ਕਰੋ.',
      hi_IN: 'कृपया वेंटिलेटर के साथ उपलब्ध एल3 बिस्तरों की संख्या दर्ज करें',
    },
  },
  l3PreviousDischargedPatientswithVentilator: {
    prompt: {
      en_IN: 'Previous Recorded Total discharged COVID patients till date (With ventilators):  ',
      pa_IN: 'ਪਿਛਲਾ ਰਿਕਾਰਡ ਕੀਤਾ ਗਿਆ ਕੁਲ ਛੁੱਟੀ ਵਾਲੇ COVID ਮਰੀਜ਼ ਅੱਜ ਤੱਕ (ਵੈਂਟੀਲੇਟਰਾਂ ਨਾਲ)',
      hi_IN: 'पिछला रिकॉर्ड किया गया कुल डिस्चार्ज किए गए COVID रोगी अब तक (वेंटिलेटर के साथ)',
    },
  },
  l3DeathswithVentilator: {
    prompt: {
      en_IN: 'Total COVID deaths till date (With Ventilator)  :  ',
      pa_IN: 'ਅੱਜ ਤੱਕ ਕੁੱਲ COVID ਮੌਤ (ਵੈਂਟੀਲੇਟਰ ਦੇ ਨਾਲ)',
      hi_IN: 'अब तक की कुल COVID मौतें (वेंटिलेटर के साथ)',
    },
    error: {
      en_IN: 'please Enter the Number of available  L3 Beds with ventilators',
      pa_IN: 'ਕਿਰਪਾ ਕਰਕੇ ਵੈਂਟੀਲੇਟਰਾਂ ਵਾਲੇ ਉਪਲਬਧ L3 ਬੈੱਡਾਂ ਦੀ ਗਿਣਤੀ ਦਰਜ ਕਰੋ.',
      hi_IN: 'कृपया वेंटिलेटर के साथ उपलब्ध L3 बिस्तरों की संख्या दर्ज करें',
    },
  },
  l3PreviousDeathswithVentilator: {
    prompt: {
      en_IN: 'Previous Recorded Total COVID deaths till date (With Ventilator)  :  ',
      pa_IN: 'ਪਿਛਲਾ ਅੱਜ ਤੱਕ ਦਰਜ ਕੁੱਲ COVID ਮੌਤ (ਵੈਂਟੀਲੇਟਰ ਦੇ ਨਾਲ)',
      hi_IN: 'पिछला रिकॉर्ड की गई कुल COVID मौतें अब तक (वेंटिलेटर के साथ)',
    },
  },
  noUserFetch: {
    prompt: {
      en_IN: 'No Nodal Officer Associated with this number and kindly retry',
      pa_IN: 'ਕੋਈ ਨੋਡਲ ਅਧਿਕਾਰੀ ਇਸ ਨੰਬਰ ਨਾਲ ਸੰਬੰਧਿਤ ਨਹੀਂ ਹੈ ਅਤੇ ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ',
      hi_IN: 'इस नंबर से कोई नोडल अधिकारी संबद्ध नहीं है और कृपया पुनः प्रयास करें',
    },

  },
  comparedAvailableOxygenBeds: {
    prompt: {
      en_IN: 'Available L2 Oxygen beds should not exceed from Total L2 Oxygen beds',
      pa_IN: 'ਉਪਲੱਬਧ L2 ਆਕਸੀਜਨ ਬਿਸਤਰੇ ਕੁਲ L2 ਆਕਸੀਜਨ ਬਿਸਤਰੇ ਤੋਂ ਵੱਧ ਨਹੀਂ ਹੋਣੇ ਚਾਹੀਦੇ',
      hi_IN: 'उपलब्ध L2 ऑक्सीजन बेड कुल L2 ऑक्सीजन बेड से अधिक नहीं होने चाहिए',
    },
  },
  comparedAvailableBedsWithOutVent: {
    prompt: {
      en_IN: 'Available L3 Beds without ventilators should not exceed from Total L3 Beds without ventilators',
      pa_IN: 'ਵੈਂਟੀਲੇਟਰਾਂ ਤੋਂ ਬਿਨਾਂ ਉਪਲੱਬਧ ਐਲ 3 ਬੈੱਡ ਵੈਂਟੀਲੇਟਰਾਂ ਤੋਂ ਬਿਨਾਂ ਕੁੱਲ ਐਲ 3 ਬੈੱਡਾਂ ਤੋਂ ਵੱਧ ਨਹੀਂ ਹੋਣੇ ਚਾਹੀਦੇ',
      hi_IN: 'बिना वेंटिलेटर के उपलब्ध L3 बेड बिना वेंटिलेटर के कुल L3 बेड से अधिक नहीं होने चाहिए',
    },
  },
  comparedAvailableBedsWithVent: {
    prompt: {
      en_IN: 'Available L3 Beds with ventilators should not exceed from Total L3 Beds with ventilators',
      pa_IN: 'ਵੈਂਟੀਲੇਟਰਾਂ ਵਾਲੇ ਉਪਲਬਧ ਐਲ 3 ਬੈੱਡ ਵੈਂਟੀਲੇਟਰਾਂ ਵਾਲੇ ਕੁੱਲ ਐਲ 3 ਬੈੱਡਾਂ ਤੋਂ ਵੱਧ ਨਹੀਂ ਹੋਣੇ ਚਾਹੀਦੇ',
      hi_IN: 'वेंटिलेटर के साथ उपलब्ध L3 बेड वेंटिलेटर वाले कुल L3 बेड से अधिक नहीं होने चाहिए',
    },
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
