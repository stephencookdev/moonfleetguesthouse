const path = require("path");
const { existsSync } = require("fs");
const { createFilePath } = require("gatsby-source-filesystem");

const getPages = ({ graphql }) => {
  return graphql(`
    {
      allMarkdownRemark(limit: 1000) {
        edges {
          node {
            id
            fileAbsolutePath
            fields {
              slug
            }
          }
        }
      }
    }
  `).then((result) => {
    if (result.errors) {
      result.errors.forEach((e) => console.error(e.toString()));
      return Promise.reject(result.errors);
    }

    const posts = result.data.allMarkdownRemark.edges;

    return posts.map((edge) => {
      const fileName = path.basename(edge.node.fileAbsolutePath, ".md");
      const templatePath = path.resolve(`src/templates/${fileName}.js`);
      const component = existsSync(templatePath)
        ? templatePath
        : path.resolve("src/templates/generic.js");

      return {
        path: edge.node.fields.slug,
        component,
        // additional data can be passed via context
        context: {
          id: edge.node.id,
        },
      };
    });
  });
};

exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions;

  return getPages({ graphql }).then((pages) => {
    pages.forEach((page) => {
      createPage(page);
    });
  });
};

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode });
    createNodeField({
      name: `slug`,
      node,
      value,
    });
  }
};
