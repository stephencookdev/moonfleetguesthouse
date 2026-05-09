import React from "react";
import PropTypes from "prop-types";
import { graphql } from "gatsby";
import RoomRatesTemplate from "../components/page-templates/room-rates-template";

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

export const pageQuery = graphql`
  query RoomRatesQuery($id: String!) {
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
    markdownRemark(id: { eq: $id }) {
      frontmatter {
        title
        tagline
        carouselImage
        rooms {
          name
          image
          tagline
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
