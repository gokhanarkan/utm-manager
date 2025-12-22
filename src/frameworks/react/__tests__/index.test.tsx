import { renderHook, act, waitFor } from "@testing-library/react";
import { useUTMs } from "../index";
import { clearCookieStorage } from "../../../utils/cookie";

// Mock window.location
const originalLocation = window.location;

beforeAll(() => {
  // @ts-expect-error - mocking window.location
  delete window.location;
  window.location = { ...originalLocation, search: "" } as Location;
});

afterAll(() => {
  window.location = originalLocation;
});

describe("useUTMs Hook", () => {
  beforeEach(() => {
    clearCookieStorage();
    window.location.search = "";
  });

  describe("Basic Functionality", () => {
    test("should initialize with empty params", () => {
      const { result } = renderHook(() => useUTMs());
      expect(result.current.params).toEqual({});
    });

    test("should set and get individual UTM parameters", async () => {
      const { result } = renderHook(() => useUTMs());

      act(() => {
        result.current.setParam("utm_source", "google");
      });

      await waitFor(() => {
        expect(result.current.params.utm_source).toBe("google");
      });
    });

    test("should set multiple UTM parameters", async () => {
      const { result } = renderHook(() => useUTMs());

      act(() => {
        result.current.setParams({
          utm_source: "google",
          utm_medium: "cpc",
        });
      });

      await waitFor(() => {
        expect(result.current.params.utm_source).toBe("google");
        expect(result.current.params.utm_medium).toBe("cpc");
      });
    });
  });

  describe("Auto-capture Functionality", () => {
    test("should auto-capture UTMs from URL when enabled", async () => {
      window.location.search = "?utm_source=google&utm_medium=cpc";

      const { result } = renderHook(() => useUTMs({ autoCapture: true }));

      await waitFor(() => {
        expect(result.current.params.utm_source).toBe("google");
        expect(result.current.params.utm_medium).toBe("cpc");
      });
    });

    test("should not auto-capture when disabled", () => {
      window.location.search = "?utm_source=google&utm_medium=cpc";

      const { result } = renderHook(() => useUTMs({ autoCapture: false }));

      expect(result.current.params).toEqual({});
    });

    test("should manually capture UTMs from URL", async () => {
      window.location.search = "?utm_source=google&utm_medium=cpc";

      const { result } = renderHook(() => useUTMs());

      act(() => {
        result.current.captureFromURL();
      });

      await waitFor(() => {
        expect(result.current.params.utm_source).toBe("google");
        expect(result.current.params.utm_medium).toBe("cpc");
      });
    });
  });

  describe("Configuration and Callbacks", () => {
    test("should call onUpdate when UTMs change", async () => {
      const onUpdate = jest.fn();
      const { result } = renderHook(() => useUTMs({ onUpdate }));

      act(() => {
        result.current.setParam("utm_source", "google");
      });

      await waitFor(() => {
        expect(onUpdate).toHaveBeenCalled();
      });
    });

    test("should respect attribution strategy", async () => {
      const { result } = renderHook(() => useUTMs({ attribution: "first" }));

      act(() => {
        result.current.setParam("utm_source", "google");
      });

      await waitFor(() => {
        expect(result.current.params.utm_source).toBe("google");
      });

      act(() => {
        result.current.setParam("utm_source", "facebook");
      });

      // First touch - should keep original value
      expect(result.current.params.utm_source).toBe("google");
    });
  });

  describe("Error Handling", () => {
    test("should handle invalid UTM parameters gracefully", async () => {
      const consoleError = jest
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      const { result } = renderHook(() => useUTMs());

      act(() => {
        result.current.setParam("invalid_param", "value");
      });

      expect(result.current.params.invalid_param).toBeUndefined();
      expect(consoleError).toHaveBeenCalled();

      consoleError.mockRestore();
    });
  });
});
