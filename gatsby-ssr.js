const React = require("react");
const { Ways } = require("@18ways/react");
const { BASE_LOCALE, getPathLocale, WAYS_ROOT_PROPS } = require("./src/i18n");

exports.wrapPageElement = ({ element, props }) => {
  const { locale, translationContext } = props.pageContext || {};
  const routeLocale =
    getPathLocale(props.location?.pathname) || locale || BASE_LOCALE;

  const pageElement = translationContext
    ? React.createElement(Ways, { context: translationContext }, element)
    : element;

  return React.createElement(
    Ways,
    { ...WAYS_ROOT_PROPS, locale: routeLocale },
    pageElement
  );
};

exports.onRenderBody = ({ pathname, setHeadComponents, setHtmlAttributes }) => {
  setHtmlAttributes({ lang: getPathLocale(pathname) || BASE_LOCALE });

  setHeadComponents([
    React.createElement("title", { key: "title" }, "Moonfleet"),
    React.createElement("link", {
      key: "font-preconnect",
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous",
    }),
    React.createElement("link", {
      key: "font-stylesheet",
      href: "https://fonts.googleapis.com/css?family=Cardo:400,700|Josefin+Sans:300,400&display=swap",
      rel: "stylesheet",
    }),
  ]);
};
