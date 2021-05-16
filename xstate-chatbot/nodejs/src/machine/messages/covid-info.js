const messages = {
  covidInfoMenu: {
    prompt: {
      preamble: {
        en_IN: 'What would you like to know?',
        pa_IN: 'ਤੁਸੀਂ ਕੀ ਜਾਣਨਾ ਚਾਹੋਗੇ?'
      },
      options: {
        list: [ 'selfCare', 'fatehKit', 'bedAvailability', 'vaccinationCenters' ],
        messageBundle: {
          selfCare: {
            en_IN: 'How to do Self Care  in Covid',
            pa_IN: 'ਕੋਵਿਡ ਵਿਚ ਸਵੈ-ਸੰਭਾਲ ਕਿਵੇਂ ਕਰੀਏ'
          },
          fatehKit: {
            en_IN: 'How to use Fateh Kit',
            pa_IN: 'ਕੋਵਿਡ ਵਿਚ ਸਵੈ-ਸੰਭਾਲ ਕਿਵੇਂ ਕਰੀਏ'
          },
          bedAvailability: {
            en_IN: 'Where to check covid Beds Availability',
            pa_IN: 'ਕੋਵਿਡ ਬੈੱਡਾਂ ਦੀ ਉਪਲਬਧਤਾ ਨੂੰ ਕਿੱਥੇ ਚੈੱਕ ਕਰਨਾ ਹੈ'
          },
          vaccinationCenters: {
            en_IN: 'Information about Vaccination Centers',
            pa_IN: 'ਟੀਕਾਕਰਨ ਕੇਂਦਰਾਂ ਬਾਰੇ ਜਾਣਕਾਰੀ'
          },
        }
      }
    },
  },
  selfCareInfo: {
    en_IN: 'You can find detailed information regarding Self Care in COVID-19 here https://pmidc.punjab.gov.in/wp-content/uploads/2021/05/home-isolation.pdf. \nPlease follow these simple tips to stay healthy and safe!',
    pa_IN: 'ਤੁਸੀਂ ਸਵੈ-ਦੇਖਭਾਲ ਸੰਬੰਧੀ ਵਿਸਤ੍ਰਿਤ ਜਾਣਕਾਰੀ COVID-19 ਵਿਚ ਇੱਥੇ ਪ੍ਰਾਪਤ ਕਰ ਸਕਦੇ ਹੋ https://pmidc.punjab.gov.in/wp-content/uploads/2021/05/home-isolation.pdf. ਸਿਹਤਮੰਦ ਅਤੇ ਸੁਰੱਖਿਅਤ ਰਹਿਣ ਲਈ ਕਿਰਪਾ ਕਰਕੇ ਇਨ੍ਹਾਂ ਸਧਾਰਣ ਸੁਝਾਆਂ ਦੀ ਪਾਲਣਾ ਕਰੋ!'
  },
  fatehKitInfo: {
    en_IN: 'You can find information on how to use Fateh Kit here https://youtu.be/cMxBWejWyes',
    pa_IN: 'ਤੁਸੀਂ ਫਤੇਹ ਕਿੱਟ ਦੀ ਵਰਤੋਂ ਬਾਰੇ ਜਾਣਕਾਰੀ ਪ੍ਰਾਪਤ ਕਰ ਸਕਦੇ ਹੋ ਇਹ https://youtu.be/cMxBWejWyes ਹੈ'
  },
  bedAvailabilityInfo: {
    en_IN: 'You can find information regarding Beds Availability centers here http://statecovidcontrolroom.punjab.gov.in/',
    pa_IN: 'ਤੁਸੀਂ ਬੈੱਡਜ਼ ਅਵੈਲੇਬਿਲਿਟੀ ਸੈਂਟਰਾਂ ਬਾਰੇ ਜਾਣਕਾਰੀ ਇੱਥੇ ਪ੍ਰਾਪਤ ਕਰ ਸਕਦੇ ਹੋ http://statecovidcontrolroom.punjab.gov.in/.'
  },
  vaccinationCentersInfo: {
    en_IN: 'You can find information regarding COVID-19 vaccination centers here https://nhm.punjab.gov.in/',
    pa_IN: 'ਤੁਸੀਂ COVID-19 ਟੀਕਾਕਰਨ ਕੇਂਦਰਾਂ ਬਾਰੇ ਜਾਣਕਾਰੀ ਇੱਥੇ ਪ੍ਰਾਪਤ ਕਰ ਸਕਦੇ ਹੋ https://nhm.punjab.gov.in/'
  }
};

module.exports = messages;