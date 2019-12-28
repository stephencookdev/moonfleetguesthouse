import React from "react";
import PropTypes from "prop-types";
import { graphql } from "gatsby";
import Markdown from "markdown-to-jsx";
import Layout from "../components/layout";
import styles from "./find-us.module.css";

const SectionList = ({ sections }) => (
  <div className={styles.sectionList}>
    {sections.map(({ title, body }) => (
      <div className={styles.section}>
        <h2>{title}</h2>
        <Markdown options={{ forceBlock: true }}>{body}</Markdown>
      </div>
    ))}
  </div>
);

const SectionType = PropTypes.shape({
  title: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired
});

SectionList.propTypes = {
  sections: PropTypes.arrayOf(SectionType).isRequired
};

export const FindUsTemplate = ({
  preMapSections,
  googleMapsIframeSrc,
  postMapSections
}) => (
  <>
    <SectionList sections={preMapSections} />

    <iframe
      src={googleMapsIframeSrc}
      allowfullscreen={false}
      height="400"
      width="100%"
      frameborder="0"
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
