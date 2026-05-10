import React from "react";
import PropTypes from "prop-types";
import { T, Ways } from "@18ways/react";
import TranslatedMarkdown from "./translated-markdown";
import { toThumbnailSrc } from "../utils/image-paths";
import * as styles from "./section-list.module.css";

export const SectionType = PropTypes.shape({
  title: PropTypes.string.isRequired,
  image: PropTypes.string,
  imageAlt: PropTypes.string,
  imageCaption: PropTypes.string,
  body: PropTypes.string.isRequired,
});

const fieldScope = (name, label) => ({
  name,
  label,
  treePath: label,
});

const normalizeSectionImage = ({ image, imageAlt, imageCaption }) => {
  if (!image || typeof image === "string") {
    return { image, imageAlt, imageCaption };
  }

  return {
    image: image.image,
    imageAlt: image.alt || image.imageAlt || imageAlt,
    imageCaption: image.caption || image.imageCaption || imageCaption,
  };
};

const SectionList = ({
  sections,
  contextName = "sections",
  layout = "cards",
}) => (
  <div
    className={[
      styles.sectionList,
      layout === "article" && styles.article,
      layout === "cards" && styles.cards,
    ]
      .filter(Boolean)
      .join(" ")}
  >
    {sections.map((section, index) => {
      const { title, body } = section;
      const { image, imageAlt, imageCaption } = normalizeSectionImage(section);

      return (
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
            <div
              className={[styles.sectionContent, image && styles.hasImage]
                .filter(Boolean)
                .join(" ")}
            >
              {image && (
                <figure>
                  <img
                    src={toThumbnailSrc(image)}
                    alt={imageAlt || ""}
                    loading="lazy"
                    decoding="async"
                  />
                  {imageCaption && <figcaption>{imageCaption}</figcaption>}
                </figure>
              )}
              <Ways context={fieldScope("body", "Body")}>
                <TranslatedMarkdown>{body}</TranslatedMarkdown>
              </Ways>
            </div>
          </div>
        </Ways>
      );
    })}
  </div>
);

SectionList.propTypes = {
  sections: PropTypes.arrayOf(SectionType).isRequired,
  contextName: PropTypes.string,
  layout: PropTypes.oneOf(["article", "cards"]),
};

export default SectionList;
