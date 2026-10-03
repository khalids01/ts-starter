import http from "k6/http";
import { check } from "k6";
import { Trend, Counter } from "k6/metrics";

if (__ENV.STEP13_LOAD_APPROVED !== "true") throw new Error("Explicit Step 13 load target/profile approval required");
if (!/^[a-f0-9-]{36}$/.test(__ENV.STEP13_LOAD_EXECUTION_ID ?? "")) throw new Error("Unique capacity execution identity required");
if (__ENV.STEP13_LOAD_TARGET !== "http://localhost:3013") throw new Error("Only the reviewed isolated localhost API is supported");
const fixture = JSON.parse(open(__ENV.STEP13_LOAD_FIXTURES));
if (fixture.datasetVersion !== 1 || !/^e2e_v3_step13_capacity_/.test(fixture.databaseName) || fixture.target !== __ENV.STEP13_LOAD_TARGET ||
    !/^[a-z0-9_-]{1,32}$/.test(fixture.runId ?? "") || !fixture.adminEmail?.endsWith(".example.test") || !fixture.shopperEmails?.length ||
    !fixture.checkoutVariants?.length || !fixture.shippingRateId || !fixture.adminSessionCookie ||
    !fixture.customerIds?.length || !fixture.orderIds?.length || !fixture.productIds?.length || !fixture.productSlugs?.length ||
    fixture.shopperEmails.some((email) => !email.endsWith(".example.test"))) throw new Error("A verified versioned fictional capacity fixture manifest is required");
const profiles = {
  smoke: { journey: true, adminRate: 1, checkoutRate: 1 },
  volume: { volume: true, adminRate: 1, checkoutRate: 0 },
  expected: { publicRate: 25, adminRate: 2, checkoutRate: 1, duration: "15m", checkoutUnit: "1s" },
  peak: { publicRate: 100, adminRate: 0, checkoutRate: 5, duration: "2m", checkoutUnit: "1s" },
  soak: { publicRate: 10, adminRate: 0, checkoutRate: 1, duration: "60m", checkoutUnit: "5s" },
};
const profile = profiles[__ENV.STEP13_LOAD_PROFILE];
if (!profile) throw new Error("Choose a reviewed smoke, volume, expected, peak or soak profile");
const catalog = new Trend("catalog_ms", true), admin = new Trend("admin_ms", true), checkout = new Trend("checkout_ms", true);
const persisted = new Counter("checkout_persisted");
const params = { redirects: 0, timeout: "10s" };
const position = () => (__VU + __ITER);
function arrival(exec, rate, timeUnit, preAllocatedVUs, maxVUs) {
  return { executor: "constant-arrival-rate", exec, rate, timeUnit, duration: profile.duration, preAllocatedVUs, maxVUs };
}
export const options = {
  summaryTrendStats: ["avg", "min", "med", "max", "p(90)", "p(95)", "p(99)"],
  scenarios: profile.journey ? { journey: { executor: "shared-iterations", exec: "journey", vus: 1, iterations: 1, maxDuration: "2m" } } :
    profile.volume ? { volume: { executor: "shared-iterations", exec: "volume", vus: 1, iterations: 20, maxDuration: "5m" } } : {
      public: arrival("browse", profile.publicRate, "1s", 50, 200),
      checkout: arrival("buy", profile.checkoutRate, profile.checkoutUnit, 10, 40),
      ...(profile.adminRate ? { admin: arrival("readAdmin", profile.adminRate, "1s", 5, 20) } : {}),
    },
  thresholds: {
    http_req_failed: ["rate<0.01"], checks: ["rate==1"], dropped_iterations: ["count==0"], catalog_ms: ["p(95)<500"],
    ...(profile.adminRate ? { admin_ms: ["p(95)<750"] } : {}),
    ...(profile.checkoutRate ? { checkout_ms: ["p(95)<1500", "p(99)<3000"], checkout_persisted: ["count>0"] } : {}),
  },
};
function browsePath(index) {
  const slug = fixture.productSlugs[position() % fixture.productSlugs.length];
  return ["/shop/products?limit=10&page=1", "/shop/products?limit=10&page=1&search=Fictional", `/shop/products/${slug}`, "/shop/categories", "/shop/filters", "/shop/shipping-rates"][index % 6];
}
function adminPath(index) {
  const p = position();
  return ["/admin/orders?page=1&limit=20", `/admin/orders/${fixture.orderIds[p % fixture.orderIds.length]}`,
    "/admin/customers?page=1&limit=20", `/admin/customers/${fixture.customerIds[p % fixture.customerIds.length]}`,
    "/admin/products?page=1&limit=20", `/admin/products/${fixture.productIds[p % fixture.productIds.length]}`,
    "/admin/inventory/stocks?page=1&limit=20", "/admin/inventory/movements?page=1&limit=20", "/admin/visitors?page=1&limit=20", "/admin/activity?page=1&limit=20"][index % 10];
}
function publicRead(index) {
  const response = http.get(fixture.target + browsePath(index), { ...params, tags: { operation: "catalog" } });
  catalog.add(response.timings.duration);
  check(response, { "catalog succeeds": (r) => r.status === 200 });
}
function adminRead(index) {
  const response = http.get(fixture.target + adminPath(index), { ...params, headers: { cookie: fixture.adminSessionCookie }, tags: { operation: "admin" } });
  admin.add(response.timings.duration);
  check(response, { "admin read succeeds": (r) => r.status === 200 });
}
export function browse() { publicRead(position()); }
export function readAdmin() { adminRead(position()); }
export function buy() {
  const variant = fixture.checkoutVariants[position() % fixture.checkoutVariants.length];
  const email = fixture.shopperEmails[position() % fixture.shopperEmails.length];
  const response = http.post(fixture.target + "/shop/checkout", JSON.stringify({
    items: [{ variantId: variant.id, quantity: 1 }], customerName: "Fictional capacity buyer", customerEmail: email,
    customerPhone: "01700000000", shippingAddress: { fullName: "Fictional capacity buyer", phone: "01700000000", line1: "1 Fictional Road", city: "Dhaka", postalCode: "1205", country: "Bangladesh" },
    shippingRateId: fixture.shippingRateId, foodSlotId: variant.foodSlotId, paymentMethod: "cash_on_delivery",
    idempotencyKey: `${fixture.runId}:${__ENV.STEP13_LOAD_EXECUTION_ID}:${__VU}:${__ITER}`,
  }), { ...params, headers: { "content-type": "application/json" }, tags: { operation: "checkout" } });
  checkout.add(response.timings.duration);
  let orderId;
  try { orderId = response.json("orderId"); } catch {}
  const success = response.status === 200 && !!orderId;
  persisted.add(success ? 1 : 0);
  check(response, { "checkout persists": () => success });
}
export function volume() {
  for (let n = 0; n < 6; n++) publicRead(n);
  for (let n = 0; n < 10; n++) adminRead(n);
}
export function journey() { volume(); buy(); }
export function handleSummary(data) {
  return { [__ENV.STEP13_LOAD_SUMMARY]: JSON.stringify({ metrics: data, checkoutPersisted: data.metrics.checkout_persisted?.values?.count ?? 0 }, null, 2) };
}
