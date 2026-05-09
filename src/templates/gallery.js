import React from "react";
import PropTypes from "prop-types";
import { graphql } from "gatsby";
import GalleryTemplate from "../components/page-templates/gallery-template";

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
