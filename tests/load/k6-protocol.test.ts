import { expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

function scenario(profile = "expected", invalidResponse = false) {
  const sent: { body: any }[] = [], checks: boolean[] = [];
  const fixture = { datasetVersion: 1, runId: "fictional", databaseName: "e2e_v3_step13_capacity_unit", target: "http://localhost:3013", adminEmail: "owner@northstar.example.test", adminSessionCookie: "fictional-cookie", shopperEmails: ["buyer@northstar.example.test"], checkoutVariants: [{ id: "fresh-variant", foodSlotId: "fictional-food-slot" }], shippingRateId: "fictional-shipping", customerIds: ["customer"], orderIds: ["order"], productIds: ["product"], productSlugs: ["product-slug"] };
  const context: any = { __VU: 1, __ITER: 0, __ENV: { STEP13_LOAD_APPROVED: "true", STEP13_LOAD_EXECUTION_ID: "00000000-0000-4000-8000-000000000000", STEP13_LOAD_TARGET: fixture.target, STEP13_LOAD_PROFILE: profile, STEP13_LOAD_FIXTURES: "fictional", STEP13_LOAD_SUMMARY: "fictional-summary" },
    open: () => JSON.stringify(fixture), Trend: class { add() {} }, Counter: class { add() {} },
    http: { post: (_url: string, body: string) => { sent.push({ body: JSON.parse(body) }); return { status: invalidResponse ? 500 : 200, timings: { duration: 1 }, json: () => { if (invalidResponse) throw new Error("malformed body"); return "fictional-order"; } }; } },
    check: (response: unknown, assertions: Record<string, (r: unknown) => boolean>) => { checks.push(...Object.values(assertions).map((fn) => fn(response))); },
  };
  const source = readFileSync("tests/load/step13-k6.js", "utf8").replace(/^import .*;\n/gm, "").replace(/export function /g, "function ").replace("export const options =", "var options =");
  runInNewContext(source, context);
  return { context, sent, checks };
}
it("fresh-food checkout carries its slot and unique execution identity", () => {
  const { context, sent, checks } = scenario(); context.buy();
  expect(sent[0]?.body.foodSlotId).toBe("fictional-food-slot");
  expect(sent[0]?.body.idempotencyKey).toBe("fictional:00000000-0000-4000-8000-000000000000:1:0");
  expect(checks).toEqual([true]);
  const result = context.handleSummary({ metrics: { checkout_persisted: { values: { count: 3 } } } });
  expect(JSON.parse(result["fictional-summary"]).checkoutPersisted).toBe(3);
});
it("records malformed checkout responses as failures and avoids unsampled admin thresholds", () => {
  const { context, checks } = scenario("peak", true);
  context.buy();
  expect(checks).toEqual([false]);
  expect(context.options.thresholds.admin_ms).toBeUndefined();
  expect(context.options.scenarios.admin).toBeUndefined();
  expect(context.options.scenarios.public.rate).toBe(100);
});
