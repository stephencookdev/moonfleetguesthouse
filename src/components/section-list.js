import React from "react";
import PropTypes from "prop-types";
import { T, Ways } from "@18ways/react";
import TranslatedMarkdown from "./translated-markdown";
import { toThumbnailSrc } from "../utils/image-paths";
import * as styles from "./section-list.module.css";

export const SectionType = PropTypes.shape({
  title: PropTypes.string.isRequired,
  image: PropTypes.string,
  body: PropTypes.string.isRequired,
});

const fieldScope = (name, label) => ({
  name,
  label,
  treePath: label,
});

const SectionList = ({ sections, contextName = "sections" }) => (
  <div className={styles.sectionList}>
    {sections.map(({ title, image, body }, index) => (
      <Ways
        key={title}
        context={{
          name: `${contextName}.${index + 1}`,
          label: title,
          treePath: `${contextName} > ${title}`,
        }}
      >
        <div className={styles.section}>
          <h2>
            <Ways context={fieldScope("title", "Title")}>
              <T>{title}</T>
            </Ways>
          </h2>
          <div className={styles.sectionContent}>
            {image && (
              <img
                src={toThumbnailSrc(image)}
                alt=""
                loading="lazy"
                decoding="async"
              />
            )}
            <Ways context={fieldScope("body", "Body")}>
              <TranslatedMarkdown>{body}</TranslatedMarkdown>
            </Ways>
          </div>
        </div>
      </Ways>
    ))}
  </div>
);

SectionList.propTypes = {
  sections: PropTypes.arrayOf(SectionType).isRequired,
  contextName: PropTypes.string,
};

export default SectionList;
