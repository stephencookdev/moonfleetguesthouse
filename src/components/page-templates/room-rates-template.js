import React from "react";
import PropTypes from "prop-types";
import Markdown from "markdown-to-jsx";
import BookNow from "../book-now";
import Layout from "../layout";
import { toThumbnailSrc } from "../../utils/image-paths";
import * as styles from "../../templates/room-rates.module.css";

const Room = ({
  name,
  telephone,
  email,
  image,
  normalPrice,
  saturdayPrice,
  tagline,
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
    <img src={toThumbnailSrc(image)} alt="" loading="lazy" decoding="async" />
    <BookNow telephone={telephone} email={email} className={styles.cta}>
      Book Now
    </BookNow>
  </div>
);

Room.propTypes = {
  name: PropTypes.string,
  image: PropTypes.string,
  normalPrice: PropTypes.string,
  saturdayPrice: PropTypes.string,
  tagline: PropTypes.string,
  telephone: PropTypes.string,
  email: PropTypes.string,
};

const RoomRatesTemplate = ({
  siteMetadata,
  tagline,
  rooms,
  roomsExtra,
  extraSections,
}) => (
  <Layout siteMetadata={siteMetadata}>
    <p className={styles.tagline}>{tagline}</p>

    <div>
      {rooms.map((room) => (
        <Room
          key={room.name}
          telephone={siteMetadata.telephone}
          email={siteMetadata.email}
          {...room}
        />
      ))}
    </div>

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

export default RoomRatesTemplate;
