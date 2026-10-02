import { expect, it } from "bun:test";
import {
  batchSellable,
  availableStockQuantity,
  expiryOrderedStocks,
} from "../src/modules/ecommerce/inventory/stock-policy";
const now = new Date("2026-10-03T00:00:00Z");
const stock = (
  id: string,
  expiryDate: string | null,
  disposition = "sellable",
) => ({
  id,
  batchId: id,
  batch: { expiryDate, disposition },
  quantityOnHand: 5,
  quantityReserved: 1,
  location: { isActive: true },
});
it("expiry instant is exclusive, including equivalent timezone offsets", () => {
  expect(batchSellable({ expiryDate: "2026-10-03T06:00:00+06:00" }, now)).toBe(
    false,
  );
  expect(batchSellable({ expiryDate: "2026-10-03T00:00:00.001Z" }, now)).toBe(
    true,
  );
  expect(batchSellable({ expiryDate: "invalid" }, now)).toBe(false);
});
it("availability excludes expired, quarantined, unsafe and inactive stock", () => {
  expect(
    availableStockQuantity(
      [
        stock("expired", "2026-10-02"),
        stock("quarantine", null, "quarantined"),
        stock("unsafe", null, "unsafe"),
        { ...stock("inactive", null), location: { isActive: false } },
        stock("valid", "2026-10-04"),
      ],
      now,
    ),
  ).toBe(4);
});
it("FEFO is deterministic with undated gadgets last", () => {
  const rows = [
    stock("undated", null),
    stock("b", "2026-10-04"),
    stock("later", "2026-10-05"),
    stock("a", "2026-10-04"),
    stock("expired", "2026-10-02"),
  ];
  expect(expiryOrderedStocks(rows, now).map((s) => s.id)).toEqual([
    "a",
    "b",
    "later",
    "undated",
  ]);
  expect(rows[0]?.id).toBe("undated");
});
it("missing known batch fails closed and reservations cannot produce negative availability", () => {
  expect(
    availableStockQuantity(
      [{ quantityOnHand: 1, quantityReserved: 0, batchId: "missing" }],
      now,
    ),
  ).toBe(0);
  expect(
    availableStockQuantity(
      [{ quantityOnHand: 1, quantityReserved: 2, batchId: null }],
      now,
    ),
  ).toBe(0);
});
