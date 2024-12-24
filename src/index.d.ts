declare module "utm-manager" {
  export type AttributionStrategy = "first" | "last" | "dynamic";

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

  export interface UTMParams {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
    [key: string]: string | undefined;
  }

  export interface CookieOptions {
    days: number;
    domain?: string;
    path?: string;
    secure?: boolean;
    sameSite?: "Strict" | "Lax" | "None";
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
    days: number
  ): void;

  /**
   * Retrieves all stored UTM parameters
   * @returns An object containing all stored UTM parameters
   */
  export function getUTMs(): UTMParams;

  /**
   * Retrieves a specific UTM parameter value
   * @param utm_key - The UTM parameter key to retrieve
   * @returns The value of the specified UTM parameter, or undefined if not found
   */
  export function getUTM(utm_key: string): string | undefined;

  /**
   * Configures the UTM attribution strategy
   * @param strategy - The attribution strategy to use
   * @param config - Additional configuration options
   */
  export function configureAttribution(
    strategy: AttributionStrategy,
    config?: Partial<UTMConfig>
  ): void;
}

declare module "utm-manager/react" {
  import { UTMParams, UTMConfig, AttributionStrategy } from "utm-manager";

  export interface UseUTMsConfig extends Partial<UTMConfig> {
    /** Whether to automatically capture UTMs from URL on mount */
    autoCapture?: boolean;
    /** Callback when UTM parameters are captured or updated */
    onUpdate?: (params: UTMParams) => void;
  }

  export interface UseUTMsReturn {
    /** Current UTM parameters */
    params: UTMParams;
    /** Function to get a specific UTM parameter */
    getParam: (key: string) => string | undefined;
    /** Function to set a specific UTM parameter */
    setParam: (key: string, value: string, days?: number) => void;
    /** Function to set multiple UTM parameters */
    setParams: (params: Record<string, string>, days?: number) => void;
    /** Function to configure UTM handling behavior */
    configure: (
      strategy: AttributionStrategy,
      config?: Partial<UTMConfig>
    ) => void;
    /** Function to manually capture UTMs from the current URL */
    captureFromURL: () => void;
  }

  export function useUTMs(config?: UseUTMsConfig): UseUTMsReturn;
}

declare module "utm-manager/next" {
  import { UTMParams, UTMConfig } from "utm-manager";
  import { UseUTMsConfig, UseUTMsReturn } from "utm-manager/react";
  import { ComponentType } from "react";

  export interface UseNextUTMsConfig extends UseUTMsConfig {
    /** Whether to handle UTMs during server-side rendering */
    enableSSR?: boolean;
  }

  export function useNextUTMs(config?: UseNextUTMsConfig): UseUTMsReturn;

  export interface WithUTMsProps {
    initialUTMs?: UTMParams;
  }

  export function withUTMs<P extends WithUTMsProps>(
    Component: ComponentType<P>,
    config?: UseNextUTMsConfig
  ): {
    Component: ComponentType<P>;
    getInitialProps: (ctx: any) => Promise<P & WithUTMsProps>;
  };

  export type { UTMParams, UTMConfig, UseUTMsReturn };
}
