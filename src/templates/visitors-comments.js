import React from "react";
import PropTypes from "prop-types";
import { graphql } from "gatsby";
import Layout from "../components/layout";
import styles from "./visitors-comments.module.css";

const Circles = ({ count }) => {
  const fullCircles = Math.floor(count);
  const halfCircles = Math.floor(count) === count ? 0 : 1;

  return (
    <div className={styles.circleContainer}>
      {new Array(5).fill().map((_, i) => (
        <div
          key={i}
          className={
            i < fullCircles
              ? styles.fullCircle
              : i < fullCircles + halfCircles
              ? styles.halfCircle
              : styles.emptyCircle
          }
        />
      ))}
    </div>
  );
};

export const VisitorsCommentsTemplate = ({
  siteMetadata,
  tripAdvisorComRating,
  bookingComRating
}) => {
  return (
    <Layout siteMetadata={siteMetadata}>
      <div className={styles.container}>
        <div className={styles.containerCell}>
          <a
            href="https://www.tripadvisor.co.uk/Hotel_Review-g2312120-d7381138-Reviews-Moonfleet-Skinningrove_North_Yorkshire_England.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Circles count={Number.parseFloat(tripAdvisorComRating)} />

            <span className={styles.title}>
              {tripAdvisorComRating} on TripAdvisor
            </span>
          </a>
        </div>
        <div className={styles.containerCell}>
          <a
            href="https://www.booking.com/hotel/gb/moonfleet-loftus.en-gb.html?aid=356980;label=gog235jc-1DCAQoggJCDWNpdHlfLTI2MDE4NTlIM1gDaFCIAQGYAQm4AQfIAQzYAQPoAQH4AQOIAgGoAgO4Avy0n_AFwAIB;sid=6a9feb42c6b5115e4b46db1bec45240c;dest_id=-2601859;dest_type=city;dist=0;group_adults=2;group_children=0;hapos=5;hpos=5;no_rooms=1;room1=A%2CA;sb_price_type=total;sr_order=popularity;srepoch=1577572988;srpvid=59c59fbe72ed001b;type=total;ucfs=1&"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className={styles.bookingCom}>{bookingComRating}</div>

            <span className={styles.title}>
              {bookingComRating} on Booking.com
            </span>
          </a>
        </div>
      </div>
    </Layout>
  );
};

VisitorsCommentsTemplate.propTypes = {
  siteMetadata: PropTypes.object.isRequired,
  tripAdvisorComRating: PropTypes.string.isRequired,
  bookingComRating: PropTypes.string.isRequired
};

const VisitorsComments = ({ data }) => {
  const { frontmatter } = data.markdownRemark;

  return (
    <VisitorsCommentsTemplate
      {...frontmatter}
      siteMetadata={data.site.siteMetadata}
    />
  );
};

VisitorsComments.propTypes = {
  data: PropTypes.shape({
    site: PropTypes.shape({
      siteMetadata: PropTypes.shape({
        title: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        telephone: PropTypes.string.isRequired,
        mainNav: PropTypes.arrayOf(PropTypes.object).isRequired
      }).isRequired
    }).isRequired,
    markdownRemark: PropTypes.shape({
      frontmatter: PropTypes.object
    })
  })
};

export default VisitorsComments;

export const pageQuery = graphql`
  query VisitorsCommentsQuery($id: String!) {
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
        tripAdvisorComRating
        bookingComRating
      }
    }
  }
`;
