import { describe, expect, it } from "bun:test";
import { validateStoreSettings } from "../src/modules/ecommerce/store-settings/store-settings.service";

const valid = {
  storeName: " Northstar ",
  supportEmail: " support@example.test ",
  supportPhone: " +8801700000000 ",
  defaultCurrency: "bdt",
  orderNumberPrefix: "web-1",
  reservationDurationMinutes: 30,
  checkoutEnabled: true,
  checkoutNotice: "  Welcome  ",
};

describe("store settings rules", () => {
  it("normalizes editable settings", () => {
    expect(validateStoreSettings(valid)).toMatchObject({
      storeName: "Northstar",
      supportEmail: "support@example.test",
      supportPhone: "+8801700000000",
      defaultCurrency: "BDT",
      orderNumberPrefix: "WEB-1",
      checkoutNotice: "Welcome",
    });
  });

  it("rejects invalid currency, prefix, and reservation duration", () => {
    expect(() => validateStoreSettings({ ...valid, defaultCurrency: "US" })).toThrow("Currency");
    expect(() => validateStoreSettings({ ...valid, orderNumberPrefix: "bad prefix" })).toThrow("Order prefix");
    expect(() => validateStoreSettings({ ...valid, reservationDurationMinutes: 0 })).toThrow("Reservation duration");
    expect(() => validateStoreSettings({ ...valid, reservationDurationMinutes: 1441 })).toThrow("Reservation duration");
  });
});
