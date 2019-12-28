import React, { useRef } from "react";
import PropTypes from "prop-types";
import { graphql } from "gatsby";
import ImageGallery from "react-image-gallery";
import Layout from "../components/layout";
import styles from "./gallery.module.css";

export const GalleryTemplate = ({ images }) => {
  const imageGalleryRef = useRef(null);

  const openImage = i => () => {
    imageGalleryRef.current.slideToIndex(i);
    imageGalleryRef.current.fullScreen();
  };

  return (
    <>
      <div className={styles.gallery}>
        {images.map((src, i) => (
          <button key={src} onClick={openImage(i)}>
            <img src={src} alt="" />
          </button>
        ))}
      </div>

      <ImageGallery
        items={images.map(im => ({ thumbnail: im, original: im }))}
        infinite
        showBullets
        showPlayButton={false}
        showNav
        thumbnailPosition="left"
        autoPlay={false}
        additionalClass={styles.fullscreenGallery}
        ref={imageGalleryRef}
      />
    </>
  );
};

GalleryTemplate.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string).isRequired
};

const Gallery = ({ data }) => {
  const { frontmatter } = data.markdownRemark;

  return (
    <Layout>
      <GalleryTemplate {...frontmatter} />
    </Layout>
  );
};

Gallery.propTypes = {
  data: PropTypes.shape({
    markdownRemark: PropTypes.shape({
      frontmatter: PropTypes.object
    })
  })
};

export default Gallery;

export const pageQuery = graphql`
  query GalleryQuery($id: String!) {
    markdownRemark(id: { eq: $id }) {
      frontmatter {
        images
      }
    }
  }
`;
