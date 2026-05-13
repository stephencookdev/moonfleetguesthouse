import React from "react";
import { Ways } from "@18ways/react";
import { BASE_LOCALE, getPathLocale, WAYS_ROOT_PROPS } from "./src/i18n";

export const wrapPageElement = ({ element, props }) => {
  const { availableLocales, locale, translationContext } =
    props.pageContext || {};
  const routeLocale =
    getPathLocale(props.location?.pathname) || locale || BASE_LOCALE;
  const rootProps =
    availableLocales && availableLocales.length > 0
      ? { ...WAYS_ROOT_PROPS, acceptedLocales: availableLocales }
      : WAYS_ROOT_PROPS;

  const pageElement = translationContext ? (
    <Ways context={translationContext}>{element}</Ways>
  ) : (
    element
  );

  return (
    <Ways {...rootProps} locale={routeLocale}>
      {pageElement}
    </Ways>
  );
};
