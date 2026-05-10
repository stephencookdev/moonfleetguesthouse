const path = require("path");
const { existsSync, readdirSync, rmSync, writeFileSync } = require("fs");
const { createFilePath } = require("gatsby-source-filesystem");
const { fetchAcceptedLocales } = require("@18ways/react");
const {
  fetchTranslations,
  generateHashId,
  init: init18ways,
} = require("@18ways/core/common");
const { decryptTranslationValue } = require("@18ways/core/crypto");
const FixUpImagesPlugin = require("./webpack/fix-up-images-plugin");

const DEMO_API_KEY = "pk_dummy_demo_token";
const BASE_LOCALE = "en-GB";
const ROOT_TRANSLATION_CONTEXT = {
  name: "moonfleet",
  label: "Moonfleet Guesthouse",
  treePath: "Moonfleet Guesthouse",
  filePath: "",
};
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

const createFieldTranslationContext = (name, label = name) => ({
  name,
  label,
  treePath: label,
  filePath: "",
});

const combineTranslationContext = (parent, child) => ({
  name: [parent.name, child.name].filter(Boolean).join("."),
  label: [parent.label, child.label].filter(Boolean).join("\n"),
  treePath: [parent.treePath, child.treePath].filter(Boolean).join(" > "),
  filePath: child.filePath || parent.filePath || "",
});

const createTranslationEntry = ({ context, locale, text }) => {
  const key = context.name;
  const textHash = generateHashId([text, key]);
  const contextFingerprint = generateHashId(context);

  return {
    key,
    textHash,
    baseLocale: BASE_LOCALE,
    targetLocale: locale,
    text,
    contextFingerprint,
    contextMetadata: context,
  };
};

const localizePath = (pagePath, locale) => {
  if (pagePath === "/") return `/${locale}/`;

  return `/${locale}${pagePath}`;
};

const escapeXml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

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
            frontmatter {
              title
              seoTitle
              seoDescription
            }
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
        metadata: {
          title: edge.node.frontmatter.title,
          seoTitle: edge.node.frontmatter.seoTitle,
          seoDescription: edge.node.frontmatter.seoDescription,
        },
      };
    });
  });
};

const translatePageMetadata = async ({
  availableLocales,
  pages,
  siteMetadata,
}) => {
  const translationRequests = [];
  const requestIndex = new Map();

  pages.forEach((page, pageIndex) => {
    const title =
      page.metadata.seoTitle || page.metadata.title || siteMetadata.title;
    const description =
      page.metadata.seoDescription || siteMetadata.defaultDescription;
    const pageContext = combineTranslationContext(
      ROOT_TRANSLATION_CONTEXT,
      page.context.translationContext
    );
    const metadataFields = [
      {
        field: "title",
        text: title,
        context: combineTranslationContext(
          pageContext,
          createFieldTranslationContext(
            page.metadata.seoTitle ? "seoTitle" : "title",
            page.metadata.seoTitle ? "SEO title" : "Title"
          )
        ),
      },
      {
        field: "description",
        text: description,
        context: combineTranslationContext(
          pageContext,
          createFieldTranslationContext(
            page.metadata.seoDescription
              ? "seoDescription"
              : "defaultDescription",
            page.metadata.seoDescription
              ? "SEO description"
              : "Default description"
          )
        ),
      },
    ];

    page.translatedMetadata = Object.fromEntries(
      availableLocales.map((locale) => [
        locale,
        {
          title,
          description,
        },
      ])
    );

    availableLocales
      .filter((locale) => locale !== BASE_LOCALE)
      .forEach((locale) => {
        metadataFields.forEach(({ field, text, context }) => {
          const entry = createTranslationEntry({ context, locale, text });
          const requestKey = JSON.stringify([
            entry.targetLocale,
            entry.key,
            entry.textHash,
            entry.contextFingerprint,
          ]);

          requestIndex.set(requestKey, { pageIndex, locale, field, text });
          translationRequests.push(entry);
        });
      });
  });

  if (!translationRequests.length) return pages;

  const result = await fetchTranslations(translationRequests, {
    origin: REQUEST_ORIGIN,
  });

  result.data.forEach((translation) => {
    const requestKey = JSON.stringify([
      translation.locale,
      translation.key,
      translation.textHash,
      translation.contextFingerprint || null,
    ]);
    const match = requestIndex.get(requestKey);

    if (!match) return;

    pages[match.pageIndex].translatedMetadata[match.locale][match.field] =
      decryptTranslationValue({
        encryptedText: translation.translation,
        sourceText: match.text,
        locale: translation.locale,
        key: translation.key,
        textHash: translation.textHash,
      });
  });

  return pages;
};

exports.createPages = async ({ actions, graphql }) => {
  const { createPage, createRedirect } = actions;
  const availableLocales = await getAcceptedLocales();
  const pages = await getPages({ graphql });
  const siteResult = await graphql(`
    {
      site {
        siteMetadata {
          title
          defaultDescription
        }
      }
    }
  `);

  if (siteResult.errors) {
    siteResult.errors.forEach((e) => console.error(e.toString()));
    return Promise.reject(siteResult.errors);
  }

  await translatePageMetadata({
    availableLocales,
    pages,
    siteMetadata: siteResult.data.site.siteMetadata,
  });

  pages.forEach((page) => {
    const { metadata, translatedMetadata, ...gatsbyPage } = page;

    availableLocales.forEach((locale) => {
      createPage({
        ...gatsbyPage,
        path: localizePath(page.path, locale),
        context: {
          ...page.context,
          locale,
          availableLocales,
          translatedMetadata,
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
  const buildAbsoluteLocalizedUrl = (slug, locale) =>
    `${siteUrl}${localizePath(slug, locale)}`;
  const buildAlternateLinks = (slug) =>
    [
      ...availableLocales.map(
        (locale) =>
          `    <xhtml:link rel="alternate" hreflang="${escapeXml(
            locale
          )}" href="${escapeXml(buildAbsoluteLocalizedUrl(slug, locale))}" />`
      ),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(
        buildAbsoluteLocalizedUrl(slug, BASE_LOCALE)
      )}" />`,
    ].join("\n");

  const urls = result.data.allMarkdownRemark.nodes.flatMap(({ fields }) =>
    availableLocales.map((locale) => {
      const url = buildAbsoluteLocalizedUrl(fields.slug, locale);

      return `  <url>\n    <loc>${escapeXml(url)}</loc>\n${buildAlternateLinks(
        fields.slug
      )}\n  </url>`;
    })
  );
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join(
    "\n"
  )}\n</urlset>\n`;

  writeFileSync(path.resolve("public/sitemap.xml"), sitemap);
  writeFileSync(
    path.resolve("public/robots.txt"),
    `User-agent: *\nDisallow: /admin/\nSitemap: ${siteUrl}/sitemap.xml\n`
  );
};
