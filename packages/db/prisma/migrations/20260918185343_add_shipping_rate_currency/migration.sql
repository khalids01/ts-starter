-- AlterTable
ALTER TABLE "shipping_rate" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'BDT';

-- CreateIndex
CREATE INDEX "shipping_rate_currency_idx" ON "shipping_rate"("currency");
