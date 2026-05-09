import React from "react";
import PropTypes from "prop-types";
import { graphql } from "gatsby";
import FindUsTemplate from "../components/page-templates/find-us-template";

const FindUs = ({ data }) => {
  const { frontmatter } = data.markdownRemark;

  return (
    <FindUsTemplate {...frontmatter} siteMetadata={data.site.siteMetadata} />
  );
};

FindUs.propTypes = {
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

export default FindUs;

export const pageQuery = graphql`
  query FindUsQuery($id: String!) {
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
        preMapSections {
          title
          body
        }
        googleMapsIframeSrc
        postMapSections {
          title
          body
        }
      }
    }
  }
`;
