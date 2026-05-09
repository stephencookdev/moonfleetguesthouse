import React from "react";
import PropTypes from "prop-types";
import { graphql } from "gatsby";
import IndexTemplate from "../components/page-templates/index-template";

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
