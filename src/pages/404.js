import React from "react";
import { useStaticQuery, graphql } from "gatsby";

import Layout from "../components/layout";

const NotFoundPage = () => {
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

  return (
    <Layout siteMetadata={data.site.siteMetadata}>
      <h1>NOT FOUND</h1>
      <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
    </Layout>
  );
};

export default NotFoundPage;
