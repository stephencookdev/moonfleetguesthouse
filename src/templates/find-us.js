import React from "react";
import PropTypes from "prop-types";
import { graphql } from "gatsby";
import Layout from "../components/layout";
import SectionList, { SectionType } from "../components/section-list";
import styles from "./find-us.module.css";

export const FindUsTemplate = ({
  preMapSections,
  googleMapsIframeSrc,
  postMapSections
}) => (
  <>
    <SectionList sections={preMapSections} />

    <iframe
      src={googleMapsIframeSrc}
      allowFullScreen={false}
      height="400"
      width="100%"
      frameBorder={0}
      className={styles.iframe}
      title="Map to Moonfleet"
    ></iframe>

    <SectionList sections={postMapSections} />
  </>
);

FindUsTemplate.propTypes = {
  preMapSections: PropTypes.arrayOf(SectionType).isRequired,
  googleMapsIframeSrc: PropTypes.string.isRequired,
  postMapSections: PropTypes.arrayOf(SectionType).isRequired
};

const FindUs = ({ data }) => {
  const { frontmatter } = data.markdownRemark;

  return (
    <Layout>
      <FindUsTemplate {...frontmatter} />
    </Layout>
  );
};

FindUs.propTypes = {
  data: PropTypes.shape({
    markdownRemark: PropTypes.shape({
      frontmatter: PropTypes.object
    })
  })
};

export default FindUs;

export const pageQuery = graphql`
  query FindUsQuery($id: String!) {
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
