-- AlterTable
ALTER TABLE "category" ADD COLUMN     "archivedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "product" ADD COLUMN     "archivedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "product_attribute" ADD COLUMN     "archivedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "product_brand" ADD COLUMN     "archivedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "category_archivedAt_idx" ON "category"("archivedAt");

-- CreateIndex
CREATE INDEX "product_archivedAt_idx" ON "product"("archivedAt");

-- CreateIndex
CREATE INDEX "product_attribute_archivedAt_idx" ON "product_attribute"("archivedAt");

-- CreateIndex
CREATE INDEX "product_brand_archivedAt_idx" ON "product_brand"("archivedAt");
