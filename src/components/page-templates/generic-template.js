import React from "react";
import PropTypes from "prop-types";
import { T, Ways } from "@18ways/react";
import Layout from "../layout";
import SectionList, { SectionType } from "../section-list";
import { createFieldTranslationContext } from "../../i18n";

const GenericTemplate = ({ title, sectionLayout, sections, siteMetadata }) => (
  <Layout siteMetadata={siteMetadata}>
    {title && (
      <h1>
        <Ways context={createFieldTranslationContext("title", "Title")}>
          <T>{title}</T>
        </Ways>
      </h1>
    )}
    <SectionList sections={sections} layout={sectionLayout} />
  </Layout>
);

GenericTemplate.propTypes = {
  siteMetadata: PropTypes.object.isRequired,
  title: PropTypes.string,
  sectionLayout: PropTypes.oneOf(["article", "cards"]),
  sections: PropTypes.arrayOf(SectionType).isRequired,
};

export default GenericTemplate;
