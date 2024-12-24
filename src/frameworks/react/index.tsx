import { useEffect, useState, useCallback } from "react";
import {
  UTMParams,
  UTMConfig,
  AttributionStrategy,
  getUTMs,
  getUTM,
  saveUTMs,
  configureAttribution,
  defaultConfig,
} from "../../index";

interface UseUTMsConfig extends Partial<UTMConfig> {
  /** Whether to automatically capture UTMs from URL on mount */
  autoCapture?: boolean;
  /** Callback when UTM parameters are captured or updated */
  onUpdate?: (params: UTMParams) => void;
}

interface UseUTMsReturn {
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

/**
 * React hook for managing UTM parameters
 * @param config - Configuration options for UTM handling
 * @returns Object containing UTM state and management functions
 */
export function useUTMs(config?: UseUTMsConfig): UseUTMsReturn {
  const [params, setParams] = useState<UTMParams>({});

  useEffect(() => {
    // Initialize UTM configuration
    if (config) {
      configureAttribution(
        config.attribution || defaultConfig.attribution,
        config
      );
    }

    // Load initial UTM parameters from cookies
    const storedParams = getUTMs();
    setParams(storedParams);

    // Auto-capture UTMs from URL if enabled
    if (config?.autoCapture) {
      captureUTMsFromURL();
    }
  }, []);

  const getParam = useCallback((key: string): string | undefined => {
    return getUTM(key);
  }, []);

  const setParam = useCallback(
    (key: string, value: string, days?: number) => {
      try {
        saveUTMs(key, value, days);
        setParams((prev) => {
          const updated = { ...prev, [key]: value };
          config?.onUpdate?.(updated);
          return updated;
        });
      } catch (error) {
        console.error(`Error setting UTM parameter ${key}:`, error);
      }
    },
    [config?.onUpdate]
  );

  const setMultipleParams = useCallback(
    (newParams: Record<string, string>, days?: number) => {
      Object.entries(newParams).forEach(([key, value]) => {
        try {
          saveUTMs(key, value, days);
        } catch (error) {
          console.error(`Error setting UTM parameter ${key}:`, error);
        }
      });

      setParams((prev) => {
        const updated = { ...prev, ...newParams };
        config?.onUpdate?.(updated);
        return updated;
      });
    },
    [config?.onUpdate]
  );

  const captureUTMsFromURL = useCallback(() => {
    if (typeof window === "undefined") return;

    const searchParams = new URLSearchParams(window.location.search);
    const utmParams: Record<string, string> = {};

    searchParams.forEach((value, key) => {
      if (key.startsWith("utm_")) {
        utmParams[key] = value;
      }
    });

    if (Object.keys(utmParams).length > 0) {
      setMultipleParams(utmParams);
    }
  }, [setMultipleParams]);

  const configure = useCallback(
    (strategy: AttributionStrategy, configOptions?: Partial<UTMConfig>) => {
      configureAttribution(strategy, configOptions);
    },
    []
  );

  return {
    params,
    getParam,
    setParam,
    setParams: setMultipleParams,
    configure,
    captureFromURL: captureUTMsFromURL,
  };
}
