import React from "react";
import PropTypes from "prop-types";
import { Link } from "gatsby";
import { useLocation } from "@gatsbyjs/reach-router";
import { BASE_LOCALE, getPathLocale, localizePath } from "../i18n";

const LocalizedLink = ({ to, ...props }) => {
  const location = useLocation();
  const locale = getPathLocale(location.pathname) || BASE_LOCALE;

  return <Link to={localizePath(to, locale)} {...props} />;
};

LocalizedLink.propTypes = {
  to: PropTypes.string.isRequired,
};

export default LocalizedLink;
