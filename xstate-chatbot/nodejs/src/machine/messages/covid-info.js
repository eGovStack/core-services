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
            en_IN: 'Information about availability of Covid Beds',
            pa_IN: 'ਕੋਵਿਡ ਬੈੱਡਾਂ ਦੀ ਉਪਲਬਧਤਾ ਬਾਰੇ ਜਾਣਕਾਰੀ',
            hi_IN: 'कोविड बेड की उपलब्धता के बारे में जानकारी',
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
    en_IN: 'You can find detailed information regarding Self Care in COVID-19 here https://pmidc.punjab.gov.in/wp-content/uploads/2021/05/home-isolation.pdf. \nPlease follow these simple tips to stay healthy and safe! For detailed information on clicnical management of covid-19 click here https://nhm.punjab.gov.in/Clinical_Guidance.pdf',
    pa_IN: 'ਤੁਸੀਂ ਸਵੈ-ਦੇਖਭਾਲ ਸੰਬੰਧੀ ਵਿਸਤ੍ਰਿਤ ਜਾਣਕਾਰੀ COVID-19 ਵਿਚ ਇੱਥੇ ਪ੍ਰਾਪਤ ਕਰ ਸਕਦੇ ਹੋ https://pmidc.punjab.gov.in/wp-content/uploads/2021/05/home-isolation.pdf. ਸਿਹਤਮੰਦ ਅਤੇ ਸੁਰੱਖਿਅਤ ਰਹਿਣ ਲਈ ਕਿਰਪਾ ਕਰਕੇ ਇਨ੍ਹਾਂ ਸਧਾਰਣ ਸੁਝਾਆਂ ਦੀ ਪਾਲਣਾ ਕਰੋ! ਕੋਵਿਡ -19 ਦੇ ਕਲਿਕਲ ਪ੍ਰਬੰਧਨ ਬਾਰੇ ਵਿਸਥਾਰ ਜਾਣਕਾਰੀ ਲਈ ਇੱਥੇ ਕਲਿੱਕ ਕਰੋ  https://nhm.punjab.gov.in/Clinical_Guidance.pdf',
    hi_IN: 'आप COVID-19 में स्वयं की देखभाल के बारे में विस्तृत जानकारी https://pmidc.punjab.gov.in/wp-content/uploads/2021/05/home-isolation.pdf पर प्राप्त कर सकते हैं। स्वस्थ और सुरक्षित रहने के लिए कृपया इन सरल युक्तियों का पालन करें! कोविड-19 के क्लिक प्रबंधन के बारे में विस्तृत जानकारी के लिए यहां क्लिक करें  https://nhm.punjab.gov.in/Clinical_Guidance.pdf',
  },
  fatehKitInfo: {
    en_IN: 'Detailed Video on How to use Fateh Kit is here https://youtu.be/eqg8tFyRlLk. Please find below information related to Fateh Kit use.',
    pa_IN: 'ਫਤਿਹ ਕਿੱਟ ਦੀ ਵਰਤੋਂ ਬਾਰੇ ਵਿਸਤ੍ਰਿਤ ਵੀਡੀਓ ਇੱਥੇ ਹੈ https://youtu.be/eqg8tFyRlLk ਫਤਿਹ ਕਿੱਟ ਦੀ ਵਰਤੋਂ ਨਾਲ ਸਬੰਧਤ ਜਾਣਕਾਰੀ ',
    hi_IN: 'फतेह किट का उपयोग कैसे करें पर विस्तृत वीडियो यहां है https://youtu.be/eqg8tFyRlLkफतेह किट के उपयोग के संबंध में जानकारी',
  },
  bedAvailabilityInfo: {
    en_IN: 'You can find information regarding Beds Availability here http://statecovidcontrolroom.punjab.gov.in/',
    pa_IN: 'ਤੁਸੀਂ ਬੈੱਡ ਉਪਲਬਧਤਾ ਬਾਰੇ ਜਾਣਕਾਰੀ http://statecovidcontrolroom.punjab.gov.in/',
    hi_IN: 'आप http://statecovidcontrolroom.punjab.gov.in/ पर बिस्तर उपलब्धता केंद्रों के बारे में जानकारी प्राप्त कर सकते हैं।',
  },
  vaccinationCentersInfo: {
    en_IN: 'You can find information regarding COVID-19 vaccination centers here https://nhm.punjab.gov.in/',
    pa_IN: 'ਤੁਸੀਂ COVID-19 ਟੀਕਾਕਰਨ ਕੇਂਦਰਾਂ ਬਾਰੇ ਜਾਣਕਾਰੀ ਇੱਥੇ ਪ੍ਰਾਪਤ ਕਰ ਸਕਦੇ ਹੋ https://nhm.punjab.gov.in/',
    hi_IN: 'आप यहां COVID-19 टीकाकरण केंद्रों के बारे में जानकारी प्राप्त कर सकते हैं https://nhm.punjab.gov.in/',
  }
};

module.exports = messages;