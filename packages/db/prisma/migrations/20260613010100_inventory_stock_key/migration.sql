ALTER TABLE "inventory_stock" ADD COLUMN "stockKey" TEXT;

UPDATE "inventory_stock"
SET "stockKey" = "variantId" || ':' || "locationId" || ':' || COALESCE("batchId", 'no_batch')
WHERE "stockKey" IS NULL;

ALTER TABLE "inventory_stock" ALTER COLUMN "stockKey" SET NOT NULL;

CREATE UNIQUE INDEX "inventory_stock_stockKey_key" ON "inventory_stock"("stockKey");
