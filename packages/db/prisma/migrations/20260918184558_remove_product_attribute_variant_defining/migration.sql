/*
  Warnings:

  - You are about to drop the column `variantDefining` on the `product_attribute` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "product_attribute_variantDefining_idx";

-- AlterTable
ALTER TABLE "product_attribute" DROP COLUMN "variantDefining";
