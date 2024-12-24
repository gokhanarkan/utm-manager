import {
  setCookie,
  getCookie,
  getAllCookies,
  CookieOptions,
} from "./utils/cookie";

export type AttributionStrategy = "first" | "last" | "dynamic";

export interface UTMConfig {
  attribution: AttributionStrategy;
  expirationDays: number;
  domain?: string;
  path?: string;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
  attributionCallback?: (currentValue: string, newValue: string) => string;
}

const DEFAULT_CONFIG: UTMConfig = {
  attribution: "last",
  expirationDays: 30,
  path: "/",
  secure: true,
  sameSite: "Lax",
};

let currentConfig: UTMConfig = { ...DEFAULT_CONFIG };

const UTM_PREFIX = "utm_";
const VALID_UTM_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
];

/**
 * Validates if a given string is a valid UTM parameter name
 */
function isValidUTMParam(param: string): boolean {
  return VALID_UTM_PARAMS.includes(param.toLowerCase());
}

/**
 * Determines if a UTM parameter should be saved based on attribution strategy
 */
function shouldSaveUTM(key: string, value: string): boolean {
  const currentValue = getCookie(key);

  switch (currentConfig.attribution) {
    case "first":
      return currentValue === null;

    case "last":
      return true;

    case "dynamic":
      if (!currentConfig.attributionCallback) {
        return true;
      }
      try {
        const shouldSave = currentConfig.attributionCallback(
          currentValue || "",
          value
        );
        return shouldSave === value;
      } catch (error) {
        console.error("Error in attribution callback:", error);
        return false;
      }

    default:
      return true;
  }
}

/**
 * Configures the UTM manager with the provided options
 */
export function configureUTM(config: Partial<UTMConfig> = {}): void {
  currentConfig = {
    ...DEFAULT_CONFIG,
    ...config,
  };
}

/**
 * Saves a UTM parameter if it meets the attribution strategy criteria
 */
export function saveUTM(key: string, value: string): void {
  if (!key.startsWith(UTM_PREFIX)) {
    throw new Error(
      `Invalid UTM parameter: ${key}. UTM parameters must start with 'utm_'`
    );
  }

  if (!isValidUTMParam(key)) {
    throw new Error(
      `Invalid UTM parameter: ${key}. Must be one of: ${VALID_UTM_PARAMS.join(
        ", "
      )}`
    );
  }

  if (shouldSaveUTM(key, value)) {
    const cookieOptions: CookieOptions = {
      days: currentConfig.expirationDays,
      domain: currentConfig.domain,
      path: currentConfig.path,
      secure: currentConfig.secure,
      sameSite: currentConfig.sameSite,
    };

    setCookie(key, value, cookieOptions);
  }
}

/**
 * Retrieves a specific UTM parameter value
 */
export function getUTM(key: string): string | null {
  if (!key.startsWith(UTM_PREFIX)) {
    throw new Error(
      `Invalid UTM parameter: ${key}. UTM parameters must start with 'utm_'`
    );
  }

  if (!isValidUTMParam(key)) {
    throw new Error(
      `Invalid UTM parameter: ${key}. Must be one of: ${VALID_UTM_PARAMS.join(
        ", "
      )}`
    );
  }

  return getCookie(key);
}

/**
 * Retrieves all stored UTM parameters
 */
export function getUTMs(): Record<string, string> {
  const allCookies = getAllCookies();
  return Object.entries(allCookies).reduce((utms, [key, value]) => {
    if (key.startsWith(UTM_PREFIX) && isValidUTMParam(key)) {
      utms[key] = value;
    }
    return utms;
  }, {} as Record<string, string>);
}

/**
 * Saves multiple UTM parameters at once
 */
export function saveUTMs(params: Record<string, string>): void {
  Object.entries(params).forEach(([key, value]) => {
    try {
      saveUTM(key, value);
    } catch (error) {
      console.error(`Error saving UTM parameter ${key}:`, error);
    }
  });
}
