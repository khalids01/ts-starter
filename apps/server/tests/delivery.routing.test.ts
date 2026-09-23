import { describe, expect, it } from "bun:test";
import { rankCourierRoutes } from "../src/modules/delivery/routing";

const request = {
  shippingMethodId: "standard",
  country: "BD",
  city: "Dhaka",
  paymentKind: "cod" as const,
  outstandingCodAmount: 1000,
};
const connections = [
  { id: "a", displayName: "Connection A", enabled: true, health: "healthy" as const, priority: 10 },
  { id: "b", displayName: "Connection B", enabled: true, health: "healthy" as const, priority: 1 },
];
const services = connections.map((connection) => ({ id: `service-${connection.id}`, connectionId: connection.id, enabled: true, shippingMethodIds: ["standard"] }));
const rules = [
  { id: "first", version: 2, priority: 1, enabled: true, connectionId: "a", serviceId: "service-a", countries: ["BD"] },
  { id: "second", version: 1, priority: 2, enabled: true, connectionId: "b", serviceId: "service-b", countries: ["BD"] },
];

describe("delivery routing", () => {
  it("ranks matching rules deterministically before connection priority", () => {
    const result = rankCourierRoutes({ request, connections, services, rules });
    expect(result.candidates.map((candidate) => candidate.ruleId)).toEqual(["first", "second"]);
    expect(result.evaluatedRules).toEqual([{ id: "first", version: 2 }, { id: "second", version: 1 }]);
  });

  it("fails closed for unhealthy connections and inconsistent COD", () => {
    const unhealthy = connections.map((connection) => ({ ...connection, health: "auth_failed" as const }));
    expect(rankCourierRoutes({ request, connections: unhealthy, services, rules }).candidates).toEqual([]);
    expect(rankCourierRoutes({ request: { ...request, paymentKind: "prepaid" }, connections, services, rules }).candidates).toEqual([]);
  });

  it("requires known weight when a rule sets a weight limit", () => {
    const result = rankCourierRoutes({ request, connections, services, rules: [{ ...rules[0]!, maximumWeightGrams: 500 }] });
    expect(result.candidates).toEqual([]);
  });
});
