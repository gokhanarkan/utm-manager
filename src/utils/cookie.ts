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

interface StoredCookie {
  value: string;
  options: CookieOptions;
}

// In-memory storage for testing environment
const memoryStorage = new Map<string, StoredCookie>();

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
 * Sets a cookie with the provided name, value, and options
 */
export function setCookie(
  name: string,
  value: string,
  options: Partial<CookieOptions> = {}
): void {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const cookieString = generateCookieString(name, value, opts);

  memoryStorage.set(name, {
    value,
    options: opts,
  });

  if (typeof document !== "undefined") {
    document.cookie = cookieString;
  }
}

/**
 * Gets the value of a cookie by name
 */
export function getCookie(name: string): string | null {
  const stored = memoryStorage.get(name);
  return stored ? stored.value : null;
}

/**
 * Removes a cookie by name
 */
export function removeCookie(
  name: string,
  options: Partial<CookieOptions> = {}
): void {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  memoryStorage.delete(name);

  if (typeof document !== "undefined") {
    document.cookie = generateCookieString(name, "", { ...opts, days: -1 });
  }
}

/**
 * Checks if cookies are enabled
 */
export function areCookiesEnabled(): boolean {
  try {
    setCookie("__test__", "1");
    const result = getCookie("__test__") === "1";
    removeCookie("__test__");
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
  return Array.from(memoryStorage.entries()).reduce((acc, [name, stored]) => {
    acc[name] = stored.value;
    return acc;
  }, {} as Record<string, string>);
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
