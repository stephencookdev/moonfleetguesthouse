import React from "react";
import PropTypes from "prop-types";
import { graphql } from "gatsby";
import GenericTemplate from "../components/page-templates/generic-template";
import Seo, {
  createBreadcrumbSchema,
  createLodgingSchema,
  createPageSeo,
} from "../components/seo";

const Generic = ({ data }) => {
  const { frontmatter } = data.markdownRemark;

  return (
    <GenericTemplate {...frontmatter} siteMetadata={data.site.siteMetadata} />
  );
};

Generic.propTypes = {
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

export default Generic;

export const Head = ({ data, pageContext }) => {
  const { frontmatter } = data.markdownRemark;
  const siteMetadata = data.site.siteMetadata;
  const seo = createPageSeo({ frontmatter, siteMetadata, pageContext });
  const isLodgingPage = ["/contact-us/", "/find-us/"].includes(
    pageContext.unlocalizedPath
  );

  return (
    <Seo
      frontmatter={frontmatter}
      siteMetadata={siteMetadata}
      pageContext={pageContext}
      structuredData={[
        isLodgingPage && createLodgingSchema({ siteMetadata }),
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
  query GenericQuery($id: String!) {
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
        sectionLayout
        sections {
          title
          image
          imageAlt
          imageCaption
          body
        }
      }
    }
  }
`;
