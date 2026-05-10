import React from "react";
import PropTypes from "prop-types";
import { T, Ways } from "@18ways/react";
import { createFieldTranslationContext } from "../../i18n";
import BookNow from "../book-now";
import Layout from "../layout";
import TranslatedMarkdown from "../translated-markdown";
import { toThumbnailSrc } from "../../utils/image-paths";
import * as styles from "../../templates/room-rates.module.css";

const Room = ({
  name,
  telephone,
  email,
  image,
  imageAlt,
  normalPrice,
  saturdayPrice,
  tagline,
  shortDescription,
  amenities,
}) => (
  <Ways context="room">
    <div key={name} className={styles.room}>
      <h2>
        <T fixed>{name}</T>
      </h2>
      <p className={styles.description}>
        <T>{tagline}</T>
      </p>
      {shortDescription && (
        <p className={styles.shortDescription}>
          <T>{shortDescription}</T>
        </p>
      )}
      {amenities?.length > 0 && (
        <ul className={styles.amenities}>
          {amenities.map((amenity) => (
            <li key={amenity}>
              <T>{amenity}</T>
            </li>
          ))}
        </ul>
      )}
      <p>
        <T>
          <>
            Sun-Fri inc. Breakfast{" "}
            <span className={styles.price}>{normalPrice}</span>
          </>
        </T>
      </p>
      <p>
        <T>
          <>
            Saturday inc. Breakfast{" "}
            <span className={styles.price}>{saturdayPrice}</span>
          </>
        </T>
      </p>
      <img
        src={toThumbnailSrc(image)}
        alt={imageAlt || ""}
        loading="lazy"
        decoding="async"
      />
      <BookNow telephone={telephone} email={email} className={styles.cta}>
        <T>Book Now</T>
      </BookNow>
    </div>
  </Ways>
);

Room.propTypes = {
  name: PropTypes.string,
  image: PropTypes.string,
  imageAlt: PropTypes.string,
  normalPrice: PropTypes.string,
  saturdayPrice: PropTypes.string,
  tagline: PropTypes.string,
  shortDescription: PropTypes.string,
  amenities: PropTypes.arrayOf(PropTypes.string),
  telephone: PropTypes.string,
  email: PropTypes.string,
};

const RoomRatesTemplate = ({
  siteMetadata,
  title,
  tagline,
  rooms,
  roomsExtra,
  extraSections,
}) => (
  <Layout siteMetadata={siteMetadata}>
    <h1>
      <Ways context={createFieldTranslationContext("title", "Title")}>
        <T>{title}</T>
      </Ways>
    </h1>

    <p className={styles.tagline}>
      <Ways context={createFieldTranslationContext("tagline", "Tagline")}>
        <T>{tagline}</T>
      </Ways>
    </p>

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

    <Ways context={createFieldTranslationContext("roomsExtra", "Rooms extra")}>
      <TranslatedMarkdown>{roomsExtra}</TranslatedMarkdown>
    </Ways>

    {extraSections.map(({ title, body }, index) => (
      <Ways
        key={title}
        context={{
          name: `extraSections.${index + 1}`,
          label: title,
          treePath: `Extra sections > ${title}`,
        }}
      >
        <div key={title} className={styles.roomSection}>
          <h3>
            <Ways context={createFieldTranslationContext("title", "Title")}>
              <T>{title}</T>
            </Ways>
          </h3>
          <Ways context={createFieldTranslationContext("body", "Body")}>
            <TranslatedMarkdown>{body}</TranslatedMarkdown>
          </Ways>
        </div>
      </Ways>
    ))}
  </Layout>
);

RoomRatesTemplate.propTypes = {
  siteMetadata: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  tagline: PropTypes.string,
  rooms: PropTypes.arrayOf(PropTypes.object),
  roomsExtra: PropTypes.string,
  extraSections: PropTypes.arrayOf(PropTypes.object),
};

export default RoomRatesTemplate;
