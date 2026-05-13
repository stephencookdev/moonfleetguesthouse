const DEMO_API_KEY = "pk_dummy_demo_token";

const parsePositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const BASE_LOCALE = "en-GB";
export const API_KEY = process.env.GATSBY_18WAYS_API_KEY || DEMO_API_KEY;
export const API_URL = process.env.GATSBY_18WAYS_API_URL || undefined;
export const REQUEST_ORIGIN =
  process.env.GATSBY_18WAYS_REQUEST_ORIGIN ||
  process.env.URL ||
  "http://localhost:8000";
export const SUSPENSE_TIMEOUT_MS = parsePositiveInteger(
  process.env.GATSBY_18WAYS_SUSPENSE_TIMEOUT_MS,
  30000
);

export const ROOT_TRANSLATION_CONTEXT = {
  name: "moonfleet",
  label: "Moonfleet Guesthouse",
  treePath: "Moonfleet Guesthouse",
};

export const WAYS_ROOT_PROPS = {
  apiKey: API_KEY,
  _apiUrl: API_URL,
  baseLocale: BASE_LOCALE,
  persistLocaleCookie: true,
  requestOrigin: REQUEST_ORIGIN,
  suspenseTimeoutMs: SUSPENSE_TIMEOUT_MS,
  context: ROOT_TRANSLATION_CONTEXT,
};

const hasProtocol = (path) => /^[a-z][a-z0-9+.-]*:/i.test(path || "");
const localePrefixPattern = /^\/([a-z]{2,3}(?:-[a-z0-9]+)*)(?=\/|$)/i;

const splitPathSuffix = (path) => {
  const match = (path || "").match(/^([^?#]*)([?#].*)?$/);

  return {
    pathname: match?.[1] || "/",
    suffix: match?.[2] || "",
  };
};

export const getPathLocale = (path) => {
  if (!path || hasProtocol(path) || path.startsWith("#")) return null;

  const { pathname } = splitPathSuffix(path);
  const match = pathname.match(localePrefixPattern);

  return match?.[1] || null;
};

export const stripLocaleFromPath = (path) => {
  if (!path || hasProtocol(path) || path.startsWith("#")) return path;

  const { pathname, suffix } = splitPathSuffix(path);
  const pathLocale = getPathLocale(pathname);

  if (!pathLocale) return path;

  const segmentPattern = new RegExp(`^/${pathLocale}(?=/|$)`, "i");
  const strippedPathname = pathname.replace(segmentPattern, "") || "/";

  return `${strippedPathname}${suffix}`;
};

export const localizePath = (path, locale = BASE_LOCALE) => {
  if (!path || hasProtocol(path) || path.startsWith("#")) return path;

  const targetLocale = locale || BASE_LOCALE;
  const strippedPath = stripLocaleFromPath(path);
  const { pathname, suffix } = splitPathSuffix(strippedPath);
  const normalizedPathname = pathname.startsWith("/")
    ? pathname
    : `/${pathname}`;

  if (normalizedPathname === "/") return `/${targetLocale}/${suffix}`;

  return `/${targetLocale}${normalizedPathname}${suffix}`;
};

export const createTranslationContext = ({
  name,
  label,
  treePath,
  filePath,
}) => ({
  name,
  label: label || "",
  treePath: treePath || label || "",
  filePath: filePath || "",
});

export const createPageTranslationContext = (name, label, filePath) =>
  createTranslationContext({
    name,
    label,
    treePath: label,
    filePath,
  });

export const createFieldTranslationContext = (name, label = name) =>
  createTranslationContext({
    name,
    label,
    treePath: label,
  });
