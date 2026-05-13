import React from "react";
import PropTypes from "prop-types";
import { useT } from "@18ways/react";
import Layout from "../layout";
import SectionList, { SectionType } from "../section-list";
import * as styles from "../../templates/find-us.module.css";

const FindUsTemplate = ({
  siteMetadata,
  preMapSections,
  googleMapsIframeSrc,
  postMapSections,
}) => {
  const t = useT();

  return (
    <Layout siteMetadata={siteMetadata}>
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
  preMapSections: PropTypes.arrayOf(SectionType).isRequired,
  googleMapsIframeSrc: PropTypes.string.isRequired,
  postMapSections: PropTypes.arrayOf(SectionType).isRequired,
};

export default FindUsTemplate;
