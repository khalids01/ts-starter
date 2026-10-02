-- CreateEnum
CREATE TYPE "OrderPaymentEntryType" AS ENUM ('receipt', 'reversal');

-- CreateEnum
CREATE TYPE "OrderRecoveryDisposition" AS ENUM ('awaiting_inspection', 'sellable', 'unsafe');

-- AlterEnum
ALTER TYPE "StockReservationStatus" ADD VALUE 'restocked';

-- CreateTable
CREATE TABLE "courier_shipment_claim" (
    "orderId" TEXT NOT NULL,
    "dispatchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "courier_shipment_claim_pkey" PRIMARY KEY ("orderId")
);

-- CreateTable
CREATE TABLE "order_payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "entryType" "OrderPaymentEntryType" NOT NULL DEFAULT 'receipt',
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "reference" TEXT,
    "note" TEXT,
    "actorUserId" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reversesId" TEXT,
    "settlementId" TEXT,

    CONSTRAINT "order_payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_recovery" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "receivedByUserId" TEXT NOT NULL,
    "receiptNote" TEXT NOT NULL,
    "disposition" "OrderRecoveryDisposition" NOT NULL DEFAULT 'awaiting_inspection',
    "inspectedAt" TIMESTAMP(3),
    "inspectedByUserId" TEXT,
    "inspectionNote" TEXT,
    "restockedAt" TIMESTAMP(3),
    "restockedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_recovery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "courier_shipment_claim_dispatchId_key" ON "courier_shipment_claim"("dispatchId");

-- CreateIndex
CREATE UNIQUE INDEX "order_payment_idempotencyKey_key" ON "order_payment"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "order_payment_reversesId_key" ON "order_payment"("reversesId");

-- CreateIndex
CREATE UNIQUE INDEX "order_payment_settlementId_key" ON "order_payment"("settlementId");

-- CreateIndex
CREATE INDEX "order_payment_orderId_createdAt_idx" ON "order_payment"("orderId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "order_recovery_orderId_key" ON "order_recovery"("orderId");

-- AddForeignKey
ALTER TABLE "courier_shipment_claim" ADD CONSTRAINT "courier_shipment_claim_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courier_shipment_claim" ADD CONSTRAINT "courier_shipment_claim_dispatchId_fkey" FOREIGN KEY ("dispatchId") REFERENCES "courier_dispatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_payment" ADD CONSTRAINT "order_payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_payment" ADD CONSTRAINT "order_payment_reversesId_fkey" FOREIGN KEY ("reversesId") REFERENCES "order_payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_payment" ADD CONSTRAINT "order_payment_settlementId_fkey" FOREIGN KEY ("settlementId") REFERENCES "courier_settlement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_recovery" ADD CONSTRAINT "order_recovery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
