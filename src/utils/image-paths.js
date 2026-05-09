export const toThumbnailSrc = (src) =>
  src ? src.replace("/assets/", "/assets-thumbnails/") : src;
