import React from "react";
import PropTypes from "prop-types";

const DEFAULT_LOCALE = "en-GB";

const trimTrailingSlash = (value) => value.replace(/\/$/, "");

export const normalizePath = (path = "/") => {
  if (!path) return "/";
  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;
  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash
    : `${withLeadingSlash}/`;
};

export const createAbsoluteUrl = (siteUrl, path = "/") =>
  `${trimTrailingSlash(siteUrl)}${normalizePath(path)}`;

export const getCanonicalPath = ({
  canonicalPath,
  unlocalizedPath,
  locale = DEFAULT_LOCALE,
}) => {
  const basePath = normalizePath(canonicalPath || unlocalizedPath || "/");

  if (basePath === `/${locale}/` || basePath.startsWith(`/${locale}/`)) {
    return basePath;
  }

  return basePath === "/" ? `/${locale}/` : `/${locale}${basePath}`;
};

export const resolveImageUrl = (siteUrl, image) => {
  if (!image) return null;
  if (/^https?:\/\//.test(image)) return image;

  return `${trimTrailingSlash(siteUrl)}${image}`;
};

export const createPageSeo = ({
  frontmatter = {},
  siteMetadata,
  pageContext = {},
}) => {
  const title = frontmatter.seoTitle || frontmatter.title || siteMetadata.title;
  const description =
    frontmatter.seoDescription || siteMetadata.defaultDescription;
  const canonicalPath = getCanonicalPath({
    canonicalPath: frontmatter.canonicalPath,
    unlocalizedPath: pageContext.unlocalizedPath,
    locale: DEFAULT_LOCALE,
  });
  const url = createAbsoluteUrl(siteMetadata.siteUrl, canonicalPath);
  const image = resolveImageUrl(
    siteMetadata.siteUrl,
    frontmatter.featuredImage || siteMetadata.defaultImage
  );

  return {
    title,
    description,
    canonicalPath,
    url,
    image,
  };
};

export const createBreadcrumbSchema = ({
  siteMetadata,
  pageContext = {},
  title,
}) => {
  const locale = pageContext.locale || DEFAULT_LOCALE;
  const canonicalPath = getCanonicalPath({
    canonicalPath: pageContext.canonicalPath,
    unlocalizedPath: pageContext.unlocalizedPath,
    locale,
  });
  const localizedPrefix = `/${locale}/`;
  const unlocalizedPath = canonicalPath.startsWith(localizedPrefix)
    ? `/${canonicalPath.slice(localizedPrefix.length)}`
    : canonicalPath;
  const pathParts = unlocalizedPath.split("/").filter(Boolean);

  if (pathParts.length < 2) return null;

  const items = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: createAbsoluteUrl(siteMetadata.siteUrl, `/${locale}/`),
    },
    ...pathParts.map((part, index) => {
      const itemPath = `/${locale}/${pathParts.slice(0, index + 1).join("/")}/`;
      const name =
        index === pathParts.length - 1
          ? title
          : part
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");

      return {
        "@type": "ListItem",
        position: index + 2,
        name,
        item: createAbsoluteUrl(siteMetadata.siteUrl, itemPath),
      };
    }),
  ];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
};

export const createLodgingSchema = ({ siteMetadata }) => ({
  "@context": "https://schema.org",
  "@type": "BedAndBreakfast",
  name: "Moonfleet Guest House",
  url: siteMetadata.siteUrl,
  image: resolveImageUrl(siteMetadata.siteUrl, siteMetadata.defaultImage),
  telephone: siteMetadata.telephone,
  email: siteMetadata.email,
  priceRange: siteMetadata.priceRange,
  address: {
    "@type": "PostalAddress",
    streetAddress: siteMetadata.address.streetAddress,
    addressLocality: siteMetadata.address.addressLocality,
    addressRegion: siteMetadata.address.addressRegion,
    postalCode: siteMetadata.address.postalCode,
    addressCountry: siteMetadata.address.addressCountry,
  },
  amenityFeature: siteMetadata.amenities.map((name) => ({
    "@type": "LocationFeatureSpecification",
    name,
    value: true,
  })),
  sameAs: siteMetadata.sameAs,
});

const JsonLd = ({ data }) => (
  <script type="application/ld+json">{JSON.stringify(data)}</script>
);

JsonLd.propTypes = {
  data: PropTypes.object.isRequired,
};

const Seo = ({
  frontmatter = {},
  siteMetadata,
  pageContext,
  structuredData = [],
}) => {
  const seo = createPageSeo({ frontmatter, siteMetadata, pageContext });
  const title = seo.title === siteMetadata.title ? seo.title : `${seo.title}`;
  const jsonLd = structuredData.filter(Boolean);

  return (
    <>
      <html lang={pageContext?.locale || DEFAULT_LOCALE} />
      <title>{title}</title>
      {pageContext?.locale && pageContext.locale !== DEFAULT_LOCALE && (
        <meta name="robots" content="noindex,follow" />
      )}
      <meta name="description" content={seo.description} />
      <link rel="canonical" href={seo.url} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={seo.url} />
      {seo.image && <meta property="og:image" content={seo.image} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      {seo.image && <meta name="twitter:image" content={seo.image} />}
      {jsonLd.map((data, index) => (
        <JsonLd key={index} data={data} />
      ))}
    </>
  );
};

Seo.propTypes = {
  frontmatter: PropTypes.object,
  siteMetadata: PropTypes.object.isRequired,
  pageContext: PropTypes.object,
  structuredData: PropTypes.arrayOf(PropTypes.object),
};

export default Seo;
