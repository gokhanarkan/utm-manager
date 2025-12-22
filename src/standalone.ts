import { configureAttribution, saveUTMs, getUTM, getUTMs } from "./index";
import { extractUTMsFromURL } from "./utils/url";
import type { UTMConfig, AttributionStrategy } from "./index";

const UTMManager = {
  configure(options: Partial<UTMConfig> = {}) {
    const strategy = options.attribution || "last";
    configureAttribution(strategy as AttributionStrategy, options);
  },

  saveUTM(key: string, value: string, days?: number) {
    saveUTMs(key, value, days || 30);
  },

  getUTM(key: string) {
    return getUTM(key);
  },

  getAllUTMs() {
    return getUTMs();
  },

  autoCapture() {
    if (typeof window === "undefined") return false;

    const utmParams = extractUTMsFromURL();
    const paramKeys = Object.keys(utmParams);

    if (paramKeys.length === 0) return false;

    paramKeys.forEach((key) => {
      this.saveUTM(key, utmParams[key]);
    });

    const event = new CustomEvent("utmParametersUpdated", {
      detail: this.getAllUTMs(),
    });
    window.dispatchEvent(event);

    return true;
  },
};

// Initialize with default configuration
UTMManager.configure();

// Auto-capture UTM parameters on page load
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () =>
      UTMManager.autoCapture()
    );
  } else {
    UTMManager.autoCapture();
  }
}

export default UTMManager;
