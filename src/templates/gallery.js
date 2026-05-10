import React from "react";
import PropTypes from "prop-types";
import { graphql } from "gatsby";
import GalleryTemplate from "../components/page-templates/gallery-template";
import Seo, { createBreadcrumbSchema, createPageSeo } from "../components/seo";

const Gallery = ({ data }) => {
  const { frontmatter } = data.markdownRemark;

  return (
    <GalleryTemplate {...frontmatter} siteMetadata={data.site.siteMetadata} />
  );
};

Gallery.propTypes = {
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

export default Gallery;

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
  query GalleryQuery($id: String!) {
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
        images {
          image
          alt
          caption
        }
      }
    }
  }
`;
