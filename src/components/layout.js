/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react";
import Helmet from "react-helmet";
import PropTypes from "prop-types";
import { Link } from "gatsby";
import Header from "./header";
import BookNow from "./book-now";
import "react-image-gallery/styles/css/image-gallery.css";
import * as styles from "./layout.module.css";

const Layout = ({ floatHeader, siteMetadata, children }) => {
  const { title, email, telephone, mainNav } = siteMetadata;

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <link
          href="https://fonts.googleapis.com/css?family=Cardo:400,700|Josefin+Sans:300,400&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      <Header floatHeader={floatHeader} siteMetadata={siteMetadata} />

      <main className={styles.main}>{children}</main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <nav className={styles.nav}>
            <Link to="/">Home</Link>
            {mainNav.map(({ href, title }) => (
              <Link to={href} key={href}>
                {title}
              </Link>
            ))}
          </nav>

          <div className={styles.footerContent}>
            <p>{title}</p>
            <p>
              <a href={`tel:${telephone}`}>{telephone}</a>
            </p>
            <p>
              <a href={`mailto:${email}`}>{email}</a>
            </p>

            <Link to="/room-rates/" className={styles.cta}>
              Book Now
            </Link>
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

Layout.defaultProps = {
  floatHeader: false,
};

export default Layout;
