import React from "react";
import PropTypes from "prop-types";
import { graphql } from "gatsby";
import Markdown from "markdown-to-jsx";
import Layout from "../components/layout";
import AvailableRoomPicker from "../components/available-room-picker";
import * as styles from "./room-rates.module.css";

export const RoomRatesTemplate = ({
  siteMetadata,
  tagline,
  rooms,
  roomsExtra,
  extraSections,
}) => (
  <Layout siteMetadata={siteMetadata}>
    <p className={styles.tagline}>{tagline}</p>

    <AvailableRoomPicker allRooms={rooms} />

    <Markdown options={{ forceBlock: true }}>{roomsExtra}</Markdown>

    {extraSections.map(({ title, body }) => (
      <div key={title} className={styles.roomSection}>
        <h3>{title}</h3>
        <Markdown options={{ forceBlock: true }}>{body}</Markdown>
      </div>
    ))}
  </Layout>
);

RoomRatesTemplate.propTypes = {
  siteMetadata: PropTypes.object.isRequired,
  title: PropTypes.string,
  tagline: PropTypes.string,
  rooms: PropTypes.arrayOf(PropTypes.object),
  roomsExtra: PropTypes.string,
  extraSections: PropTypes.arrayOf(PropTypes.object),
};

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
