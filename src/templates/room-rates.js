import React from "react";
import PropTypes from "prop-types";
import { graphql } from "gatsby";
import Markdown from "markdown-to-jsx";
import Layout from "../components/layout";
import styles from "./room-rates.module.css";

const Room = ({
  name,
  telephone,
  image,
  normalPrice,
  saturdayPrice,
  tagline
}) => (
  <div key={name} className={styles.room}>
    <h2>{name}</h2>
    <p className={styles.description}>{tagline}</p>
    <p>
      Sun-Fri inc. Breakfast <span className={styles.price}>{normalPrice}</span>
    </p>
    <p>
      Saturday inc. Breakfast{" "}
      <span className={styles.price}>{saturdayPrice}</span>
    </p>
    <img src={image} alt="" />
    <a href={`tel:${telephone}`} className={styles.cta}>
      Book Now
    </a>
  </div>
);

Room.propTypes = {
  name: PropTypes.string,
  image: PropTypes.string,
  normalPrice: PropTypes.string,
  saturdayPrice: PropTypes.string,
  tagline: PropTypes.string,
  telephone: PropTypes.string
};

export const RoomRatesTemplate = ({
  title,
  tagline,
  telephone,
  rooms,
  roomsExtra,
  extraSections
}) => (
  <>
    <p className={styles.tagline}>{tagline}</p>

    <div>
      {rooms.map(room => (
        <Room key={room.name} telephone={telephone} {...room} />
      ))}
    </div>

    <Markdown options={{ forceBlock: true }}>{roomsExtra}</Markdown>

    {extraSections.map(({ title, body }) => (
      <div key={title} className={styles.roomSection}>
        <h3>{title}</h3>
        <Markdown options={{ forceBlock: true }}>{body}</Markdown>
      </div>
    ))}
  </>
);

RoomRatesTemplate.propTypes = {
  title: PropTypes.string,
  tagline: PropTypes.string,
  rooms: PropTypes.arrayOf(PropTypes.object),
  roomsExtra: PropTypes.string,
  extraSections: PropTypes.arrayOf(PropTypes.object)
};

const RoomRates = ({ data }) => {
  const { frontmatter } = data.markdownRemark;
  const { telephone } = data.site.siteMetadata;

  return (
    <Layout>
      <RoomRatesTemplate telephone={telephone} {...frontmatter} />
    </Layout>
  );
};

RoomRates.propTypes = {
  data: PropTypes.shape({
    markdownRemark: PropTypes.shape({
      frontmatter: PropTypes.object
    })
  })
};

export default RoomRates;

export const pageQuery = graphql`
  query RoomRatesQuery($id: String!) {
    site {
      siteMetadata {
        telephone
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
