import React, { useState, Fragment } from "react";
import PropTypes from "prop-types";
import { T, Ways, useT } from "@18ways/react";
import { createFieldTranslationContext } from "../i18n";
import { useBookHref } from "./book-now";
import LocalizedLink from "./localized-link";
import * as styles from "./header.module.css";

const Nav = ({ links }) => {
  const [active, setActive] = useState(false);
  const t = useT();

  return (
    <Fragment>
      <div
        className={[styles.navContainer, active && styles.active]
          .filter(Boolean)
          .join(" ")}
      >
        <button
          className={styles.hamburger}
          aria-label={active ? t("Close navigation") : t("Open navigation")}
          onClick={() => setActive(!active)}
        />

        <nav>
          {links.map(({ title, absolute, href, highlight }) => {
            const LinkComp = absolute ? "a" : LocalizedLink;
            const hrefAttr = absolute ? "href" : "to";

            return (
              <LinkComp
                key={`${title}-${href}`}
                className={highlight ? styles.highlight : null}
                {...{ [hrefAttr]: href }}
              >
                <Ways
                  context={createFieldTranslationContext(
                    href.replaceAll("/", "") || "home",
                    title
                  )}
                >
                  <T>{title}</T>
                </Ways>
              </LinkComp>
            );
          })}
        </nav>
      </div>

      <button
        className={styles.navBlackOut}
        aria-label={t("Close navigation")}
        onClick={() => setActive(false)}
      />
    </Fragment>
  );
};

Nav.propTypes = {
  links: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const Header = ({ siteMetadata, floatHeader = false }) => {
  const { title, mainNav, telephone, email } = siteMetadata;
  const bookHref = useBookHref(telephone, email);

  return (
    <header
      className={[styles.header, floatHeader && styles.float]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.headerInner}>
        <h1>
          <LocalizedLink to="/">{title}</LocalizedLink>
        </h1>

        <Ways
          context={createFieldTranslationContext("navigation", "Navigation")}
        >
          <Nav
            links={[
              ...mainNav,
              {
                href: bookHref,
                title: "Book",
                highlight: true,
                absolute: true,
              },
            ]}
          />
        </Ways>
      </div>
    </header>
  );
};

Header.propTypes = {
  siteMetadata: PropTypes.shape({
    title: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    telephone: PropTypes.string.isRequired,
    mainNav: PropTypes.arrayOf(PropTypes.object).isRequired,
  }).isRequired,
  floatHeader: PropTypes.bool,
};

export default Header;
