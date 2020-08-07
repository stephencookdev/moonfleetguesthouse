import React, { useRef } from "react";
import PropTypes from "prop-types";
import { graphql } from "gatsby";
import ImageGallery from "react-image-gallery";
import Layout from "../components/layout";
import styles from "./gallery.module.css";

export const GalleryTemplate = ({ images, siteMetadata }) => {
  const imageGalleryRef = useRef(null);

  const openImage = (i) => () => {
    imageGalleryRef.current.slideToIndex(i);
    imageGalleryRef.current.fullScreen();
  };

  return (
    <Layout siteMetadata={siteMetadata}>
      <div className={styles.gallery}>
        {images.map((src, i) => (
          <button key={src} onClick={openImage(i)}>
            <img src={src} alt="" />
          </button>
        ))}
      </div>

      <ImageGallery
        items={images.map((im) => ({ thumbnail: im, original: im }))}
        infinite
        showBullets
        showPlayButton={false}
        showNav
        thumbnailPosition="left"
        autoPlay={false}
        additionalClass={styles.fullscreenGallery}
        ref={imageGalleryRef}
      />
    </Layout>
  );
};

GalleryTemplate.propTypes = {
  siteMetadata: PropTypes.object.isRequired,
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const Gallery = ({ data }) => {
  const { frontmatter } = data.markdownRemark;

  return (
    <GalleryTemplate {...frontmatter} siteMetadata={data.site.siteMetadata} />
  );
};

Gallery.propTypes = {
  data: PropTypes.shape({
    site: PropTypes.shape({
      siteMetadata: PropTypes.shape({
        title: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        telephone: PropTypes.string.isRequired,
        mainNav: PropTypes.arrayOf(PropTypes.object).isRequired,
      }).isRequired,
    }).isRequired,
    markdownRemark: PropTypes.shape({
      frontmatter: PropTypes.object,
    }),
  }),
};

export default Gallery;

export const pageQuery = graphql`
  query GalleryQuery($id: String!) {
    site {
      siteMetadata {
        title
        email
        telephone
        mainNav {
          href
          title
        }
      }
    }
    markdownRemark(id: { eq: $id }) {
      frontmatter {
        images
      }
    }
  }
`;
