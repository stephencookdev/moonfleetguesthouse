import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import ImageGallery from "react-image-gallery";
import Layout from "../layout";
import { toThumbnailSrc } from "../../utils/image-paths";
import "react-image-gallery/styles/css/image-gallery.css";
import * as styles from "../../templates/gallery.module.css";

const GalleryTemplate = ({ images: rawImages, siteMetadata }) => {
  const imageGalleryRef = useRef(null);
  const [fullscreenIndex, setFullscreenIndex] = useState(null);

  useEffect(() => {
    if (fullscreenIndex !== null) {
      imageGalleryRef.current.fullScreen();
    }
  }, [fullscreenIndex]);

  const openImage = (i) => () => setFullscreenIndex(i);
  const handleScreenChange = (isFullScreen) => {
    if (!isFullScreen) setFullscreenIndex(null);
  };

  const images = rawImages.map((im) => ({
    thumbnail: toThumbnailSrc(im),
    original: im,
  }));

  return (
    <Layout siteMetadata={siteMetadata}>
      <div className={styles.gallery}>
        {images.map(({ thumbnail }, i) => (
          <button
            key={`${thumbnail}-${i}`}
            onClick={openImage(i)}
            aria-label={`Open image ${i + 1}`}
          >
            <img src={thumbnail} alt="" loading="lazy" decoding="async" />
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
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default GalleryTemplate;
