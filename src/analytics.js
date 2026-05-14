import { BASE_LOCALE, getPathLocale } from "./i18n";

export const GA_MEASUREMENT_ID = process.env.GATSBY_GA_MEASUREMENT_ID;

const getPagePath = (location) =>
  `${location.pathname || "/"}${location.search || ""}`;

const getPageLocation = (location) => {
  if (location.href) return location.href;
  if (typeof window === "undefined") return getPagePath(location);

  return `${window.location.origin}${getPagePath(location)}${
    location.hash || ""
  }`;
};

const getBrowserLanguages = () => {
  if (typeof navigator === "undefined") return "";

  if (Array.isArray(navigator.languages) && navigator.languages.length > 0) {
    return navigator.languages.join(",");
  }

  return navigator.language || "";
};

let lastTrackedPath;

export const trackPageView = (location) => {
  if (
    !GA_MEASUREMENT_ID ||
    typeof window === "undefined" ||
    typeof window.gtag !== "function"
  ) {
    return;
  }

  const targetLocation = location || window.location;
  const pagePath = getPagePath(targetLocation);

  if (pagePath === lastTrackedPath) return;

  lastTrackedPath = pagePath;

  window.gtag("event", "page_view", {
    page_title: document.title,
    page_location: getPageLocation(targetLocation),
    page_path: pagePath,
    site_locale: getPathLocale(targetLocation.pathname) || BASE_LOCALE,
    browser_languages: getBrowserLanguages(),
  });
};
