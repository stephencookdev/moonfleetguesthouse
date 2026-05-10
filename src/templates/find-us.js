import React from "react";
import PropTypes from "prop-types";
import { graphql } from "gatsby";
import FindUsTemplate from "../components/page-templates/find-us-template";
import Seo, {
  createBreadcrumbSchema,
  createLodgingSchema,
  createPageSeo,
} from "../components/seo";

const FindUs = ({ data }) => {
  const { frontmatter } = data.markdownRemark;

  return (
    <FindUsTemplate {...frontmatter} siteMetadata={data.site.siteMetadata} />
  );
};

FindUs.propTypes = {
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

export default FindUs;

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
        createLodgingSchema({ siteMetadata }),
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
  query FindUsQuery($id: String!) {
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
        preMapSections {
          title
          body
          image
          imageAlt
          imageCaption
        }
        googleMapsIframeSrc
        postMapSections {
          title
          body
          image
          imageAlt
          imageCaption
        }
      }
    }
  }
`;
