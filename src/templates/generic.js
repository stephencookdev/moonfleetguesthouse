import React from "react";
import PropTypes from "prop-types";
import { graphql } from "gatsby";
import SectionList, { SectionType } from "../components/section-list";
import Layout from "../components/layout";

export const GenericTemplate = ({ sections }) => (
  <SectionList sections={sections} />
);

GenericTemplate.propTypes = {
  sections: PropTypes.arrayOf(SectionType).isRequired
};

const Generic = ({ data }) => {
  const { frontmatter } = data.markdownRemark;

  return (
    <Layout>
      <GenericTemplate {...frontmatter} />
    </Layout>
  );
};

Generic.propTypes = {
  data: PropTypes.shape({
    markdownRemark: PropTypes.shape({
      frontmatter: PropTypes.object
    })
  })
};

export default Generic;

export const pageQuery = graphql`
  query GenericQuery($id: String!) {
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
