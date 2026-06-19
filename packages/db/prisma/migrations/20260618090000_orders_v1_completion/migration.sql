-- Ecommerce orders V1 completion: structured addresses, shipping rates,
-- checkout idempotency, payment method, and inventory lifecycle.

CREATE TYPE "OrderInventoryStatus" AS ENUM ('reserved', 'committed', 'released', 'restocked');
CREATE TYPE "PaymentMethod" AS ENUM ('cash_on_delivery', 'manual_bank', 'manual_mobile', 'online_gateway');
CREATE TYPE "OrderAddressType" AS ENUM ('shipping', 'billing');

CREATE TABLE "shipping_rate" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "freeOverAmount" DECIMAL(12,2),
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "shipping_rate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "shipping_rate_code_key" ON "shipping_rate"("code");
CREATE INDEX "shipping_rate_isActive_idx" ON "shipping_rate"("isActive");
CREATE INDEX "shipping_rate_isDefault_idx" ON "shipping_rate"("isDefault");
CREATE INDEX "shipping_rate_sortOrder_idx" ON "shipping_rate"("sortOrder");

ALTER TABLE "order"
  DROP COLUMN IF EXISTS "billingAddress",
  DROP COLUMN IF EXISTS "shippingAddress",
  ADD COLUMN "checkoutKey" TEXT,
  ADD COLUMN "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'cash_on_delivery',
  ADD COLUMN "inventoryStatus" "OrderInventoryStatus" NOT NULL DEFAULT 'reserved',
  ADD COLUMN "stockReservedUntil" TIMESTAMP(3),
  ADD COLUMN "stockCommittedAt" TIMESTAMP(3),
  ADD COLUMN "stockReleasedAt" TIMESTAMP(3),
  ADD COLUMN "shippingRateId" TEXT,
  ADD COLUMN "shippingMethodCode" TEXT,
  ADD COLUMN "shippingMethodLabel" TEXT;

CREATE UNIQUE INDEX "order_checkoutKey_key" ON "order"("checkoutKey");
CREATE INDEX "order_inventoryStatus_idx" ON "order"("inventoryStatus");
CREATE INDEX "order_paymentMethod_idx" ON "order"("paymentMethod");
CREATE INDEX "order_shippingRateId_idx" ON "order"("shippingRateId");

ALTER TABLE "order"
  ADD CONSTRAINT "order_shippingRateId_fkey"
  FOREIGN KEY ("shippingRateId") REFERENCES "shipping_rate"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "order_address" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "type" "OrderAddressType" NOT NULL,
  "fullName" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "line1" TEXT NOT NULL,
  "line2" TEXT,
  "city" TEXT,
  "state" TEXT,
  "postalCode" TEXT,
  "country" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "order_address_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "order_address_orderId_type_key" ON "order_address"("orderId", "type");
CREATE INDEX "order_address_type_idx" ON "order_address"("type");

ALTER TABLE "order_address"
  ADD CONSTRAINT "order_address_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "order"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "order_line_item"
  ADD COLUMN "attributesSnapshot" JSONB;
