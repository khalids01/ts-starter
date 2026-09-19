-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('percentage', 'fixed_amount');

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "discountCodeId" TEXT,
ADD COLUMN     "discountCodeSnapshot" TEXT,
ADD COLUMN     "discountDescriptionSnapshot" TEXT,
ADD COLUMN     "discountTypeSnapshot" "DiscountType",
ADD COLUMN     "discountValueSnapshot" DECIMAL(12,2);

-- CreateTable
CREATE TABLE "discount_code" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "type" "DiscountType" NOT NULL,
    "value" DECIMAL(12,2) NOT NULL,
    "currency" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "minimumOrderAmount" DECIMAL(12,2),
    "totalUsageLimit" INTEGER,
    "perCustomerUsageLimit" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "discount_code_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "discount_redemption" (
    "id" TEXT NOT NULL,
    "discountCodeId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "customerKey" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "discount_redemption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "discount_code_code_key" ON "discount_code"("code");

-- CreateIndex
CREATE INDEX "discount_code_isActive_idx" ON "discount_code"("isActive");

-- CreateIndex
CREATE INDEX "discount_code_startsAt_endsAt_idx" ON "discount_code"("startsAt", "endsAt");

-- CreateIndex
CREATE UNIQUE INDEX "discount_redemption_orderId_key" ON "discount_redemption"("orderId");

-- CreateIndex
CREATE INDEX "discount_redemption_discountCodeId_createdAt_idx" ON "discount_redemption"("discountCodeId", "createdAt");

-- CreateIndex
CREATE INDEX "discount_redemption_discountCodeId_customerKey_idx" ON "discount_redemption"("discountCodeId", "customerKey");

-- CreateIndex
CREATE INDEX "order_discountCodeId_idx" ON "order"("discountCodeId");

-- AddForeignKey
ALTER TABLE "discount_redemption" ADD CONSTRAINT "discount_redemption_discountCodeId_fkey" FOREIGN KEY ("discountCodeId") REFERENCES "discount_code"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discount_redemption" ADD CONSTRAINT "discount_redemption_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_discountCodeId_fkey" FOREIGN KEY ("discountCodeId") REFERENCES "discount_code"("id") ON DELETE SET NULL ON UPDATE CASCADE;
