import React from "react";
import PropTypes from "prop-types";
import { graphql } from "gatsby";
import Layout from "../components/layout";
import SectionList, { SectionType } from "../components/section-list";
import styles from "./find-us.module.css";

export const FindUsTemplate = ({
  siteMetadata,
  preMapSections,
  googleMapsIframeSrc,
  postMapSections
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
    ></iframe>

    <SectionList sections={postMapSections} />
  </Layout>
);

FindUsTemplate.propTypes = {
  siteMetadata: PropTypes.object.isRequired,
  preMapSections: PropTypes.arrayOf(SectionType).isRequired,
  googleMapsIframeSrc: PropTypes.string.isRequired,
  postMapSections: PropTypes.arrayOf(SectionType).isRequired
};

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
        mainNav: PropTypes.arrayOf(PropTypes.object).isRequired
      }).isRequired
    }).isRequired,
    markdownRemark: PropTypes.shape({
      frontmatter: PropTypes.object
    })
  })
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
