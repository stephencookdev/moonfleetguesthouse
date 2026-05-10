import React from "react";
import PropTypes from "prop-types";
import { graphql } from "gatsby";
import VisitorsCommentsTemplate from "../components/page-templates/visitors-comments-template";
import Seo, { createBreadcrumbSchema, createPageSeo } from "../components/seo";

const VisitorsComments = ({ data }) => {
  const { frontmatter } = data.markdownRemark;

  return (
    <VisitorsCommentsTemplate
      {...frontmatter}
      siteMetadata={data.site.siteMetadata}
    />
  );
};

VisitorsComments.propTypes = {
  data: PropTypes.shape({
    site: PropTypes.shape({
      siteMetadata: PropTypes.shape({
        title: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        telephone: PropTypes.string.isRequired,
        mainNav: PropTypes.arrayOf(PropTypes.object).isRequired,
      }).isRequired,
    }).isRequired,
    markdownRemark: PropTypes.shape({
      frontmatter: PropTypes.object,
    }),
  }),
};

export default VisitorsComments;

export const Head = ({ data, pageContext }) => {
  const { frontmatter } = data.markdownRemark;
  const siteMetadata = data.site.siteMetadata;
  const seo = createPageSeo({ frontmatter, siteMetadata, pageContext });

  return (
    <Seo
      frontmatter={frontmatter}
      siteMetadata={siteMetadata}
      pageContext={pageContext}
      structuredData={[
        createBreadcrumbSchema({
          siteMetadata,
          pageContext,
          title: seo.title,
        }),
      ]}
    />
  );
};

export const pageQuery = graphql`
  query VisitorsCommentsQuery($id: String!) {
    site {
      siteMetadata {
        title
        siteUrl
        defaultDescription
        defaultImage
        email
        telephone
        priceRange
        address {
          streetAddress
          addressLocality
          addressRegion
          postalCode
          addressCountry
        }
        sameAs
        amenities
        mainNav {
          href
          title
        }
      }
    }
    markdownRemark(id: { eq: $id }) {
      frontmatter {
        title
        seoTitle
        seoDescription
        canonicalPath
        featuredImage
        featuredImageAlt
        tripAdvisorComRating
        bookingComRating
      }
    }
  }
`;
