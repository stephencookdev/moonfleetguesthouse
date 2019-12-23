/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from "react";
import Helmet from "react-helmet";
import PropTypes from "prop-types";
import { useStaticQuery, graphql, Link } from "gatsby";
import Header from "./header";
import "react-image-gallery/styles/css/image-gallery.css";
import styles from "./layout.module.css";

const Layout = ({ children }) => {
  const data = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          title
          email
          telephone
          mainNav {
            href
            title
          }
        }
      }
    }
  `);

  const { title, email, telephone, mainNav } = data.site.siteMetadata;

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <link
          href="https://fonts.googleapis.com/css?family=Cardo|Josefin+Sans:300,400&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      <Header />

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

            <a className={styles.cta} href={`tel:${telephone}`}>
              Book Now
            </a>
          </div>
        </div>
      </footer>
    </>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired
};

export default Layout;
