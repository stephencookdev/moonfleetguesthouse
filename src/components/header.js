import React, { useState, Fragment } from "react";
import PropTypes from "prop-types";
import { Link } from "gatsby";
import styles from "./header.module.css";

const Nav = ({ links }) => {
  const [active, setActive] = useState(false);

  return (
    <Fragment>
      <div
        className={[styles.navContainer, active && styles.active]
          .filter(Boolean)
          .join(" ")}
      >
        <button
          className={styles.hamburger}
          onClick={() => setActive(!active)}
        />

        <nav>
          {links.map(({ title, absolute, href, highlight }) => {
            const LinkComp = absolute ? "a" : Link;
            const hrefAttr = absolute ? "href" : "to";

            return (
              <LinkComp
                key={`${title}-${href}`}
                className={highlight ? styles.highlight : null}
                {...{ [hrefAttr]: href }}
              >
                {title}
              </LinkComp>
            );
          })}
        </nav>
      </div>

      <div className={styles.navBlackOut} onClick={() => setActive(false)} />
    </Fragment>
  );
};

Nav.propTypes = {
  links: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const Header = ({ siteMetadata, floatHeader }) => {
  const { title, mainNav } = siteMetadata;

  return (
    <header
      className={[styles.header, floatHeader && styles.float]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.headerInner}>
        <h1>
          <Link to="/">{title}</Link>
        </h1>

        <Nav
          links={[
            ...mainNav,
            {
              href: "/room-rates/",
              title: "Book",
              highlight: true,
              absolute: true,
            },
          ]}
        />
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

Header.defaultProps = {
  floatHeader: false,
};

export default Header;
