import React from "react";
import PropTypes from "prop-types";
import { graphql } from "gatsby";
import RoomRatesTemplate from "../components/page-templates/room-rates-template";
import Seo, { createBreadcrumbSchema, createPageSeo } from "../components/seo";

const RoomRates = ({ data }) => {
  const { frontmatter } = data.markdownRemark;

  return (
    <RoomRatesTemplate {...frontmatter} siteMetadata={data.site.siteMetadata} />
  );
};

RoomRates.propTypes = {
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

export default RoomRates;

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
  query RoomRatesQuery($id: String!) {
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
        tagline
        carouselImage
        seoTitle
        seoDescription
        canonicalPath
        featuredImage
        featuredImageAlt
        rooms {
          name
          image
          imageAlt
          tagline
          shortDescription
          amenities
          normalPrice
          saturdayPrice
        }
        roomsExtra
        extraSections {
          title
          body
        }
      }
    }
  }
`;
