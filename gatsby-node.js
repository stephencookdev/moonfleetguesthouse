const path = require("path");
const { existsSync, readdirSync, rmSync } = require("fs");
const { createFilePath } = require("gatsby-source-filesystem");
const { fetchAcceptedLocales } = require("@18ways/react");
const { init: init18ways } = require("@18ways/core/common");
const FixUpImagesPlugin = require("./webpack/fix-up-images-plugin");

const DEMO_API_KEY = "pk_dummy_demo_token";
const BASE_LOCALE = "en-GB";
const API_KEY = process.env.GATSBY_18WAYS_API_KEY || DEMO_API_KEY;
const API_URL = process.env.GATSBY_18WAYS_API_URL || undefined;
const REQUEST_ORIGIN =
  process.env.GATSBY_18WAYS_REQUEST_ORIGIN ||
  process.env.URL ||
  "http://localhost:8000";

const titleize = (value) =>
  value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const createPageTranslationContext = (name, label, filePath) => ({
  name,
  label,
  treePath: label,
  filePath,
});

const localizePath = (pagePath, locale) => {
  if (pagePath === "/") return `/${locale}/`;

  return `/${locale}${pagePath}`;
};

const getAcceptedLocales = async () => {
  init18ways({
    key: API_KEY,
    baseLocale: BASE_LOCALE,
    apiUrl: API_URL,
  });

  return fetchAcceptedLocales(BASE_LOCALE, { origin: REQUEST_ORIGIN });
};

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
      const pageContextName = fileName === "index" ? "homepage" : fileName;
      const pageLabel =
        fileName === "index" ? "Homepage" : titleize(pageContextName);
      const filePath = `src/pages/${fileName}.md`;

      return {
        path: edge.node.fields.slug,
        component,
        context: {
          id: edge.node.id,
          unlocalizedPath: edge.node.fields.slug,
          translationContext: createPageTranslationContext(
            pageContextName,
            pageLabel,
            filePath
          ),
        },
      };
    });
  });
};

exports.createPages = ({ actions, graphql }) => {
  const { createPage, createRedirect } = actions;

  return Promise.all([getPages({ graphql }), getAcceptedLocales()]).then(
    ([pages, locales]) => {
      pages.forEach((page) => {
        locales.forEach((locale) => {
          createPage({
            ...page,
            path: localizePath(page.path, locale),
            context: {
              ...page.context,
              locale,
            },
          });
        });

        createRedirect({
          fromPath: page.path,
          toPath: localizePath(page.path, BASE_LOCALE),
          isPermanent: true,
          redirectInBrowser: true,
        });

        if (page.path !== "/" && page.path.endsWith("/")) {
          createRedirect({
            fromPath: page.path.slice(0, -1),
            toPath: localizePath(page.path, BASE_LOCALE),
            isPermanent: true,
            redirectInBrowser: true,
          });
        }
      });
    }
  );
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

exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    devtool: false,
    plugins: [new FixUpImagesPlugin()],
  });
};

exports.onPostBuild = () => {
  const adminDir = path.resolve("public/admin");

  if (!existsSync(adminDir)) return;

  readdirSync(adminDir)
    .filter((file) => file.endsWith(".map"))
    .forEach((file) => rmSync(path.join(adminDir, file), { force: true }));
};
