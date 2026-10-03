import { expect, request, test } from "@playwright/test";
import { serverUrl, body } from "../fixtures/v3";
import { TEST_USERS } from "../../users-config";
const actions: [string, string, unknown][] = [
  ["post", "/admin/delivery/dispatches/forbidden/queue", {}],
  [
    "post",
    "/admin/delivery/consignments/forbidden/handoff",
    { state: "handed_to_courier", note: "Fictional" },
  ],
  ["patch", "/admin/delivery/returns/forbidden", { state: "completed" }],
  [
    "post",
    "/admin/orders/forbidden/payments/forbidden/reverse",
    { note: "Fictional correction" },
  ],
  ["patch", "/admin/orders/forbidden/status", { orderStatus: "completed" }],
  [
    "post",
    "/admin/orders/forbidden/ship",
    { carrier: "Fictional", trackingNumber: "fictional" },
  ],
  ["delete", "/admin/orders/forbidden/units/forbidden", undefined],
  [
    "patch",
    "/admin/orders/forbidden/warranty-claims/forbidden",
    { state: "approved", resolution: "Fictional review" },
  ],
  [
    "post",
    "/admin/orders/food-slots",
    {
      label: "Fictional",
      postalCodes: ["1205"],
      startsAt: "2099-01-01T02:00:00.000Z",
      endsAt: "2099-01-01T03:00:00.000Z",
      cutoffAt: "2099-01-01T01:00:00.000Z",
      capacityUnits: 1,
    },
  ],
  ["delete", "/admin/orders/food-slots/forbidden", undefined],
  [
    "patch",
    "/admin/orders/forbidden",
    { adminNotes: "Fictional private note" },
  ],
  [
    "post",
    "/admin/orders/forbidden/preparation",
    { state: "preparing", note: "Fictional" },
  ],
  [
    "post",
    "/admin/orders/forbidden/units",
    { lineItemId: "forbidden", unitId: "forbidden" },
  ],
  [
    "post",
    "/admin/orders/forbidden/warranty-claims",
    { allocationId: "forbidden", reference: "fictional", issue: "Fictional" },
  ],
  [
    "post",
    "/admin/inventory/units",
    { variantId: "forbidden", locationId: "forbidden", serial: "FICTIONAL" },
  ],
  [
    "post",
    "/admin/orders/forbidden/payments",
    {
      amount: "1.00",
      currency: "BDT",
      method: "manual_bank",
      reference: "fictional",
      note: "Fictional",
    },
  ],
  ["post", "/admin/orders/forbidden/cancel", { reason: "Fictional" }],
  [
    "post",
    "/admin/orders/forbidden/refunds",
    { amount: "1.00", reason: "Fictional" },
  ],
  [
    "post",
    "/admin/orders/forbidden/recovery",
    { allItemsReceived: true, note: "Fictional" },
  ],
  [
    "patch",
    "/admin/orders/forbidden/recovery",
    { disposition: "sellable", note: "Fictional" },
  ],
  ["post", "/admin/orders/forbidden/recovery/restock", { note: "Fictional" }],
  [
    "post",
    "/admin/delivery/orders/forbidden/confirm",
    {
      connectionId: "forbidden",
      serviceId: "forbidden",
      overrideReason: "Fictional",
    },
  ],
  [
    "post",
    "/admin/delivery/consignments/forbidden/retry-hold",
    { note: "Fictional" },
  ],
  [
    "post",
    "/admin/delivery/consignments/forbidden/reconcile-booking",
    {
      invoice: "fictional",
      externalId: "fictional",
      providerState: "pending",
      note: "Fictional",
    },
  ],
  [
    "post",
    "/admin/delivery/consignments/forbidden/pickup",
    {
      addressId: 1,
      policeStationId: 1,
      address: "Fictional",
      contactNumber: "01700000000",
    },
  ],
  [
    "post",
    "/admin/delivery/returns",
    { consignmentId: "forbidden", reason: "Fictional" },
  ],
  ["post", "/admin/delivery/returns/forbidden/submit", {}],
  [
    "post",
    "/admin/delivery/settlements",
    {
      consignmentId: "forbidden",
      externalId: "fictional",
      amount: "1.00",
      currency: "BDT",
      note: "Fictional",
    },
  ],
  [
    "patch",
    "/admin/inventory/batches/forbidden/disposition",
    { disposition: "unsafe", reason: "Fictional" },
  ],
];
test("read-only, ordinary and anonymous accounts cannot mutate custody or money; secrets remain private", async ({
  page,
}) => {
  for (const key of ["commerceViewer", "user", null] as const) {
    const api = await request.newContext({
      baseURL: serverUrl,
      storageState: key
        ? TEST_USERS[key].storageStatePath
        : { cookies: [], origins: [] },
    });
    try {
      for (const [method, path, data] of actions) {
        const response = await api.fetch(path, {
          method: method.toUpperCase(),
          data,
        });
        expect(
          [401, 403],
          `${key ?? "anonymous"}: ${path} returned ${response.status()}`,
        ).toContain(response.status());
      }
    } finally {
      await api.dispose();
    }
  }
  const connections = await body(
    await page.request.get(serverUrl + "/admin/delivery/connections"),
  );
  expect(JSON.stringify(connections)).not.toContain("step11-fictional-key");
  expect(JSON.stringify(connections)).not.toContain("step11-fictional-secret");
  expect(JSON.stringify(connections)).not.toContain("credentialCiphertext");
});
