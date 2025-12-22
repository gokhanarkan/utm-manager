/**
 * UTM Manager WordPress Integration
 *
 * Usage:
 * 1. First, include the main UTM Manager script:
 *    <script src="path/to/utm-manager.min.js"></script>
 *
 * 2. Then include this WordPress integration script:
 *    <script src="path/to/wordpress/utm-manager.js"></script>
 *
 * Or in WordPress, enqueue both scripts with proper dependencies.
 */
(function () {
  "use strict";

  function initUTMManager() {
    // Check if UTMManager is available (from standalone script)
    if (typeof window.UTMManager === "undefined") {
      console.warn(
        "UTM Manager: Main script not loaded. Please include utm-manager.min.js before this script."
      );
      return;
    }

    // Configure with WordPress-friendly defaults
    window.UTMManager.configure({
      attribution: "last",
      expirationDays: 30,
      domain: window.location.hostname,
    });

    // Auto-capture is already handled by the main script,
    // but we can trigger WordPress-specific integrations here

    // Dispatch WordPress-specific event
    var utmParams = window.UTMManager.getAllUTMs();
    if (Object.keys(utmParams).length > 0) {
      var event = new CustomEvent("utm_manager_ready", {
        detail: utmParams,
      });
      window.dispatchEvent(event);

      // Also trigger jQuery event if jQuery is available
      if (typeof jQuery !== "undefined") {
        jQuery(document).trigger("utm_manager_ready", [utmParams]);
      }
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initUTMManager);
  } else {
    initUTMManager();
  }
})();
