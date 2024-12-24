import {
  setCookie,
  getCookie,
  removeCookie,
  areCookiesEnabled,
  isValidCookieName,
  getAllCookies,
  getJSONCookie,
  setJSONCookie,
} from "../cookie";

describe("Cookie Utility Module", () => {
  beforeEach(() => {
    // Clear cookies before each test
    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });
  });

  describe("Basic Cookie Operations", () => {
    test("should set and get a simple cookie", () => {
      setCookie("test", "value");
      expect(getCookie("test")).toBe("value");
    });

    test("should handle special characters in cookie values", () => {
      const specialValue = "test@value+with spaces&symbols=present";
      setCookie("special", specialValue);
      expect(getCookie("special")).toBe(specialValue);
    });

    test("should return null for non-existent cookies", () => {
      expect(getCookie("nonexistent")).toBeNull();
    });

    test("should remove a cookie", () => {
      setCookie("temp", "value");
      removeCookie("temp");
      expect(getCookie("temp")).toBeNull();
    });
  });

  describe("Cookie Options", () => {
    test("should set cookies with custom domain", () => {
      setCookie("domain-test", "value", { domain: ".example.com" });
      const stored = getCookie("domain-test");
      expect(stored).toBe("value");
    });

    test("should set secure cookies", () => {
      setCookie("secure-test", "value", { secure: true });
      const stored = getCookie("secure-test");
      expect(stored).toBe("value");
    });

    test("should set SameSite attribute", () => {
      setCookie("samesite-test", "value", { sameSite: "Strict" });
      const stored = getCookie("samesite-test");
      expect(stored).toBe("value");
    });
  });

  describe("JSON Cookie Operations", () => {
    test("should handle JSON data in cookies", () => {
      const testData = { name: "Test", value: 123 };
      setJSONCookie("json-test", testData);
      expect(getJSONCookie("json-test")).toEqual(testData);
    });

    test("should return null for invalid JSON data", () => {
      setCookie("invalid-json", "{invalid:json}");
      expect(getJSONCookie("invalid-json")).toBeNull();
    });

    test("should handle arrays in JSON cookies", () => {
      const testArray = [1, 2, 3, "test"];
      setJSONCookie("array-test", testArray);
      expect(getJSONCookie("array-test")).toEqual(testArray);
    });
  });

  describe("Cookie Validation", () => {
    test("should validate cookie names", () => {
      expect(isValidCookieName("valid-name")).toBeTruthy();
      expect(isValidCookieName("invalid name")).toBeFalsy();
      expect(isValidCookieName("invalid;name")).toBeFalsy();
    });

    test("should check if cookies are enabled", () => {
      expect(areCookiesEnabled()).toBeTruthy();
    });
  });

  describe("Multiple Cookies Management", () => {
    test("should get all cookies", () => {
      setCookie("first", "value1");
      setCookie("second", "value2");

      const allCookies = getAllCookies();
      expect(allCookies).toEqual({
        first: "value1",
        second: "value2",
      });
    });

    test("should handle multiple cookies with special characters", () => {
      setCookie("test@1", "value=1");
      setCookie("test@2", "value=2");

      const allCookies = getAllCookies();
      expect(allCookies["test@1"]).toBe("value=1");
      expect(allCookies["test@2"]).toBe("value=2");
    });
  });

  describe("Error Handling", () => {
    test("should handle empty values gracefully", () => {
      setCookie("empty", "");
      expect(getCookie("empty")).toBe("");
    });

    test("should handle undefined options", () => {
      expect(() => setCookie("test", "value", undefined)).not.toThrow();
    });

    test("should handle malformed cookie strings", () => {
      document.cookie = "malformed";
      expect(getAllCookies()).toEqual({});
    });
  });
});
