/**
 * UTM Manager Package
 * A robust solution for managing UTM parameters across different JavaScript frameworks.
 */

import {
  setCookie,
  getCookie,
  getAllCookies,
  CookieOptions,
} from "./utils/cookie";

/**
 * Supported attribution strategies for UTM parameter handling
 */
export type AttributionStrategy = "first" | "last" | "dynamic";

/**
 * Configuration options for UTM parameter management
 */
export interface UTMConfig {
  /** Attribution strategy to use when handling UTM parameters */
  attribution: AttributionStrategy;
  /** Cookie expiration time in days */
  expirationDays: number;
  /** Domain scope for cookies (e.g., '.example.com') */
  domain?: string;
  /** Custom callback for dynamic attribution strategy */
  attributionCallback?: (currentValue: string, newValue: string) => string;
}

/**
 * Interface defining the structure of UTM parameters
 */
export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  [key: string]: string | undefined;
}

// Default configuration for UTM handling
export const defaultConfig: UTMConfig = {
  attribution: "last",
  expirationDays: 30,
  domain: undefined,
};

// Current configuration state
let currentConfig: UTMConfig = { ...defaultConfig };

/**
 * Internal function to validate UTM parameter key
 */
function validateUTMKey(utm_key: string): void {
  if (!utm_key.startsWith("utm_")) {
    throw new Error('UTM parameter key must start with "utm_"');
  }

  const validParams = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
  ];
  if (!validParams.includes(utm_key.toLowerCase())) {
    throw new Error(
      `Invalid UTM parameter: ${utm_key}. Must be one of: ${validParams.join(
        ", "
      )}`
    );
  }
}

/**
 * Internal function to determine if a UTM value should be saved based on attribution strategy
 */
function shouldSaveUTM(currentValue: string | null, newValue: string): boolean {
  switch (currentConfig.attribution) {
    case "first":
      return currentValue === null;
    case "last":
      return true;
    case "dynamic":
      if (!currentConfig.attributionCallback) return true;
      try {
        return (
          currentConfig.attributionCallback(currentValue || "", newValue) ===
          newValue
        );
      } catch (error) {
        console.error("Error in attribution callback:", error);
        return false;
      }
    default:
      return true;
  }
}

/**
 * Saves a UTM parameter to cookies
 * @param utm_key - The UTM parameter key (must start with 'utm_')
 * @param utm_value - The value to store
 * @param days - Number of days until the cookie expires
 */
export function saveUTMs(
  utm_key: string,
  utm_value: string,
  days?: number
): void {
  validateUTMKey(utm_key);

  const currentValue = getCookie(utm_key);

  if (shouldSaveUTM(currentValue, utm_value)) {
    const cookieOptions: CookieOptions = {
      days: days || currentConfig.expirationDays,
      domain: currentConfig.domain,
      secure: true,
      sameSite: "Lax",
    };

    setCookie(utm_key, utm_value, cookieOptions);
  }
}

/**
 * Retrieves all stored UTM parameters
 * @returns An object containing all stored UTM parameters
 */
export function getUTMs(): UTMParams {
  const allCookies = getAllCookies();
  return Object.entries(allCookies).reduce((utms, [key, value]) => {
    if (key.startsWith("utm_")) {
      utms[key] = value;
    }
    return utms;
  }, {} as UTMParams);
}

/**
 * Retrieves a specific UTM parameter value
 * @param utm_key - The UTM parameter key to retrieve
 * @returns The value of the specified UTM parameter, or undefined if not found
 */
export function getUTM(utm_key: string): string | undefined {
  validateUTMKey(utm_key);
  const value = getCookie(utm_key);
  return value || undefined;
}

/**
 * Configures the UTM attribution strategy
 * @param strategy - The attribution strategy to use
 * @param config - Additional configuration options
 */
export function configureAttribution(
  strategy: AttributionStrategy,
  config?: Partial<UTMConfig>
): void {
  currentConfig = {
    ...defaultConfig,
    ...config,
    attribution: strategy,
  };
}

/**
 * Export types and interfaces for better developer experience
 */
export type { CookieOptions } from "./utils/cookie";
