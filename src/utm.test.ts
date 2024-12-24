import {
  configureUTM,
  saveUTM,
  getUTM,
  getUTMs,
  saveUTMs,
  UTMConfig,
} from "./utm";

describe("UTM Manager", () => {
  beforeEach(() => {
    // Reset configuration before each test
    configureUTM();

    // Clear cookies
    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });
  });

  describe("UTM Parameter Validation", () => {
    test("should throw error for invalid UTM parameter names", () => {
      expect(() => saveUTM("invalid", "value")).toThrow();
      expect(() => saveUTM("utm_invalid", "value")).toThrow();
    });

    test("should accept valid UTM parameters", () => {
      expect(() => saveUTM("utm_source", "google")).not.toThrow();
      expect(() => saveUTM("utm_medium", "cpc")).not.toThrow();
    });
  });

  describe("Attribution Strategies", () => {
    test("should respect first-touch attribution", () => {
      configureUTM({ attribution: "first" });

      saveUTM("utm_source", "google");
      expect(getUTM("utm_source")).toBe("google");

      saveUTM("utm_source", "facebook");
      expect(getUTM("utm_source")).toBe("google");
    });

    test("should respect last-touch attribution", () => {
      configureUTM({ attribution: "last" });

      saveUTM("utm_source", "google");
      expect(getUTM("utm_source")).toBe("google");

      saveUTM("utm_source", "facebook");
      expect(getUTM("utm_source")).toBe("facebook");
    });

    test("should handle dynamic attribution", () => {
      const attributionCallback = (current: string, newValue: string) => {
        return newValue.includes("google") ? newValue : current;
      };

      configureUTM({
        attribution: "dynamic",
        attributionCallback,
      });

      saveUTM("utm_source", "facebook");
      expect(getUTM("utm_source")).toBe("facebook");

      saveUTM("utm_source", "google-ads");
      expect(getUTM("utm_source")).toBe("google-ads");

      saveUTM("utm_source", "bing");
      expect(getUTM("utm_source")).toBe("google-ads");
    });
  });

  describe("Multiple UTM Parameters", () => {
    test("should save and retrieve multiple UTM parameters", () => {
      const params = {
        utm_source: "google",
        utm_medium: "cpc",
        utm_campaign: "spring_sale",
      };

      saveUTMs(params);

      expect(getUTMs()).toEqual(params);
    });

    test("should handle invalid parameters in batch operations", () => {
      const params = {
        utm_source: "google",
        invalid: "value",
        utm_medium: "cpc",
      };

      saveUTMs(params);

      expect(getUTMs()).toEqual({
        utm_source: "google",
        utm_medium: "cpc",
      });
    });
  });

  describe("Configuration Options", () => {
    test("should apply custom expiration days", () => {
      const config: Partial<UTMConfig> = {
        expirationDays: 60,
      };

      configureUTM(config);
      saveUTM("utm_source", "google");

      expect(getUTM("utm_source")).toBe("google");
    });

    test("should handle domain configuration", () => {
      const config: Partial<UTMConfig> = {
        domain: ".example.com",
      };

      configureUTM(config);
      saveUTM("utm_source", "google");

      expect(getUTM("utm_source")).toBe("google");
    });
  });
});
