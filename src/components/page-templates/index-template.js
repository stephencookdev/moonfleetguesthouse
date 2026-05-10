import React from "react";
import PropTypes from "prop-types";
import ImageGallery from "react-image-gallery";
import { T, Ways } from "@18ways/react";
import { createFieldTranslationContext } from "../../i18n";
import TranslatedMarkdown from "../translated-markdown";
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
      <h1 className={styles.title}>
        <Ways context={createFieldTranslationContext("title", "Title")}>
          <T>{title}</T>
        </Ways>
      </h1>
      <p className={styles.tagline}>
        <Ways context={createFieldTranslationContext("tagline", "Tagline")}>
          <T>{tagline}</T>
        </Ways>
      </p>

      <BookNow
        telephone={siteMetadata.telephone}
        email={siteMetadata.email}
        className={styles.cta}
      >
        <Ways
          context={createFieldTranslationContext("booking.cta", "Booking CTA")}
        >
          <T>Book Now</T>
        </Ways>
      </BookNow>
    </header>

    <Layout floatHeader siteMetadata={siteMetadata}>
      <Ways context={createFieldTranslationContext("body", "Body")}>
        <TranslatedMarkdown>{body}</TranslatedMarkdown>
      </Ways>
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
