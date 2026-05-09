import React from "react";
import PropTypes from "prop-types";
import { graphql } from "gatsby";
import VisitorsCommentsTemplate from "../components/page-templates/visitors-comments-template";

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
        mainNav: PropTypes.arrayOf(PropTypes.object).isRequired,
      }).isRequired,
    }).isRequired,
    markdownRemark: PropTypes.shape({
      frontmatter: PropTypes.object,
    }),
  }),
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
