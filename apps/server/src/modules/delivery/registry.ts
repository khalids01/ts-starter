import {
  requireCourierCapability,
  type CourierCapability,
  type CourierProviderAdapter,
} from "./provider";

export class UnknownCourierProviderError extends Error {
  constructor(readonly providerCode: string) {
    super(`Courier provider ${providerCode} is not registered`);
  }
}

export class CourierProviderRegistry {
  private readonly adapters = new Map<string, CourierProviderAdapter>();

  register(adapter: CourierProviderAdapter) {
    const code = adapter.code.trim().toLowerCase();
    if (!/^[a-z][a-z0-9_-]*$/.test(code) || code !== adapter.code) {
      throw new Error(
        "Courier provider codes must be normalized lowercase identifiers",
      );
    }
    if (this.adapters.has(code)) {
      throw new Error(`Courier provider ${code} is already registered`);
    }
    this.adapters.set(code, adapter);
    return this;
  }

  get(providerCode: string) {
    const code = providerCode.trim().toLowerCase();
    const adapter = this.adapters.get(code);
    if (!adapter) throw new UnknownCourierProviderError(code);
    return adapter;
  }

  require(providerCode: string, capability: CourierCapability) {
    const adapter = this.get(providerCode);
    requireCourierCapability(adapter, capability);
    return adapter;
  }

  list() {
    return [...this.adapters.values()];
  }
}
