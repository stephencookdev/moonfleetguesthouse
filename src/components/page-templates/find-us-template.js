import React from "react";
import PropTypes from "prop-types";
import { T, useT, Ways } from "@18ways/react";
import Layout from "../layout";
import SectionList, { SectionType } from "../section-list";
import { createFieldTranslationContext } from "../../i18n";
import * as styles from "../../templates/find-us.module.css";

const FindUsTemplate = ({
  siteMetadata,
  title,
  preMapSections,
  googleMapsIframeSrc,
  postMapSections,
}) => {
  const t = useT();

  return (
    <Layout siteMetadata={siteMetadata}>
      {title && (
        <h1>
          <Ways context={createFieldTranslationContext("title", "Title")}>
            <T>{title}</T>
          </Ways>
        </h1>
      )}

      <SectionList sections={preMapSections} contextName="preMapSections" />

      <iframe
        src={googleMapsIframeSrc}
        allowFullScreen={false}
        height="400"
        width="100%"
        frameBorder={0}
        className={styles.iframe}
        title={t("Map to Moonfleet")}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>

      <SectionList sections={postMapSections} contextName="postMapSections" />
    </Layout>
  );
};

FindUsTemplate.propTypes = {
  siteMetadata: PropTypes.object.isRequired,
  title: PropTypes.string,
  preMapSections: PropTypes.arrayOf(SectionType).isRequired,
  googleMapsIframeSrc: PropTypes.string.isRequired,
  postMapSections: PropTypes.arrayOf(SectionType).isRequired,
};

export default FindUsTemplate;
