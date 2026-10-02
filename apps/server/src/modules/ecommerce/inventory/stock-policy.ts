import type { Prisma } from "@db/server";

type Batch = { expiryDate?: Date | string | null; disposition?: string };
type Stock = {
  id?: string;
  batchId?: string | null;
  batch?: Batch | null;
  location?: { isActive: boolean };
  quantityOnHand: number;
  quantityReserved: number;
};

/** Exclusive instant: at expiryDate the batch is already unavailable. Undated stock is allowed. */
export function batchSellable(
  batch: Batch | null | undefined,
  now = new Date(),
) {
  if (!batch) return true;
  if (batch.disposition && batch.disposition !== "sellable") return false;
  if (!batch.expiryDate) return true;
  const expiry = new Date(batch.expiryDate).getTime();
  return Number.isFinite(expiry) && expiry > now.getTime();
}

export function stockSellable(stock: Stock, now = new Date()) {
  return (
    stock.location?.isActive !== false &&
    (!stock.batchId || Boolean(stock.batch)) &&
    batchSellable(stock.batch, now)
  );
}

export function eligibleStockWhere(
  now = new Date(),
): Prisma.InventoryStockWhereInput {
  return {
    location: { isActive: true },
    OR: [
      { batchId: null },
      {
        batch: {
          disposition: "sellable",
          OR: [{ expiryDate: null }, { expiryDate: { gt: now } }],
        },
      },
    ],
  };
}

export function availableStockQuantity(stocks: Stock[] = [], now = new Date()) {
  return stocks.reduce(
    (sum, stock) =>
      sum +
      (stockSellable(stock, now)
        ? Math.max(0, stock.quantityOnHand - stock.quantityReserved)
        : 0),
    0,
  );
}

export function expiryOrderedStocks<T extends Stock>(
  stocks: T[],
  now = new Date(),
) {
  return stocks
    .filter((stock) => stockSellable(stock, now))
    .sort((a, b) => {
      const left = a.batch?.expiryDate
        ? new Date(a.batch.expiryDate).getTime()
        : Infinity;
      const right = b.batch?.expiryDate
        ? new Date(b.batch.expiryDate).getTime()
        : Infinity;
      return (
        (left === right ? 0 : left < right ? -1 : 1) ||
        (a.id ?? "").localeCompare(b.id ?? "")
      );
    });
}

export async function orderHasUnsafeCommittedStock(
  db: Pick<Prisma.TransactionClient, "stockReservation">,
  orderId: string,
  now = new Date(),
) {
  return Boolean(
    await db.stockReservation.findFirst({
      where: {
        referenceType: "order",
        referenceId: orderId,
        status: "committed",
        OR: [
          { location: { isActive: false } },
          {
            batch: {
              OR: [
                { expiryDate: { lte: now } },
                { disposition: { not: "sellable" } },
              ],
            },
          },
        ],
      },
    }),
  );
}
