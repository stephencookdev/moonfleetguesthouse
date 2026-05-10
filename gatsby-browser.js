import React from "react";
import { Ways } from "@18ways/react";
import { BASE_LOCALE, getPathLocale, WAYS_ROOT_PROPS } from "./src/i18n";

export const wrapPageElement = ({ element, props }) => {
  const { locale, translationContext } = props.pageContext || {};
  const routeLocale =
    getPathLocale(props.location?.pathname) || locale || BASE_LOCALE;

  const pageElement = translationContext ? (
    <Ways context={translationContext}>{element}</Ways>
  ) : (
    element
  );

  return (
    <Ways {...WAYS_ROOT_PROPS} locale={routeLocale}>
      {pageElement}
    </Ways>
  );
};
