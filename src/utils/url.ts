/**
 * URL Utility Module
 * Provides functions for extracting UTM parameters from URLs.
 */

const VALID_UTM_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
];

/**
 * Checks if a parameter name is a valid UTM parameter
 */
export function isValidUTMParam(param: string): boolean {
  return VALID_UTM_PARAMS.includes(param.toLowerCase());
}

/**
 * Extracts UTM parameters from a URL search string
 * @param search - The URL search string (e.g., "?utm_source=google&utm_medium=cpc")
 * @returns Record of UTM parameter key-value pairs
 */
export function extractUTMsFromSearch(search: string): Record<string, string> {
  if (typeof URLSearchParams === "undefined") {
    return {};
  }

  const params = new URLSearchParams(search);
  const utmParams: Record<string, string> = {};

  params.forEach((value, key) => {
    if (key.startsWith("utm_") && isValidUTMParam(key)) {
      utmParams[key] = value;
    }
  });

  return utmParams;
}

/**
 * Extracts UTM parameters from the current window location
 * @returns Record of UTM parameter key-value pairs
 */
export function extractUTMsFromURL(): Record<string, string> {
  if (typeof window === "undefined") {
    return {};
  }
  return extractUTMsFromSearch(window.location.search);
}

/**
 * Extracts UTM parameters from a query object (e.g., Next.js router.query)
 * @param query - Query object with string or string array values
 * @returns Record of UTM parameter key-value pairs
 */
export function extractUTMsFromQuery(
  query: Record<string, string | string[] | undefined>
): Record<string, string> {
  const utmParams: Record<string, string> = {};

  Object.entries(query).forEach(([key, value]) => {
    if (
      key.startsWith("utm_") &&
      typeof value === "string" &&
      isValidUTMParam(key)
    ) {
      utmParams[key] = value;
    }
  });

  return utmParams;
}

export { VALID_UTM_PARAMS };
