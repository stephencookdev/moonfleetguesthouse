import { useStaticQuery, graphql, Link } from "gatsby";
import PropTypes from "prop-types";
import React from "react";
import styles from "./header.module.css";

const Nav = ({ links }) => (
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
);

Nav.propTypes = {
  links: PropTypes.arrayOf(PropTypes.object).isRequired
};

const Header = ({ siteTitle, location }) => {
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
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <h1>
          <Link to="/">{title}</Link>
        </h1>

        <Nav
          location={location}
          links={[
            ...mainNav,
            { href: `tel:${telephone}`, title: "Book", highlight: true }
          ]}
        />
      </div>
    </header>
  );
};

export default Header;
