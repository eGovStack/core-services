function createMediaMessage(mediaPath, mediaType, locale, caption = '') {
    if (mediaType) {
      if (locale != 'en_IN') {
        mediaPath+= '_' + locale + `.${mediaType}`;
      } else {
        mediaPath+= `.${mediaType}`;
      }
    }
    const mediaMessage =  {
      "type": "media",
      "output": mediaPath,
      "caption": caption
    }
    return mediaMessage;
}

module.exports = { createMediaMessage };
