import React from "react";
import { useEffect } from "react";
import { useRouter } from "next/router";
import type { NextComponentType, NextPageContext } from "next";
import { useUTMs } from "../react";
import type { UTMParams, UTMConfig, AttributionStrategy } from "../../index";

interface UseNextUTMsConfig extends Partial<UTMConfig> {
  /** Whether to automatically capture UTMs from URL on route changes */
  autoCapture?: boolean;
  /** Callback when UTM parameters are captured or updated */
  onUpdate?: (params: UTMParams) => void;
  /** Whether to handle UTMs during server-side rendering */
  enableSSR?: boolean;
}

/**
 * Next.js-specific hook for managing UTM parameters
 * Extends the base useUTMs hook with Next.js routing integration
 */
export function useNextUTMs(userConfig?: UseNextUTMsConfig) {
  const router = useRouter();
  const config = {
    autoCapture: true,
    enableSSR: false,
    ...userConfig,
  };

  const utmTools = useUTMs({
    ...config,
    autoCapture: false, // We'll handle this manually with Next.js routing
  });

  useEffect(() => {
    if (!config.autoCapture || !router.isReady) return;

    // Extract UTM parameters from the query
    const utmParams: Record<string, string> = {};
    Object.entries(router.query).forEach(([key, value]) => {
      if (key.startsWith("utm_") && typeof value === "string") {
        utmParams[key] = value;
      }
    });

    // If we have UTM parameters, save them
    if (Object.keys(utmParams).length > 0) {
      utmTools.setParams(utmParams);
    }
  }, [router.isReady, router.query, config.autoCapture]);

  return {
    ...utmTools,
    // Override captureFromURL to use Next.js router query
    captureFromURL: () => {
      const utmParams: Record<string, string> = {};
      Object.entries(router.query).forEach(([key, value]) => {
        if (key.startsWith("utm_") && typeof value === "string") {
          utmParams[key] = value;
        }
      });
      if (Object.keys(utmParams).length > 0) {
        utmTools.setParams(utmParams);
      }
    },
  };
}

interface WithUTMsProps {
  initialUTMs?: UTMParams;
}

type ComponentWithUTMs<P = {}> = NextComponentType<
  NextPageContext,
  {},
  P & WithUTMsProps
>;

/**
 * Higher-order function to enable server-side UTM handling
 */
export function withUTMs<P extends WithUTMsProps>(
  Component: ComponentWithUTMs<P>
): ComponentWithUTMs<P> {
  const WrappedComponent: ComponentWithUTMs<P> = (props: P & WithUTMsProps) => {
    return <Component {...props} />;
  };

  WrappedComponent.getInitialProps = async (ctx: NextPageContext) => {
    // Get component's initial props if they exist
    let componentProps = {};
    if (Component.getInitialProps) {
      componentProps = await Component.getInitialProps(ctx);
    }

    // Handle server-side UTM extraction
    const initialUTMs: UTMParams = {};
    if (ctx.query) {
      Object.entries(ctx.query).forEach(([key, value]) => {
        if (key.startsWith("utm_") && typeof value === "string") {
          initialUTMs[key] = value;
        }
      });
    }

    return {
      ...(componentProps as P),
      initialUTMs,
    };
  };

  return WrappedComponent;
}

// Export types for convenience
export type { UTMParams, UTMConfig, AttributionStrategy };
