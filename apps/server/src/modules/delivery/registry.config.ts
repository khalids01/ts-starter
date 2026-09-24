import { SteadfastCourierAdapter } from "./providers/steadfast";
import { CourierProviderRegistry } from "./registry";

export function createCourierProviderRegistry() {
  return new CourierProviderRegistry().register(new SteadfastCourierAdapter());
}
