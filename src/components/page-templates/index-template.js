import React from "react";
import PropTypes from "prop-types";
import Markdown from "markdown-to-jsx";
import ImageGallery from "react-image-gallery";
import BookNow from "../book-now";
import Layout from "../layout";
import "react-image-gallery/styles/css/image-gallery.css";
import * as styles from "../../templates/index.module.css";

const BackgroundImageCarousel = ({ images }) => {
  const items = images.map((im, index) => ({
    original: im,
    loading: index === 0 ? "eager" : "lazy",
  }));

  return (
    <div className={styles.headerBg}>
      <ImageGallery
        items={items}
        showNav={false}
        showThumbnails={false}
        showFullscreenButton={false}
        showPlayButton={false}
        autoPlay
        slideInterval={6000}
        renderItem={(item) => (
          <img
            src={item.original}
            alt=""
            className={styles.headerBgItem}
            loading={item.loading}
            decoding="async"
          />
        )}
      />
    </div>
  );
};

BackgroundImageCarousel.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const IndexTemplate = ({
  title,
  tagline,
  carouselImage,
  body,
  siteMetadata,
}) => (
  <>
    <BackgroundImageCarousel images={carouselImage} />

    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.tagline}>{tagline}</p>

      <BookNow
        telephone={siteMetadata.telephone}
        email={siteMetadata.email}
        className={styles.cta}
      >
        Book Now
      </BookNow>
    </header>

    <Layout floatHeader siteMetadata={siteMetadata}>
      <Markdown options={{ forceBlock: true }}>{body}</Markdown>
    </Layout>
  </>
);

IndexTemplate.propTypes = {
  title: PropTypes.string,
  tagline: PropTypes.string,
  carouselImage: PropTypes.arrayOf(PropTypes.string),
  body: PropTypes.string,
  siteMetadata: PropTypes.object.isRequired,
};

export default IndexTemplate;
