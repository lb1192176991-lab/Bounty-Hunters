import { describe, expect, it } from "vitest";

import { isLoopbackHostname, resolveDevRedirectUrl } from "./http.ts";

describe("http dev routing", () => {
  it("treats localhost and loopback addresses as local", () => {
    expect(isLoopbackHostname("127.0.0.1")).toBe(true);
    expect(isLoopbackHostname("localhost")).toBe(true);
    expect(isLoopbackHostname("::1")).toBe(true);
    expect(isLoopbackHostname("[::1]")).toBe(true);
  });

  it("does not treat LAN addresses as local", () => {
    expect(isLoopbackHostname("192.168.86.35")).toBe(false);
    expect(isLoopbackHostname("10.0.0.24")).toBe(false);
    expect(isLoopbackHostname("example.local")).toBe(false);
  });

  it("preserves path and query when redirecting to the dev server", () => {
    const devUrl = new URL("http://127.0.0.1:5173/");
    const requestUrl = new URL("http://127.0.0.1:3774/pair?token=test-token");

    expect(resolveDevRedirectUrl(devUrl, requestUrl)).toBe(
      "http://127.0.0.1:5173/pair?token=test-token",
    );
  });
});

describe("request body size limiting", () => {
  it("default max body size is 10 MB for regular routes", () => {
    const { DEFAULT_MAX_BODY_SIZE, resolveMaxBodySize } = await import("./http.ts");
    expect(DEFAULT_MAX_BODY_SIZE).toBe(10 * 1024 * 1024);
    expect(resolveMaxBodySize("/api/auth/session")).toBe(DEFAULT_MAX_BODY_SIZE);
    expect(resolveMaxBodySize("/api/orchestration/snapshot")).toBe(DEFAULT_MAX_BODY_SIZE);
    expect(resolveMaxBodySize("/api/unknown/route")).toBe(DEFAULT_MAX_BODY_SIZE);
    expect(resolveMaxBodySize("/")).toBe(DEFAULT_MAX_BODY_SIZE);
  });

  it("upload route max body size is 50 MB", () => {
    const { DEFAULT_UPLOAD_MAX_BODY_SIZE, resolveMaxBodySize } = await import("./http.ts");
    expect(DEFAULT_UPLOAD_MAX_BODY_SIZE).toBe(50 * 1024 * 1024);
    expect(resolveMaxBodySize("/api/attachments/some-file.png")).toBe(DEFAULT_UPLOAD_MAX_BODY_SIZE);
    expect(resolveMaxBodySize("/api/attachments/")).toBe(DEFAULT_UPLOAD_MAX_BODY_SIZE);
    expect(resolveMaxBodySize("/api/attachments")).toBe(DEFAULT_UPLOAD_MAX_BODY_SIZE);
  });

  it("per-route overrides work for custom routes", () => {
    const { PER_ROUTE_MAX_BODY_SIZES, resolveMaxBodySize } = await import("./http.ts");
    expect(PER_ROUTE_MAX_BODY_SIZES.size).toBeGreaterThanOrEqual(1);
    expect(resolveMaxBodySize("/api/attachments/test.pdf")).toBe(50 * 1024 * 1024);
  });

  it("withBodySizeLimit is a function", () => {
    const { withBodySizeLimit } = await import("./http.ts");
    expect(typeof withBodySizeLimit).toBe("function");
  });

  it("all required exports are present", () => {
    const mod = await import("./http.ts");
    expect(mod.withBodySizeLimit).toBeDefined();
    expect(mod.resolveMaxBodySize).toBeDefined();
    expect(mod.DEFAULT_MAX_BODY_SIZE).toBeDefined();
    expect(mod.DEFAULT_UPLOAD_MAX_BODY_SIZE).toBeDefined();
    expect(mod.PER_ROUTE_MAX_BODY_SIZES).toBeDefined();
    expect(mod.UPLOAD_ROUTE_PATTERNS).toBeDefined();
  });
});
