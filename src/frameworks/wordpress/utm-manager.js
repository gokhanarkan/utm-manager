// UTM Manager WordPress Integration
(function () {
  function initUTMManager() {
    // Initialize UTM configuration
    window.utmManager.configureAttribution("last", {
      expirationDays: 30,
      domain: window.location.hostname,
    });

    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const utmParams = {};

    // Collect UTM parameters from URL
    urlParams.forEach((value, key) => {
      if (key.startsWith("utm_")) {
        utmParams[key] = value;
      }
    });

    // Save UTM parameters if present
    if (Object.keys(utmParams).length > 0) {
      Object.entries(utmParams).forEach(([key, value]) => {
        window.utmManager.saveUTMs(key, value, 30);
      });

      // Optionally trigger WordPress event for integrations
      const event = new CustomEvent("utmParametersUpdated", {
        detail: window.utmManager.getUTMs(),
      });
      window.dispatchEvent(event);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initUTMManager);
  } else {
    initUTMManager();
  }
})();
