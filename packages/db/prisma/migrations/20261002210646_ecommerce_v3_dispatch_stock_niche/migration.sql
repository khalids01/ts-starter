-- CreateEnum
CREATE TYPE "ProductFulfillmentKind" AS ENUM ('standard', 'packaged_food', 'fresh_food', 'gadget', 'clothing');

-- CreateEnum
CREATE TYPE "SerialTrackingMode" AS ENUM ('none', 'serial', 'imei', 'serial_and_imei');

-- CreateEnum
CREATE TYPE "InventoryBatchDisposition" AS ENUM ('sellable', 'quarantined', 'unsafe');

-- AlterTable
ALTER TABLE "category" ADD COLUMN     "fulfillmentKind" "ProductFulfillmentKind" NOT NULL DEFAULT 'standard',
ADD COLUMN     "serialTracking" "SerialTrackingMode" NOT NULL DEFAULT 'none',
ADD COLUMN     "warrantyDays" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "courier_connection" ADD COLUMN     "cooldownUntil" TIMESTAMP(3),
ADD COLUMN     "dispatchLeaseToken" TEXT,
ADD COLUMN     "dispatchLeaseUntil" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "courier_operation" ADD COLUMN     "leaseToken" TEXT;

-- AlterTable
ALTER TABLE "inventory_batch" ADD COLUMN     "disposition" "InventoryBatchDisposition" NOT NULL DEFAULT 'sellable';

-- AlterTable
ALTER TABLE "order_line_item" ADD COLUMN     "fulfillmentKind" "ProductFulfillmentKind" NOT NULL DEFAULT 'standard',
ADD COLUMN     "serialTracking" "SerialTrackingMode" NOT NULL DEFAULT 'none',
ADD COLUMN     "warrantyDays" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "inventory_unit" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "batchId" TEXT,
    "serial" TEXT,
    "imei" TEXT,
    "state" TEXT NOT NULL DEFAULT 'available',
    "lineItemId" TEXT,
    "registeredByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warranty_claim" (
    "id" TEXT NOT NULL,
    "allocationId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'open',
    "issue" TEXT NOT NULL,
    "resolution" TEXT,
    "openedByUserId" TEXT NOT NULL,
    "resolvedByUserId" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warranty_claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_allocation" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "lineItemId" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'assigned',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unit_allocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_delivery_slot" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "postalCodes" TEXT[],
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "cutoffAt" TIMESTAMP(3) NOT NULL,
    "capacityUnits" INTEGER NOT NULL,
    "reservedUnits" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "food_delivery_slot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_order_booking" (
    "orderId" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'reserved',
    "preparedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_order_booking_pkey" PRIMARY KEY ("orderId")
);

-- CreateIndex
CREATE UNIQUE INDEX "inventory_unit_serial_key" ON "inventory_unit"("serial");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_unit_imei_key" ON "inventory_unit"("imei");

-- CreateIndex
CREATE INDEX "inventory_unit_variantId_state_idx" ON "inventory_unit"("variantId", "state");

-- CreateIndex
CREATE INDEX "inventory_unit_lineItemId_idx" ON "inventory_unit"("lineItemId");

-- CreateIndex
CREATE UNIQUE INDEX "warranty_claim_reference_key" ON "warranty_claim"("reference");

-- CreateIndex
CREATE INDEX "warranty_claim_allocationId_state_idx" ON "warranty_claim"("allocationId", "state");

-- CreateIndex
CREATE INDEX "unit_allocation_lineItemId_state_idx" ON "unit_allocation"("lineItemId", "state");

-- CreateIndex
CREATE UNIQUE INDEX "unit_allocation_unitId_lineItemId_key" ON "unit_allocation"("unitId", "lineItemId");

-- CreateIndex
CREATE INDEX "food_delivery_slot_isActive_cutoffAt_idx" ON "food_delivery_slot"("isActive", "cutoffAt");

-- CreateIndex
CREATE INDEX "food_order_booking_slotId_state_idx" ON "food_order_booking"("slotId", "state");

-- AddForeignKey
ALTER TABLE "inventory_unit" ADD CONSTRAINT "inventory_unit_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_unit" ADD CONSTRAINT "inventory_unit_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "inventory_location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_unit" ADD CONSTRAINT "inventory_unit_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "inventory_batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_unit" ADD CONSTRAINT "inventory_unit_lineItemId_fkey" FOREIGN KEY ("lineItemId") REFERENCES "order_line_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warranty_claim" ADD CONSTRAINT "warranty_claim_allocationId_fkey" FOREIGN KEY ("allocationId") REFERENCES "unit_allocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_allocation" ADD CONSTRAINT "unit_allocation_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "inventory_unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unit_allocation" ADD CONSTRAINT "unit_allocation_lineItemId_fkey" FOREIGN KEY ("lineItemId") REFERENCES "order_line_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_order_booking" ADD CONSTRAINT "food_order_booking_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_order_booking" ADD CONSTRAINT "food_order_booking_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "food_delivery_slot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
