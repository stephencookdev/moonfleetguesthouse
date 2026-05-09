import React from "react";
import PropTypes from "prop-types";
import Layout from "../layout";
import SectionList, { SectionType } from "../section-list";
import * as styles from "../../templates/find-us.module.css";

const FindUsTemplate = ({
  siteMetadata,
  preMapSections,
  googleMapsIframeSrc,
  postMapSections,
}) => (
  <Layout siteMetadata={siteMetadata}>
    <SectionList sections={preMapSections} />

    <iframe
      src={googleMapsIframeSrc}
      allowFullScreen={false}
      height="400"
      width="100%"
      frameBorder={0}
      className={styles.iframe}
      title="Map to Moonfleet"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    ></iframe>

    <SectionList sections={postMapSections} />
  </Layout>
);

FindUsTemplate.propTypes = {
  siteMetadata: PropTypes.object.isRequired,
  preMapSections: PropTypes.arrayOf(SectionType).isRequired,
  googleMapsIframeSrc: PropTypes.string.isRequired,
  postMapSections: PropTypes.arrayOf(SectionType).isRequired,
};

export default FindUsTemplate;
