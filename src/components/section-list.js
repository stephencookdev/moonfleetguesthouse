import React from "react";
import PropTypes from "prop-types";
import Markdown from "markdown-to-jsx";
import styles from "./section-list.module.css";

export const SectionType = PropTypes.shape({
  title: PropTypes.string.isRequired,
  image: PropTypes.string,
  body: PropTypes.string.isRequired,
});

const SectionList = ({ sections }) => (
  <div className={styles.sectionList}>
    {sections.map(({ title, image, body }) => (
      <div className={styles.section} key={title}>
        <h2>{title}</h2>
        <div className={styles.sectionContent}>
          {image && <img src={image} alt="" />}
          <Markdown options={{ forceBlock: true }}>{body}</Markdown>
        </div>
      </div>
    ))}
  </div>
);

SectionList.propTypes = {
  sections: PropTypes.arrayOf(SectionType).isRequired,
};

export default SectionList;
