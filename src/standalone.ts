import { configureAttribution, saveUTMs, getUTM, getUTMs } from "./index";
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

    const urlParams = new URLSearchParams(window.location.search);
    let captured = false;

    urlParams.forEach((value, key) => {
      if (key.startsWith("utm_")) {
        this.saveUTM(key, value);
        captured = true;
      }
    });

    if (captured) {
      const event = new CustomEvent("utmParametersUpdated", {
        detail: this.getAllUTMs(),
      });
      window.dispatchEvent(event);
    }

    return captured;
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
