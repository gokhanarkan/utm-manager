import { saveUTMs, getUTMs, getUTM, configureAttribution } from "./index";
import { clearCookieStorage } from "./utils/cookie";

describe("UTM Manager - index.ts", () => {
  beforeEach(() => {
    clearCookieStorage();
    configureAttribution("last");
  });

  describe("saveUTMs and getUTM", () => {
    test("should save and retrieve a UTM parameter", () => {
      saveUTMs("utm_source", "google");
      expect(getUTM("utm_source")).toBe("google");
    });

    test("should save multiple UTM parameters", () => {
      saveUTMs("utm_source", "google");
      saveUTMs("utm_medium", "cpc");
      saveUTMs("utm_campaign", "spring2024");

      expect(getUTM("utm_source")).toBe("google");
      expect(getUTM("utm_medium")).toBe("cpc");
      expect(getUTM("utm_campaign")).toBe("spring2024");
    });

    test("should throw error for invalid UTM parameter name", () => {
      expect(() => saveUTMs("invalid", "value")).toThrow(
        'UTM parameter key must start with "utm_"'
      );
    });

    test("should throw error for non-standard UTM parameters", () => {
      expect(() => saveUTMs("utm_custom", "value")).toThrow(
        "Invalid UTM parameter"
      );
    });

    test("should handle special characters in values", () => {
      saveUTMs("utm_source", "test@value+with spaces");
      expect(getUTM("utm_source")).toBe("test@value+with spaces");
    });
  });

  describe("getUTMs", () => {
    test("should return all stored UTM parameters", () => {
      saveUTMs("utm_source", "google");
      saveUTMs("utm_medium", "cpc");

      const allUTMs = getUTMs();
      expect(allUTMs.utm_source).toBe("google");
      expect(allUTMs.utm_medium).toBe("cpc");
    });

    test("should return empty object when no UTMs stored", () => {
      const allUTMs = getUTMs();
      expect(Object.keys(allUTMs).length).toBe(0);
    });
  });

  describe("configureAttribution", () => {
    test("should use last-touch attribution by default", () => {
      saveUTMs("utm_source", "google");
      saveUTMs("utm_source", "facebook");

      expect(getUTM("utm_source")).toBe("facebook");
    });

    test("should respect first-touch attribution", () => {
      configureAttribution("first");

      saveUTMs("utm_source", "google");
      saveUTMs("utm_source", "facebook");

      expect(getUTM("utm_source")).toBe("google");
    });

    test("should respect dynamic attribution with callback", () => {
      configureAttribution("dynamic", {
        attributionCallback: (current, newValue) => {
          // Only update if new value contains "google"
          return newValue.includes("google") ? newValue : current;
        },
      });

      // First value without "google" - callback returns empty string, so not saved
      saveUTMs("utm_source", "facebook");
      expect(getUTM("utm_source")).toBeUndefined();

      // Value with "google" - callback returns newValue, so it's saved
      saveUTMs("utm_source", "google-ads");
      expect(getUTM("utm_source")).toBe("google-ads");

      // Value without "google" - callback returns current ("google-ads")
      saveUTMs("utm_source", "bing");
      expect(getUTM("utm_source")).toBe("google-ads");
    });

    test("should apply custom expiration days", () => {
      configureAttribution("last", { expirationDays: 90 });
      saveUTMs("utm_source", "google");

      expect(getUTM("utm_source")).toBe("google");
    });
  });

  describe("Validation", () => {
    test("should accept all standard UTM parameters", () => {
      const validParams = [
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_term",
        "utm_content",
      ];

      validParams.forEach((param) => {
        expect(() => saveUTMs(param, "test")).not.toThrow();
      });
    });

    test("getUTM should throw for invalid parameter names", () => {
      expect(() => getUTM("invalid")).toThrow();
      expect(() => getUTM("utm_invalid")).toThrow();
    });
  });
});
