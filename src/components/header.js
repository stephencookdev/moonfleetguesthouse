import { useStaticQuery, graphql, Link } from "gatsby";
import PropTypes from "prop-types";
import React, { useState } from "react";
import styles from "./header.module.css";

const Nav = ({ links }) => {
  const [active, setActive] = useState(false);

  return (
    <div
      className={[styles.navContainer, active && styles.active]
        .filter(Boolean)
        .join(" ")}
    >
      <button className={styles.hamburger} onClick={() => setActive(!active)} />

      <nav>
        {links.map(({ title, href, highlight }) => (
          <Link
            key={href}
            to={href}
            className={highlight ? styles.highlight : null}
          >
            {title}
          </Link>
        ))}
      </nav>
    </div>
  );
};

Nav.propTypes = {
  links: PropTypes.arrayOf(PropTypes.object).isRequired
};

const Header = ({ floatHeader }) => {
  const data = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          title
          telephone
          mainNav {
            href
            title
          }
        }
      }
    }
  `);

  const { title, telephone, mainNav } = data.site.siteMetadata;

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
            { href: `tel:${telephone}`, title: "Book", highlight: true }
          ]}
        />
      </div>
    </header>
  );
};

Header.propTypes = {
  floatHeader: PropTypes.bool
};

Header.defaultProps = {
  floatHeader: false
};

export default Header;
