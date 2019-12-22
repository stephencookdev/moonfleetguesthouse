import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'gatsby'
import Markdown from 'markdown-to-jsx';

import Layout from '../components/layout'

export const IndexPageTemplate = ({
  title,
  tagline,
  carouselImage,
  body,
}) => (
    <div>
      <h1>{title}</h1>
      <h2>{tagline}</h2>
      {carouselImage.map(src => <img key={src} src={src} alt="" />)}
      <Markdown options={{ forceBlock: true }}>{body}</Markdown>
    </div>
  )

IndexPageTemplate.propTypes = {
  title: PropTypes.string,
  tagline: PropTypes.string,
  carouselImage: PropTypes.arrayOf(PropTypes.string),
  body: PropTypes.string,
}

const IndexPage = ({ data }) => {
  const { frontmatter, rawMarkdownBody } = data.markdownRemark

  return (
    <Layout>
      <IndexPageTemplate
        body={rawMarkdownBody}
        {...frontmatter}
      />
    </Layout>
  )
}

IndexPage.propTypes = {
  data: PropTypes.shape({
    markdownRemark: PropTypes.shape({
      rawMarkdownBody: PropTypes.string,
      frontmatter: PropTypes.object,
    }),
  }),
}

export default IndexPage

export const pageQuery = graphql`
  query {
    markdownRemark {
      rawMarkdownBody
      frontmatter {
        title
        tagline
        carouselImage
      }
    }
  }
`