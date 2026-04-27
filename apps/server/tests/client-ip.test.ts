import { describe, expect, it } from "bun:test";
import { getClientIp, getTrustedCountry } from "../src/lib/client-ip";

function request(headers?: HeadersInit) {
  return new Request("http://localhost/", { headers });
}

describe("client IP", () => {
  it("trusts proxy headers from private proxy peers", () => {
    const result = getClientIp({
      request: request({
        "x-forwarded-for": "203.0.113.20, 10.0.0.10",
      }),
      requestIP: () => ({ address: "10.0.0.10" }),
    });

    expect(result).toEqual({
      ip: "203.0.113.20",
      trustedProxyHeaders: true,
    });
  });

  it("ignores spoofed proxy headers from public peers", () => {
    const result = getClientIp({
      request: request({
        "x-forwarded-for": "203.0.113.20",
        "cf-connecting-ip": "203.0.113.30",
      }),
      requestIP: () => ({ address: "198.51.100.10" }),
    });

    expect(result).toEqual({
      ip: "198.51.100.10",
      trustedProxyHeaders: false,
    });
  });

  it("only reads country headers when proxy headers are trusted", () => {
    const headers = new Headers({
      "cf-ipcountry": "US",
    });

    expect(getTrustedCountry(headers, true)).toBe("US");
    expect(getTrustedCountry(headers, false)).toBeNull();
  });
});

