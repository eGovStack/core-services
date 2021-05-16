const messages = {
  covidInfoMenu: {
    prompt: {
      preamble: {
        en_IN: 'What would you like to know?',
        pa_IN: 'ਤੁਸੀਂ ਕੀ ਜਾਣਨਾ ਚਾਹੋਗੇ?',
        hi_IN: 'आप क्या जानना चाहेंगे?',
      },
      options: {
        list: [ 'selfCare', 'fatehKit', 'bedAvailability', 'vaccinationCenters' ],
        messageBundle: {
          selfCare: {
            en_IN: 'How to do Self Care  in Covid',
            pa_IN: 'ਕੋਵਿਡ ਵਿਚ ਸਵੈ-ਸੰਭਾਲ ਕਿਵੇਂ ਕਰੀਏ',
            hi_IN: 'कोविड में अपना ख्याल कैसे रखें?',
          },
          fatehKit: {
            en_IN: 'How to use Fateh Kit',
            pa_IN: 'ਫਤਿਹ ਕਿੱਟ ਦੀ ਵਰਤੋਂ ਕਿਵੇਂ ਕਰੀਏ',
            hi_IN: 'फतेह किट का इस्तेमाल कैसे करें',
          },
          bedAvailability: {
            en_IN: 'Where to check covid Beds Availability',
            pa_IN: 'ਕੋਵਿਡ ਬੈੱਡਾਂ ਦੀ ਉਪਲਬਧਤਾ ਨੂੰ ਕਿੱਥੇ ਚੈੱਕ ਕਰਨਾ ਹੈ',
            hi_IN: 'कोविड बेड की उपलब्धता की जांच कहां करें',
          },
          vaccinationCenters: {
            en_IN: 'Information about Vaccination Centers',
            pa_IN: 'ਟੀਕਾਕਰਨ ਕੇਂਦਰਾਂ ਬਾਰੇ ਜਾਣਕਾਰੀ',
            hi_IN: 'टीकाकरण केंद्रों की जानकारी',
          },
        }
      }
    },
  },
  selfCareInfo: {
    en_IN: 'You can find detailed information regarding Self Care in COVID-19 here https://pmidc.punjab.gov.in/wp-content/uploads/2021/05/home-isolation.pdf. \nPlease follow these simple tips to stay healthy and safe!',
    pa_IN: 'ਤੁਸੀਂ ਸਵੈ-ਦੇਖਭਾਲ ਸੰਬੰਧੀ ਵਿਸਤ੍ਰਿਤ ਜਾਣਕਾਰੀ COVID-19 ਵਿਚ ਇੱਥੇ ਪ੍ਰਾਪਤ ਕਰ ਸਕਦੇ ਹੋ https://pmidc.punjab.gov.in/wp-content/uploads/2021/05/home-isolation.pdf. ਸਿਹਤਮੰਦ ਅਤੇ ਸੁਰੱਖਿਅਤ ਰਹਿਣ ਲਈ ਕਿਰਪਾ ਕਰਕੇ ਇਨ੍ਹਾਂ ਸਧਾਰਣ ਸੁਝਾਆਂ ਦੀ ਪਾਲਣਾ ਕਰੋ!',
    hi_IN: 'आप COVID-19 में स्वयं की देखभाल के बारे में विस्तृत जानकारी https://pmidc.punjab.gov.in/wp-content/uploads/2021/05/home-isolation.pdf पर प्राप्त कर सकते हैं। स्वस्थ और सुरक्षित रहने के लिए कृपया इन सरल युक्तियों का पालन करें!',
  },
  fatehKitInfo: {
    en_IN: 'You can find information on how to use Fateh Kit here https://youtu.be/cMxBWejWyes',
    pa_IN: 'ਤੁਸੀਂ ਇੱਥੇ https://youtu.be/cMxBWejWyes ਫਤੇਹ ਕਿੱਟ ਦੀ ਵਰਤੋਂ ਬਾਰੇ ਜਾਣਕਾਰੀ ਪ੍ਰਾਪਤ ਕਰ ਸਕਦੇ ਹੋ ',
    hi_IN: 'आप यहां https://youtu.be/cMxBWejWyes पर फतेह किट का उपयोग करने के बारे में जानकारी प्राप्त कर सकते हैं',
  },
  bedAvailabilityInfo: {
    en_IN: 'You can find information regarding Beds Availability centers here http://statecovidcontrolroom.punjab.gov.in/',
    pa_IN: 'ਤੁਸੀਂ ਬੈੱਡ ਉਪਲਬਧਤਾ ਕੇਂਦਰਾਂ ਬਾਰੇ ਜਾਣਕਾਰੀ http://statecovidcontrolroom.punjab.gov.in/ \'ਤੇ ਪ੍ਰਾਪਤ ਕਰ ਸਕਦੇ ਹੋ.',
    hi_IN: 'आप http://statecovidcontrolroom.punjab.gov.in/ पर बिस्तर उपलब्धता केंद्रों के बारे में जानकारी प्राप्त कर सकते हैं।',
  },
  vaccinationCentersInfo: {
    en_IN: 'You can find information regarding COVID-19 vaccination centers here https://nhm.punjab.gov.in/',
    pa_IN: 'ਤੁਸੀਂ COVID-19 ਟੀਕਾਕਰਨ ਕੇਂਦਰਾਂ ਬਾਰੇ ਜਾਣਕਾਰੀ ਇੱਥੇ ਪ੍ਰਾਪਤ ਕਰ ਸਕਦੇ ਹੋ https://nhm.punjab.gov.in/',
    hi_IN: 'आप यहां COVID-19 टीकाकरण केंद्रों के बारे में जानकारी प्राप्त कर सकते हैं https://nhm.punjab.gov.in/',
  }
};

module.exports = messages;