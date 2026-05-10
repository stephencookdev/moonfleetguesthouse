import React from "react";
import PropTypes from "prop-types";
import { navigate } from "gatsby";
import {
  T,
  Ways,
  useAcceptedLocales,
  useCurrentLocale,
  useT,
} from "@18ways/react";
import BookNow from "../components/book-now";
import { createFieldTranslationContext, localizePath } from "../i18n";
import Header from "./header";
import LocalizedLink from "./localized-link";
import * as styles from "./layout.module.css";

const PRIVATE_USE_VARIANT_LABELS = {
  caesar: "Caesar Shift",
};

const formatDisplayLocaleName = (locale) => {
  try {
    const displayNames = new Intl.DisplayNames([locale, "en"], {
      type: "language",
    });
    const name = displayNames.of(locale);
    return name && name !== locale ? `${name} (${locale})` : locale;
  } catch {
    return locale;
  }
};

const formatLocaleName = (locale) => {
  const privateUseMatch = locale.match(/^(.+)-x-([a-z0-9-]+)$/i);

  if (privateUseMatch) {
    const [, baseLocale, variant] = privateUseMatch;
    const variantLabel = PRIVATE_USE_VARIANT_LABELS[variant.toLowerCase()];

    if (variantLabel) {
      return variantLabel;
    }
  }

  return formatDisplayLocaleName(locale);
};

const PathLanguageSwitcher = () => {
  const acceptedLocales = useAcceptedLocales();
  const currentLocale = useCurrentLocale();
  const t = useT({ suspend: false });

  const handleLocaleChange = (nextLocale) => {
    if (typeof window === "undefined") return;

    const nextPath = localizePath(window.location.pathname, nextLocale);
    navigate(`${nextPath}${window.location.search}${window.location.hash}`);
  };

  if (acceptedLocales.length < 2) return null;

  return (
    <select
      aria-label={t("Select language")}
      className={styles.languageSelector}
      onChange={(event) => handleLocaleChange(event.target.value)}
      value={currentLocale}
    >
      {acceptedLocales.map((locale) => (
        <option key={locale} title={locale} value={locale}>
          {formatLocaleName(locale)}
        </option>
      ))}
    </select>
  );
};

const Layout = ({ floatHeader = false, siteMetadata, children }) => {
  const { title, email, telephone, mainNav } = siteMetadata;

  return (
    <>
      <Header floatHeader={floatHeader} siteMetadata={siteMetadata} />

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <nav className={styles.nav}>
            <Ways
              context={createFieldTranslationContext(
                "navigation",
                "Navigation"
              )}
            >
              <LocalizedLink to="/">
                <Ways context={createFieldTranslationContext("home", "Home")}>
                  <T>Home</T>
                </Ways>
              </LocalizedLink>
              {mainNav.map(({ href, title }) => (
                <LocalizedLink to={href} key={href}>
                  <Ways
                    context={createFieldTranslationContext(
                      href.replaceAll("/", "") || "home",
                      title
                    )}
                  >
                    <T>{title}</T>
                  </Ways>
                </LocalizedLink>
              ))}
            </Ways>
          </nav>

          <div className={styles.footerContent}>
            <p>{title}</p>
            <p>
              <a href={`tel:${telephone}`}>{telephone}</a>
            </p>
            <p>
              <a href={`mailto:${email}`}>{email}</a>
            </p>

            <BookNow
              telephone={siteMetadata.telephone}
              email={siteMetadata.email}
              className={styles.cta}
            >
              <Ways
                context={createFieldTranslationContext(
                  "booking.cta",
                  "Booking CTA"
                )}
              >
                <T>Book Now</T>
              </Ways>
            </BookNow>

            <PathLanguageSwitcher />
          </div>
        </div>
      </footer>
    </>
  );
};

Layout.propTypes = {
  floatHeader: PropTypes.bool,
  siteMetadata: PropTypes.shape({
    title: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    telephone: PropTypes.string.isRequired,
    mainNav: PropTypes.arrayOf(PropTypes.object).isRequired,
  }).isRequired,
  children: PropTypes.node.isRequired,
};

export default Layout;
