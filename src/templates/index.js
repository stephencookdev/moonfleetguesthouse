import React from "react";
import PropTypes from "prop-types";
import { graphql } from "gatsby";
import Markdown from "markdown-to-jsx";
import ImageGallery from "react-image-gallery";
import Layout from "../components/layout";
import styles from "./index.module.css";

const BackgroundImageCarousel = ({ images }) => {
  return (
    <div className={styles.headerBg}>
      <ImageGallery
        items={images.map(im => ({ original: im }))}
        showNav={false}
        showThumbnails={false}
        showFullscreenButton={false}
        showPlayButton={false}
        autoPlay
        slideInterval={6000}
        renderItem={item => (
          <img src={item.original} alt="" className={styles.headerBgItem} />
        )}
      />
    </div>
  );
};

export const IndexPageTemplate = ({
  title,
  tagline,
  carouselImage,
  body,
  telephone
}) => (
  <>
    <header className={styles.header}>
      <BackgroundImageCarousel images={carouselImage} />

      <h1 className={styles.title}>{title}</h1>
      <p className={styles.tagline}>{tagline}</p>

      <a href={`tel:${telephone}`} className={styles.cta}>
        Book Now
      </a>
    </header>

    <Layout>
      <Markdown options={{ forceBlock: true }}>{body}</Markdown>
    </Layout>
  </>
);

IndexPageTemplate.propTypes = {
  title: PropTypes.string,
  tagline: PropTypes.string,
  carouselImage: PropTypes.arrayOf(PropTypes.string),
  body: PropTypes.string,
  telephone: PropTypes.string
};

const IndexPage = ({ data }) => {
  const { telephone } = data.site.siteMetadata;
  const { frontmatter, rawMarkdownBody } = data.markdownRemark;

  return (
    <IndexPageTemplate
      body={rawMarkdownBody}
      telephone={telephone}
      {...frontmatter}
    />
  );
};

IndexPage.propTypes = {
  data: PropTypes.shape({
    site: PropTypes.shape({
      siteMetadata: PropTypes.shape({
        telephone: PropTypes.string
      })
    }),
    markdownRemark: PropTypes.shape({
      rawMarkdownBody: PropTypes.string,
      frontmatter: PropTypes.object
    })
  })
};

export default IndexPage;

export const pageQuery = graphql`
  query IndexQuery($id: String!) {
    site {
      siteMetadata {
        telephone
      }
    }
    markdownRemark(id: { eq: $id }) {
      rawMarkdownBody
      frontmatter {
        title
        tagline
        carouselImage
      }
    }
  }
`;
