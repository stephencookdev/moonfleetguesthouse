import React from "react";
import PropTypes from "prop-types";
import { graphql } from "gatsby";
import Markdown from "markdown-to-jsx";
import ImageGallery from "react-image-gallery";
import { Link } from "gatsby";
import Layout from "../components/layout";
import * as styles from "./index.module.css";

const BackgroundImageCarousel = ({ images }) => {
  return (
    <div className={styles.headerBg}>
      <ImageGallery
        items={images.map((im) => ({ original: im }))}
        showNav={false}
        showThumbnails={false}
        showFullscreenButton={false}
        showPlayButton={false}
        autoPlay
        slideInterval={6000}
        renderItem={(item) => (
          <img src={item.original} alt="" className={styles.headerBgItem} />
        )}
      />
    </div>
  );
};

export const IndexTemplate = ({
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

      <Link to="/room-rates/" className={styles.cta}>
        Book Now
      </Link>
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

const IndexPage = ({ data }) => {
  const { frontmatter, rawMarkdownBody } = data.markdownRemark;

  return (
    <IndexTemplate
      body={rawMarkdownBody}
      siteMetadata={data.site.siteMetadata}
      {...frontmatter}
    />
  );
};

IndexPage.propTypes = {
  data: PropTypes.shape({
    site: PropTypes.shape({
      siteMetadata: PropTypes.shape({
        title: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        telephone: PropTypes.string.isRequired,
        mainNav: PropTypes.arrayOf(PropTypes.object).isRequired,
      }).isRequired,
    }),
    markdownRemark: PropTypes.shape({
      rawMarkdownBody: PropTypes.string,
      frontmatter: PropTypes.object,
    }),
  }),
};

export default IndexPage;

export const pageQuery = graphql`
  query IndexQuery($id: String!) {
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
      rawMarkdownBody
      frontmatter {
        title
        tagline
        carouselImage
      }
    }
  }
`;
