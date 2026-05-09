import React from "react";
import PropTypes from "prop-types";
import Layout from "../layout";
import SectionList, { SectionType } from "../section-list";

const GenericTemplate = ({ sections, siteMetadata }) => (
  <Layout siteMetadata={siteMetadata}>
    <SectionList sections={sections} />
  </Layout>
);

GenericTemplate.propTypes = {
  siteMetadata: PropTypes.object.isRequired,
  sections: PropTypes.arrayOf(SectionType).isRequired,
};

export default GenericTemplate;
