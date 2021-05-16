const fs = require('fs');
const path = require('path');
const asd = require('../../../')

const defaultLocale = 'en_IN';

function createMediaMessage(mediaPath, mediaType, locale, caption = '') {
    let filePath = `${mediaPath}_${locale}.${mediaType}`;
    try {
      fs.existsSync(path.resolve(__dirname, `../../../${mediaPath}`));
    } catch(err) {
      filePath = `${mediaPath}_${defaultLocale}.${mediaType}`;
    }
    const mediaMessage =  {
      type: 'media',
      output: filePath,
      mediaType: mediaType,
      caption: caption
    }
    return mediaMessage;
}

module.exports = { createMediaMessage };
