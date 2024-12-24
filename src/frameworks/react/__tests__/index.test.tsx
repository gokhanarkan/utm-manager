import { renderHook, act } from "@testing-library/react-hooks";
import { useUTMs } from "../index";
import { getUTMs, getUTM } from "../../../index";

// Mock window.location
const mockLocation = new URL("https://example.com");
Object.defineProperty(window, "location", {
  value: mockLocation,
  writable: true,
});

describe("useUTMs Hook", () => {
  beforeEach(() => {
    // Clear cookies before each test
    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0].trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });

    // Reset URL parameters
    mockLocation.search = "";
  });

  describe("Basic Functionality", () => {
    test("should initialize with empty params", () => {
      const { result } = renderHook(() => useUTMs());
      expect(result.current.params).toEqual({});
    });

    test("should set and get individual UTM parameters", () => {
      const { result } = renderHook(() => useUTMs());

      act(() => {
        result.current.setParam("utm_source", "google");
      });

      expect(result.current.getParam("utm_source")).toBe("google");
      expect(result.current.params.utm_source).toBe("google");
    });

    test("should set multiple UTM parameters", () => {
      const { result } = renderHook(() => useUTMs());

      act(() => {
        result.current.setParams({
          utm_source: "google",
          utm_medium: "cpc",
        });
      });

      expect(result.current.params).toEqual({
        utm_source: "google",
        utm_medium: "cpc",
      });
    });
  });

  describe("Auto-capture Functionality", () => {
    test("should auto-capture UTMs from URL when enabled", () => {
      mockLocation.search = "?utm_source=google&utm_medium=cpc";

      const { result } = renderHook(() => useUTMs({ autoCapture: true }));

      // Wait for useEffect to run
      act(() => {
        jest.runAllTimers();
      });

      expect(result.current.params).toEqual({
        utm_source: "google",
        utm_medium: "cpc",
      });
    });

    test("should not auto-capture when disabled", () => {
      mockLocation.search = "?utm_source=google&utm_medium=cpc";

      const { result } = renderHook(() => useUTMs({ autoCapture: false }));

      // Wait for useEffect to run
      act(() => {
        jest.runAllTimers();
      });

      expect(result.current.params).toEqual({});
    });

    test("should manually capture UTMs from URL", () => {
      mockLocation.search = "?utm_source=google&utm_medium=cpc";

      const { result } = renderHook(() => useUTMs());

      act(() => {
        result.current.captureFromURL();
      });

      expect(result.current.params).toEqual({
        utm_source: "google",
        utm_medium: "cpc",
      });
    });
  });

  describe("Configuration and Callbacks", () => {
    test("should call onUpdate when UTMs change", () => {
      const onUpdate = jest.fn();
      const { result } = renderHook(() => useUTMs({ onUpdate }));

      act(() => {
        result.current.setParam("utm_source", "google");
      });

      expect(onUpdate).toHaveBeenCalledWith({
        utm_source: "google",
      });
    });

    test("should respect attribution strategy", () => {
      const { result } = renderHook(() => useUTMs({ attribution: "first" }));

      act(() => {
        result.current.setParam("utm_source", "google");
      });

      act(() => {
        result.current.setParam("utm_source", "facebook");
      });

      expect(result.current.getParam("utm_source")).toBe("google");
    });
  });

  describe("Error Handling", () => {
    test("should handle invalid UTM parameters gracefully", () => {
      const consoleError = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const { result } = renderHook(() => useUTMs());

      act(() => {
        result.current.setParam("invalid_param", "value");
      });

      expect(result.current.params).toEqual({});
      expect(consoleError).toHaveBeenCalled();

      consoleError.mockRestore();
    });
  });
});
