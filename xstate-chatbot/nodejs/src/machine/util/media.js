const fs = require('fs');
const path = require('path');

const defaultLocale = 'en_IN';

function createMediaMessage(mediaPath, mediaType, locale, caption = '') {
  let filePath;
  if (locale) {
    filePath = `${mediaPath}_${locale}.${mediaType}`;
    let fileExists = false;
    try {
      fileExists = fs.existsSync(path.resolve(__dirname, `../../../${filePath}`));
    } catch (err) {
      console.error(err);
    }
    console.log(fileExists);
    if (!fileExists) {
      console.error(`${mediaPath} for ${locale} not found`);
      filePath = `${mediaPath}_${defaultLocale}.${mediaType}`;
    }
  } else {
    filePath = `${mediaPath}.${mediaType}`;
  }

  const mediaMessage = {
    type: 'media',
    output: filePath,
    mediaType,
    caption,
  };
  return mediaMessage;
}

module.exports = { createMediaMessage };
