-- CreateTable
CREATE TABLE "order_refund" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "note" TEXT,
    "restockInventory" BOOLEAN NOT NULL DEFAULT false,
    "actorUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_refund_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "order_refund_orderId_createdAt_idx" ON "order_refund"("orderId", "createdAt");

-- CreateIndex
CREATE INDEX "order_refund_actorUserId_idx" ON "order_refund"("actorUserId");

-- AddForeignKey
ALTER TABLE "order_refund" ADD CONSTRAINT "order_refund_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_refund" ADD CONSTRAINT "order_refund_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
