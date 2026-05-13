const React = require("react");
const { Ways } = require("@18ways/react");
const { BASE_LOCALE, getPathLocale, WAYS_ROOT_PROPS } = require("./src/i18n");

exports.wrapPageElement = ({ element, props }) => {
  const { availableLocales, locale, translationContext } =
    props.pageContext || {};
  const routeLocale =
    getPathLocale(props.location?.pathname) || locale || BASE_LOCALE;
  const rootProps =
    availableLocales && availableLocales.length > 0
      ? { ...WAYS_ROOT_PROPS, acceptedLocales: availableLocales }
      : WAYS_ROOT_PROPS;

  const pageElement = translationContext
    ? React.createElement(Ways, { context: translationContext }, element)
    : element;

  return React.createElement(
    Ways,
    { ...rootProps, locale: routeLocale },
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
