import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { T, useT, Ways } from "@18ways/react";
import ImageGallery from "react-image-gallery";
import Layout from "../layout";
import { createFieldTranslationContext } from "../../i18n";
import { toThumbnailSrc } from "../../utils/image-paths";
import "react-image-gallery/styles/css/image-gallery.css";
import * as styles from "../../templates/gallery.module.css";

const normalizeGalleryImage = (image) => {
  if (typeof image === "string") {
    return { image, alt: "", caption: "" };
  }

  return image;
};

const GalleryTemplate = ({ title, images: rawImages, siteMetadata }) => {
  const imageGalleryRef = useRef(null);
  const [fullscreenIndex, setFullscreenIndex] = useState(null);
  const t = useT();

  useEffect(() => {
    if (fullscreenIndex !== null) {
      imageGalleryRef.current.fullScreen();
    }
  }, [fullscreenIndex]);

  const openImage = (i) => () => setFullscreenIndex(i);
  const handleScreenChange = (isFullScreen) => {
    if (!isFullScreen) setFullscreenIndex(null);
  };

  const images = rawImages.map(normalizeGalleryImage).map((im) => ({
    thumbnail: toThumbnailSrc(im.image),
    original: im.image,
    originalAlt: im.alt || "",
    thumbnailAlt: im.alt || "",
    description: im.caption || undefined,
  }));

  return (
    <Layout siteMetadata={siteMetadata}>
      {title && (
        <h1>
          <Ways context={createFieldTranslationContext("title", "Title")}>
            <T>{title}</T>
          </Ways>
        </h1>
      )}
      <div className={styles.gallery}>
        {images.map(({ thumbnail, thumbnailAlt }, i) => (
          <button
            key={`${thumbnail}-${i}`}
            onClick={openImage(i)}
            aria-label={
              thumbnailAlt ||
              t("Open image {imageNumber}", {
                vars: { imageNumber: i + 1 },
              })
            }
          >
            <img
              src={thumbnail}
              alt={thumbnailAlt}
              loading="lazy"
              decoding="async"
            />
          </button>
        ))}
      </div>

      {fullscreenIndex !== null && (
        <ImageGallery
          items={images}
          infinite
          showBullets
          showPlayButton={false}
          showNav
          thumbnailPosition="left"
          autoPlay={false}
          additionalClass={styles.fullscreenGallery}
          startIndex={fullscreenIndex}
          onScreenChange={handleScreenChange}
          ref={imageGalleryRef}
        />
      )}
    </Layout>
  );
};

GalleryTemplate.propTypes = {
  siteMetadata: PropTypes.object.isRequired,
  title: PropTypes.string,
  images: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        image: PropTypes.string.isRequired,
        alt: PropTypes.string,
        caption: PropTypes.string,
      }),
    ])
  ).isRequired,
};

export default GalleryTemplate;
