import React from "react";
import { useEffect } from "react";
import { useRouter } from "next/router";
import type { NextComponentType, NextPageContext } from "next";
import { useUTMs } from "../react";
import { extractUTMsFromQuery } from "../../utils/url";
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

    const utmParams = extractUTMsFromQuery(router.query);

    if (Object.keys(utmParams).length > 0) {
      utmTools.setParams(utmParams);
    }
  }, [router.isReady, router.query, config.autoCapture]);

  return {
    ...utmTools,
    captureFromURL: () => {
      const utmParams = extractUTMsFromQuery(router.query);
      if (Object.keys(utmParams).length > 0) {
        utmTools.setParams(utmParams);
      }
    },
  };
}

interface WithUTMsProps {
  initialUTMs?: UTMParams;
}

type ComponentWithUTMs<P extends object = object> = NextComponentType<
  NextPageContext,
  P & WithUTMsProps,
  P & WithUTMsProps
>;

/**
 * Higher-order function to enable server-side UTM handling
 */
export function withUTMs<P extends object>(
  Component: ComponentWithUTMs<P>
): ComponentWithUTMs<P> {
  const WrappedComponent = (props: P & WithUTMsProps) => {
    return <Component {...props} />;
  };

  WrappedComponent.getInitialProps = async (ctx: NextPageContext) => {
    let componentProps = {} as P;
    if (Component.getInitialProps) {
      componentProps = (await Component.getInitialProps(ctx)) as P;
    }

    const initialUTMs = ctx.query ? extractUTMsFromQuery(ctx.query) : {};

    return {
      ...componentProps,
      initialUTMs,
    } as P & WithUTMsProps;
  };

  return WrappedComponent as ComponentWithUTMs<P>;
}

// Export types for convenience
export type { UTMParams, UTMConfig, AttributionStrategy };
