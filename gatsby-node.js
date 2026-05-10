const path = require("path");
const { existsSync, readdirSync, rmSync, writeFileSync } = require("fs");
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
let acceptedLocalesPromise;

const normalizeAvailableLocales = (locales) => {
  const availableLocales = Array.isArray(locales)
    ? locales.filter(Boolean)
    : [];

  if (!availableLocales.includes(BASE_LOCALE)) {
    availableLocales.unshift(BASE_LOCALE);
  }

  return Array.from(new Set(availableLocales));
};

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
  if (!acceptedLocalesPromise) {
    acceptedLocalesPromise = (async () => {
      init18ways({
        key: API_KEY,
        baseLocale: BASE_LOCALE,
        apiUrl: API_URL,
      });

      const locales = await fetchAcceptedLocales(BASE_LOCALE, {
        origin: REQUEST_ORIGIN,
      });

      return normalizeAvailableLocales(locales);
    })();
  }

  return acceptedLocalesPromise;
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
      const filePath = path.relative(process.cwd(), edge.node.fileAbsolutePath);

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

exports.createPages = async ({ actions, graphql }) => {
  const { createPage, createRedirect } = actions;
  const availableLocales = await getAcceptedLocales();
  const pages = await getPages({ graphql });

  pages.forEach((page) => {
    availableLocales.forEach((locale) => {
      createPage({
        ...page,
        path: localizePath(page.path, locale),
        context: {
          ...page.context,
          locale,
          availableLocales,
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

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;

  createTypes(`
    type MarkdownRemarkFrontmatter @infer {
      title: String
      seoTitle: String
      seoDescription: String
      canonicalPath: String
      featuredImage: String
      featuredImageAlt: String
      sectionLayout: String
      sections: [MarkdownRemarkFrontmatterSections]
      preMapSections: [MarkdownRemarkFrontmatterPreMapSections]
      postMapSections: [MarkdownRemarkFrontmatterPostMapSections]
      images: [MarkdownRemarkFrontmatterImages]
      rooms: [MarkdownRemarkFrontmatterRooms]
    }

    type MarkdownRemarkFrontmatterSections @infer {
      title: String
      image: String
      imageAlt: String
      imageCaption: String
      body: String
    }

    type MarkdownRemarkFrontmatterPreMapSections @infer {
      title: String
      image: String
      imageAlt: String
      imageCaption: String
      body: String
    }

    type MarkdownRemarkFrontmatterPostMapSections @infer {
      title: String
      image: String
      imageAlt: String
      imageCaption: String
      body: String
    }

    type MarkdownRemarkFrontmatterImages @infer {
      image: String
      alt: String
      caption: String
    }

    type MarkdownRemarkFrontmatterRooms @infer {
      name: String
      image: String
      imageAlt: String
      tagline: String
      shortDescription: String
      amenities: [String]
      normalPrice: String
      saturdayPrice: String
    }
  `);
};

exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    devtool: false,
    plugins: [new FixUpImagesPlugin()],
  });
};

exports.onPostBuild = async ({ graphql }) => {
  const adminDir = path.resolve("public/admin");

  if (existsSync(adminDir)) {
    readdirSync(adminDir)
      .filter((file) => file.endsWith(".map"))
      .forEach((file) => rmSync(path.join(adminDir, file), { force: true }));
  }

  const result = await graphql(`
    {
      site {
        siteMetadata {
          siteUrl
        }
      }
      allMarkdownRemark(limit: 1000) {
        nodes {
          fields {
            slug
          }
        }
      }
    }
  `);

  if (result.errors) {
    result.errors.forEach((e) => console.error(e.toString()));
    return;
  }

  const siteUrl = result.data.site.siteMetadata.siteUrl.replace(/\/$/, "");
  const availableLocales = await getAcceptedLocales();
  const urls = result.data.allMarkdownRemark.nodes.flatMap(({ fields }) =>
    availableLocales.map(
      (locale) => `${siteUrl}${localizePath(fields.slug, locale)}`
    )
  );
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((url) => `  <url><loc>${url}</loc></url>`)
    .join("\n")}\n</urlset>\n`;

  writeFileSync(path.resolve("public/sitemap.xml"), sitemap);
  writeFileSync(
    path.resolve("public/robots.txt"),
    `User-agent: *\nDisallow: /admin/\nSitemap: ${siteUrl}/sitemap.xml\n`
  );
};
