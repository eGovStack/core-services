const fs = require('fs');
const path = require('path');

const defaultLocale = 'en_IN';

function createMediaMessage(mediaPath, mediaType, locale, caption = '') {
  let filePath;
  if(locale)
    filePath = `${mediaPath}_${locale}.${mediaType}`;
  else
    filePath = `${mediaPath}.${mediaType}`;
  if(!fs.existsSync(path.resolve(__dirname, `../../../${filePath}`))) {
    console.error(`${mediaPath} for ${locale} not found`);
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
