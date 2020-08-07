import React from "react";
import PropTypes from "prop-types";
import { graphql } from "gatsby";
import SectionList, { SectionType } from "../components/section-list";
import Layout from "../components/layout";

export const GenericTemplate = ({ sections, siteMetadata }) => (
  <Layout siteMetadata={siteMetadata}>
    <SectionList sections={sections} />
  </Layout>
);

GenericTemplate.propTypes = {
  siteMetadata: PropTypes.object.isRequired,
  sections: PropTypes.arrayOf(SectionType).isRequired,
};

const Generic = ({ data }) => {
  const { frontmatter } = data.markdownRemark;

  return (
    <GenericTemplate {...frontmatter} siteMetadata={data.site.siteMetadata} />
  );
};

Generic.propTypes = {
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

export default Generic;

export const pageQuery = graphql`
  query GenericQuery($id: String!) {
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
        sections {
          title
          image
          body
        }
      }
    }
  }
`;
