function createMediaMessage(mediaPath, mediaType, locale, caption = '') {
    mediaPath+= '_' + locale + `.${mediaType}`;
    const mediaMessage =  {
      type: 'media',
      output: mediaPath,
      mediaType: mediaType,
      caption: caption
    }
    return mediaMessage;
}

module.exports = { createMediaMessage };
