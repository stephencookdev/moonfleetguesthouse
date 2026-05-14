const React = require("react");
const { Ways } = require("@18ways/react");
const { BASE_LOCALE, getPathLocale, WAYS_ROOT_PROPS } = require("./src/i18n");
require("./src/global.css");

const GA_MEASUREMENT_ID = process.env.GATSBY_GA_MEASUREMENT_ID;
const GA_MEASUREMENT_ID_LITERAL = JSON.stringify(GA_MEASUREMENT_ID);

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

  const headComponents = [
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
    React.createElement("link", {
      key: "favicon-ico",
      rel: "icon",
      href: "/assets/favicon.ico",
      sizes: "any",
    }),
    React.createElement("link", {
      key: "favicon-32",
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      href: "/assets/favicon-32x32.png",
    }),
    React.createElement("link", {
      key: "favicon-16",
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      href: "/assets/favicon-16x16.png",
    }),
    React.createElement("link", {
      key: "apple-touch-icon",
      rel: "apple-touch-icon",
      sizes: "180x180",
      href: "/assets/apple-touch-icon.png",
    }),
    React.createElement("link", {
      key: "site-webmanifest",
      rel: "manifest",
      href: "/site.webmanifest",
    }),
    React.createElement("meta", {
      key: "theme-color",
      name: "theme-color",
      content: "#222222",
    }),
  ];

  if (GA_MEASUREMENT_ID) {
    headComponents.push(
      React.createElement("script", {
        key: "ga-script",
        async: true,
        src: `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
          GA_MEASUREMENT_ID
        )}`,
      }),
      React.createElement("script", {
        key: "ga-config",
        dangerouslySetInnerHTML: {
          __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag("js", new Date());
gtag("config", ${GA_MEASUREMENT_ID_LITERAL}, { send_page_view: false });
`,
        },
      })
    );
  }

  setHeadComponents(headComponents);
};
