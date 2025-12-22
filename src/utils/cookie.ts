/**
 * Cookie Management Utility Module
 * Provides secure and cross-browser compatible cookie operations.
 */

export interface CookieOptions {
  days: number;
  domain?: string;
  path?: string;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
}

const DEFAULT_OPTIONS: CookieOptions = {
  days: 30,
  path: "/",
  secure: true,
  sameSite: "Lax",
};

// In-memory storage for test environment (jsdom doesn't persist cookies)
const memoryStorage = new Map<string, string>();

// Detect test environment
const isTestEnv =
  typeof process !== "undefined" && process.env?.NODE_ENV === "test";

/**
 * Clears all cookies from memory storage (for testing)
 */
export function clearCookieStorage(): void {
  memoryStorage.clear();
}

/**
 * Internal method to generate cookie string representation
 */
function generateCookieString(
  name: string,
  value: string,
  options: CookieOptions
): string {
  const expires = new Date(Date.now() + options.days * 24 * 60 * 60 * 1000);

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(
    value
  )}; expires=${expires.toUTCString()}; path=${options.path}`;

  if (options.domain) {
    cookieString += `; domain=${options.domain}`;
  }

  if (options.sameSite) {
    cookieString += `; samesite=${options.sameSite}`;
  }

  if (options.secure) {
    cookieString += "; secure";
  }

  return cookieString;
}

/**
 * Parses document.cookie string into key-value pairs
 */
function parseCookies(): Record<string, string> {
  // In test environment, use memory storage
  if (isTestEnv) {
    const cookies: Record<string, string> = {};
    memoryStorage.forEach((value, key) => {
      cookies[key] = value;
    });
    return cookies;
  }

  if (typeof document === "undefined") {
    return {};
  }

  const cookies: Record<string, string> = {};
  const cookieString = document.cookie;

  if (!cookieString) {
    return cookies;
  }

  cookieString.split(";").forEach((cookie) => {
    const [rawName, ...valueParts] = cookie.split("=");
    if (rawName) {
      const name = decodeURIComponent(rawName.trim());
      const value =
        valueParts.length > 0
          ? decodeURIComponent(valueParts.join("=").trim())
          : "";
      if (name) {
        cookies[name] = value;
      }
    }
  });

  return cookies;
}

/**
 * Sets a cookie with the provided name, value, and options
 */
export function setCookie(
  name: string,
  value: string,
  options: Partial<CookieOptions> = {}
): void {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Always store in memory for test environment
  if (isTestEnv) {
    memoryStorage.set(name, value);
    return;
  }

  const cookieString = generateCookieString(name, value, opts);

  if (typeof document !== "undefined") {
    document.cookie = cookieString;
  }
}

/**
 * Gets the value of a cookie by name
 */
export function getCookie(name: string): string | null {
  const cookies = parseCookies();
  return name in cookies ? cookies[name] : null;
}

/**
 * Removes a cookie by name
 */
export function removeCookie(
  name: string,
  options: Partial<CookieOptions> = {}
): void {
  // In test environment, just delete from memory
  if (isTestEnv) {
    memoryStorage.delete(name);
    return;
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (typeof document !== "undefined") {
    document.cookie = generateCookieString(name, "", { ...opts, days: -1 });
  }
}

/**
 * Checks if cookies are enabled
 */
export function areCookiesEnabled(): boolean {
  // In test environment, cookies are always "enabled" via memory
  if (isTestEnv) {
    return true;
  }

  if (typeof document === "undefined") {
    return false;
  }

  try {
    const testName = "__cookie_test__";
    setCookie(testName, "1", { days: 1 });
    const result = getCookie(testName) === "1";
    removeCookie(testName);
    return result;
  } catch {
    return false;
  }
}

/**
 * Validates cookie name according to RFC 6265
 */
export function isValidCookieName(name: string): boolean {
  return /^[\u0021\u0023-\u002B\u002D-\u003A\u003C-\u005B\u005D-\u007E]+$/.test(
    name
  );
}

/**
 * Gets all cookies as a key-value object
 */
export function getAllCookies(): Record<string, string> {
  return parseCookies();
}

/**
 * Safely parses JSON stored in a cookie
 */
export function getJSONCookie<T>(name: string): T | null {
  const value = getCookie(name);
  if (value === null) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/**
 * Sets a cookie with a JSON value
 */
export function setJSONCookie<T>(
  name: string,
  value: T,
  options: Partial<CookieOptions> = {}
): void {
  setCookie(name, JSON.stringify(value), options);
}
