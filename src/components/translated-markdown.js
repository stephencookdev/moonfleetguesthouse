import React from "react";
import PropTypes from "prop-types";
import Markdown from "markdown-to-jsx";
import { T } from "@18ways/react";

const translatedMarkdownTags = ["p", "li", "h1", "h2", "h3", "h4", "h5", "h6"];

const createMarkdownOptions = () => ({
  forceBlock: true,
  overrides: Object.fromEntries(
    translatedMarkdownTags.map((tagName) => {
      const Component = ({ children, ...props }) =>
        React.createElement(tagName, props, <T>{children}</T>);

      Component.propTypes = {
        children: PropTypes.node,
      };

      return [tagName, { component: Component }];
    })
  ),
});

const TranslatedMarkdown = ({ children }) => (
  <Markdown options={createMarkdownOptions()}>{children}</Markdown>
);

TranslatedMarkdown.propTypes = {
  children: PropTypes.string,
};

export default TranslatedMarkdown;
