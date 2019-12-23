import React from "react";
import PropTypes from "prop-types";
import { graphql } from "gatsby";
import Markdown from "markdown-to-jsx";

import Layout from "../components/layout";

export const RoomRatesTemplate = ({
  title,
  tagline,
  carouselImage,
  rooms,
  roomsExtra,
  extraSections
}) => (
  <div>
    <h1>{title}</h1>
    <h2>{tagline}</h2>
    {carouselImage.map(src => (
      <img key={src} src={src} alt="" />
    ))}
    {rooms.map(({ name, normalPrice, saturdayPrice, tagline }) => (
      <div key={name}>
        <h3>{name}</h3>
        <p>{tagline}</p>
        <p>
          {normalPrice} / {saturdayPrice}
        </p>
      </div>
    ))}
    <Markdown options={{ forceBlock: true }}>{roomsExtra}</Markdown>
    {extraSections.map(({ title, body }) => (
      <div key={title}>
        <h3>{title}</h3>
        <Markdown options={{ forceBlock: true }}>{body}</Markdown>
      </div>
    ))}
  </div>
);

RoomRatesTemplate.propTypes = {
  title: PropTypes.string,
  tagline: PropTypes.string,
  carouselImage: PropTypes.arrayOf(PropTypes.string),
  rooms: PropTypes.arrayOf(PropTypes.object),
  roomsExtra: PropTypes.string,
  extraSections: PropTypes.arrayOf(PropTypes.object)
};

const RoomRates = ({ data }) => {
  const { frontmatter } = data.markdownRemark;

  console.log(frontmatter);

  return (
    <Layout>
      <RoomRatesTemplate {...frontmatter} />
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
    markdownRemark(id: { eq: $id }) {
      frontmatter {
        title
        tagline
        carouselImage
        rooms {
          name
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
