import { describe, expect, it } from "bun:test";
import type { CourierProviderAdapter } from "../src/modules/delivery/provider";
import {
  CourierProviderRegistry,
  UnknownCourierProviderError,
} from "../src/modules/delivery/registry";
import { redactCourierSecrets } from "../src/modules/delivery/redaction";

function adapter(code = "steadfast"): CourierProviderAdapter {
  return {
    code,
    capabilities: new Set(["createConsignment", "getConsignmentStatus"]),
    async healthCheck() {
      return { available: true };
    },
    async createConsignment(_credentials, request) {
      return {
        externalId: "1",
        invoice: request.invoice,
        trackingCode: null,
        providerState: "in_review",
      };
    },
    async getConsignmentStatus() {
      return { providerState: "pending" };
    },
  };
}

describe("courier provider registry", () => {
  it("registers and resolves adapters by normalized provider code", () => {
    const registry = new CourierProviderRegistry().register(adapter());
    expect(registry.get(" STEADFAST ").code).toBe("steadfast");
    expect(registry.require("steadfast", "createConsignment").code).toBe(
      "steadfast",
    );
  });

  it("rejects duplicates, invalid codes, unknown providers, and unsupported capabilities", () => {
    const registry = new CourierProviderRegistry().register(adapter());
    expect(() => registry.register(adapter())).toThrow("already registered");
    expect(() => new CourierProviderRegistry().register(adapter("Steadfast"))).toThrow(
      "normalized lowercase",
    );
    expect(() => registry.get("pathao")).toThrow(UnknownCourierProviderError);
    expect(() => registry.require("steadfast", "requestPickup")).toThrow(
      "does not support requestPickup",
    );
  });
});

describe("courier secret redaction", () => {
  it("redacts nested secrets while retaining operational fields", () => {
    expect(
      redactCourierSecrets({
        provider: "steadfast",
        apiKey: "api-secret",
        nested: {
          Secret_Key: "secret-secret",
          authorization: "Bearer secret",
          state: "healthy",
        },
      }),
    ).toEqual({
      provider: "steadfast",
      apiKey: "[REDACTED]",
      nested: {
        Secret_Key: "[REDACTED]",
        authorization: "[REDACTED]",
        state: "healthy",
      },
    });
  });
});
