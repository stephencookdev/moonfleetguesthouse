import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'gatsby'
import Markdown from 'markdown-to-jsx';

import Layout from '../components/layout'

export const IndexPageTemplate = ({
  title,
  tagline,
  carousel,
  body,
}) => (
  <div>
      <h1>{title}</h1>
      <h2>{tagline}</h2>
      <Markdown options={{ forceBlock: true }}>{body}</Markdown>
  </div>
)

IndexPageTemplate.propTypes = {
  title: PropTypes.string,
  tagline: PropTypes.string,
  carousel: PropTypes.arrayOf(PropTypes.shape({ image: PropTypes.string })),
  description: PropTypes.string,
}

const IndexPage = ({ data }) => {
  const { frontmatter } = data.markdownRemark

  return (
    <Layout>
      <IndexPageTemplate
        {...frontmatter}
      />
    </Layout>
  )
}

IndexPage.propTypes = {
  data: PropTypes.shape({
    markdownRemark: PropTypes.shape({
      frontmatter: PropTypes.object,
    }),
  }),
}

export default IndexPage

export const pageQuery = graphql`
  query {
    markdownRemark {
      frontmatter {
        title
        tagline
        body
      }
    }
  }
`