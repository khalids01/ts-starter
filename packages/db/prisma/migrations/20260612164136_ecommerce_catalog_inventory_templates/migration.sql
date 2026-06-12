-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('draft', 'active', 'archived');

-- CreateEnum
CREATE TYPE "CategoryBrandPolicy" AS ENUM ('hidden', 'optional', 'required', 'default_store');

-- CreateEnum
CREATE TYPE "ProductAttributeType" AS ENUM ('text', 'number', 'boolean', 'color');

-- CreateEnum
CREATE TYPE "CategoryAttributeScope" AS ENUM ('product', 'variant', 'batch');

-- CreateEnum
CREATE TYPE "AttributeInputType" AS ENUM ('text', 'textarea', 'number', 'boolean', 'select', 'multiselect', 'color', 'date');

-- CreateEnum
CREATE TYPE "WeightUnit" AS ENUM ('g', 'kg', 'lb', 'oz');

-- CreateEnum
CREATE TYPE "InventoryMovementType" AS ENUM ('purchase', 'sale_reserve', 'sale_commit', 'reservation_release', 'return', 'adjustment', 'transfer_in', 'transfer_out');

-- CreateEnum
CREATE TYPE "StockReservationStatus" AS ENUM ('active', 'committed', 'released', 'expired');

-- CreateTable
CREATE TABLE "category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "imageUrl" TEXT,
    "iconUrl" TEXT,
    "brandPolicy" "CategoryBrandPolicy" NOT NULL DEFAULT 'optional',
    "showStoreBrand" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "websiteUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "descriptionHtml" TEXT,
    "categoryId" TEXT NOT NULL,
    "brandId" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'draft',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "media" JSONB,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "barcode" TEXT,
    "name" TEXT NOT NULL,
    "attributesSnapshot" JSONB,
    "price" DECIMAL(12,2) NOT NULL,
    "compareAtPrice" DECIMAL(12,2),
    "costPrice" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'BDT',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "media" JSONB,
    "weightValue" DECIMAL(10,3),
    "weightUnit" "WeightUnit",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_variant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_attribute" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "ProductAttributeType" NOT NULL DEFAULT 'text',
    "filterable" BOOLEAN NOT NULL DEFAULT false,
    "variantDefining" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_attribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_attribute_value" (
    "id" TEXT NOT NULL,
    "attributeId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_attribute_value_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variant_attribute_value" (
    "variantId" TEXT NOT NULL,
    "attributeValueId" TEXT NOT NULL,

    CONSTRAINT "product_variant_attribute_value_pkey" PRIMARY KEY ("variantId","attributeValueId")
);

-- CreateTable
CREATE TABLE "category_attribute" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "attributeId" TEXT NOT NULL,
    "scope" "CategoryAttributeScope" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "filterable" BOOLEAN NOT NULL DEFAULT false,
    "variantDefining" BOOLEAN NOT NULL DEFAULT false,
    "comparable" BOOLEAN NOT NULL DEFAULT false,
    "inputType" "AttributeInputType" NOT NULL DEFAULT 'text',
    "unit" TEXT,
    "groupName" TEXT,
    "helpText" TEXT,
    "placeholder" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_attribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_attribute_assignment" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "attributeId" TEXT NOT NULL,
    "attributeValueId" TEXT,
    "rawText" TEXT,
    "rawNumber" DECIMAL(16,4),
    "rawBoolean" BOOLEAN,
    "rawDate" TIMESTAMP(3),
    "displayValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_attribute_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_batch" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "supplierId" TEXT,
    "batchNumber" TEXT,
    "expiryDate" TIMESTAMP(3),
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unitCost" DECIMAL(12,4),
    "notes" TEXT,

    CONSTRAINT "inventory_batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_batch_attribute_assignment" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "attributeId" TEXT NOT NULL,
    "attributeValueId" TEXT,
    "rawText" TEXT,
    "rawNumber" DECIMAL(16,4),
    "rawBoolean" BOOLEAN,
    "rawDate" TIMESTAMP(3),
    "displayValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_batch_attribute_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_stock" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "batchId" TEXT,
    "quantityOnHand" INTEGER NOT NULL DEFAULT 0,
    "quantityReserved" INTEGER NOT NULL DEFAULT 0,
    "reorderLevel" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_movement" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "batchId" TEXT,
    "type" "InventoryMovementType" NOT NULL,
    "delta" INTEGER NOT NULL,
    "unitCost" DECIMAL(12,4),
    "reason" TEXT,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "actorUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_movement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_reservation" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "batchId" TEXT,
    "quantity" INTEGER NOT NULL,
    "status" "StockReservationStatus" NOT NULL DEFAULT 'active',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_reservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "category_slug_key" ON "category"("slug");

-- CreateIndex
CREATE INDEX "category_parentId_idx" ON "category"("parentId");

-- CreateIndex
CREATE INDEX "category_isActive_idx" ON "category"("isActive");

-- CreateIndex
CREATE INDEX "category_isFeatured_idx" ON "category"("isFeatured");

-- CreateIndex
CREATE INDEX "category_sortOrder_idx" ON "category"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "product_brand_slug_key" ON "product_brand"("slug");

-- CreateIndex
CREATE INDEX "product_brand_isActive_idx" ON "product_brand"("isActive");

-- CreateIndex
CREATE INDEX "product_brand_isFeatured_idx" ON "product_brand"("isFeatured");

-- CreateIndex
CREATE UNIQUE INDEX "product_slug_key" ON "product"("slug");

-- CreateIndex
CREATE INDEX "product_categoryId_idx" ON "product"("categoryId");

-- CreateIndex
CREATE INDEX "product_brandId_idx" ON "product"("brandId");

-- CreateIndex
CREATE INDEX "product_status_idx" ON "product"("status");

-- CreateIndex
CREATE INDEX "product_isActive_idx" ON "product"("isActive");

-- CreateIndex
CREATE INDEX "product_isFeatured_idx" ON "product"("isFeatured");

-- CreateIndex
CREATE UNIQUE INDEX "product_variant_sku_key" ON "product_variant"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "product_variant_barcode_key" ON "product_variant"("barcode");

-- CreateIndex
CREATE INDEX "product_variant_productId_idx" ON "product_variant"("productId");

-- CreateIndex
CREATE INDEX "product_variant_isActive_idx" ON "product_variant"("isActive");

-- CreateIndex
CREATE INDEX "product_variant_isDefault_idx" ON "product_variant"("isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "product_attribute_slug_key" ON "product_attribute"("slug");

-- CreateIndex
CREATE INDEX "product_attribute_filterable_idx" ON "product_attribute"("filterable");

-- CreateIndex
CREATE INDEX "product_attribute_variantDefining_idx" ON "product_attribute"("variantDefining");

-- CreateIndex
CREATE INDEX "product_attribute_sortOrder_idx" ON "product_attribute"("sortOrder");

-- CreateIndex
CREATE INDEX "product_attribute_value_attributeId_idx" ON "product_attribute_value"("attributeId");

-- CreateIndex
CREATE INDEX "product_attribute_value_sortOrder_idx" ON "product_attribute_value"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "product_attribute_value_attributeId_value_key" ON "product_attribute_value"("attributeId", "value");

-- CreateIndex
CREATE INDEX "product_variant_attribute_value_attributeValueId_idx" ON "product_variant_attribute_value"("attributeValueId");

-- CreateIndex
CREATE INDEX "category_attribute_categoryId_idx" ON "category_attribute"("categoryId");

-- CreateIndex
CREATE INDEX "category_attribute_attributeId_idx" ON "category_attribute"("attributeId");

-- CreateIndex
CREATE INDEX "category_attribute_scope_idx" ON "category_attribute"("scope");

-- CreateIndex
CREATE INDEX "category_attribute_filterable_idx" ON "category_attribute"("filterable");

-- CreateIndex
CREATE INDEX "category_attribute_variantDefining_idx" ON "category_attribute"("variantDefining");

-- CreateIndex
CREATE INDEX "category_attribute_sortOrder_idx" ON "category_attribute"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "category_attribute_categoryId_attributeId_scope_key" ON "category_attribute"("categoryId", "attributeId", "scope");

-- CreateIndex
CREATE INDEX "product_attribute_assignment_productId_idx" ON "product_attribute_assignment"("productId");

-- CreateIndex
CREATE INDEX "product_attribute_assignment_attributeId_idx" ON "product_attribute_assignment"("attributeId");

-- CreateIndex
CREATE INDEX "product_attribute_assignment_attributeValueId_idx" ON "product_attribute_assignment"("attributeValueId");

-- CreateIndex
CREATE UNIQUE INDEX "product_attribute_assignment_productId_attributeId_key" ON "product_attribute_assignment"("productId", "attributeId");

-- CreateIndex
CREATE INDEX "supplier_isActive_idx" ON "supplier"("isActive");

-- CreateIndex
CREATE INDEX "supplier_email_idx" ON "supplier"("email");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_location_code_key" ON "inventory_location"("code");

-- CreateIndex
CREATE INDEX "inventory_location_isActive_idx" ON "inventory_location"("isActive");

-- CreateIndex
CREATE INDEX "inventory_batch_variantId_idx" ON "inventory_batch"("variantId");

-- CreateIndex
CREATE INDEX "inventory_batch_supplierId_idx" ON "inventory_batch"("supplierId");

-- CreateIndex
CREATE INDEX "inventory_batch_expiryDate_idx" ON "inventory_batch"("expiryDate");

-- CreateIndex
CREATE INDEX "inventory_batch_attribute_assignment_batchId_idx" ON "inventory_batch_attribute_assignment"("batchId");

-- CreateIndex
CREATE INDEX "inventory_batch_attribute_assignment_attributeId_idx" ON "inventory_batch_attribute_assignment"("attributeId");

-- CreateIndex
CREATE INDEX "inventory_batch_attribute_assignment_attributeValueId_idx" ON "inventory_batch_attribute_assignment"("attributeValueId");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_batch_attribute_assignment_batchId_attributeId_key" ON "inventory_batch_attribute_assignment"("batchId", "attributeId");

-- CreateIndex
CREATE INDEX "inventory_stock_variantId_idx" ON "inventory_stock"("variantId");

-- CreateIndex
CREATE INDEX "inventory_stock_locationId_idx" ON "inventory_stock"("locationId");

-- CreateIndex
CREATE INDEX "inventory_stock_batchId_idx" ON "inventory_stock"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_stock_variantId_locationId_batchId_key" ON "inventory_stock"("variantId", "locationId", "batchId");

-- CreateIndex
CREATE INDEX "inventory_movement_variantId_createdAt_idx" ON "inventory_movement"("variantId", "createdAt");

-- CreateIndex
CREATE INDEX "inventory_movement_locationId_createdAt_idx" ON "inventory_movement"("locationId", "createdAt");

-- CreateIndex
CREATE INDEX "inventory_movement_batchId_idx" ON "inventory_movement"("batchId");

-- CreateIndex
CREATE INDEX "inventory_movement_type_createdAt_idx" ON "inventory_movement"("type", "createdAt");

-- CreateIndex
CREATE INDEX "inventory_movement_referenceType_referenceId_idx" ON "inventory_movement"("referenceType", "referenceId");

-- CreateIndex
CREATE INDEX "inventory_movement_actorUserId_idx" ON "inventory_movement"("actorUserId");

-- CreateIndex
CREATE INDEX "stock_reservation_variantId_idx" ON "stock_reservation"("variantId");

-- CreateIndex
CREATE INDEX "stock_reservation_locationId_idx" ON "stock_reservation"("locationId");

-- CreateIndex
CREATE INDEX "stock_reservation_batchId_idx" ON "stock_reservation"("batchId");

-- CreateIndex
CREATE INDEX "stock_reservation_status_expiresAt_idx" ON "stock_reservation"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "stock_reservation_referenceType_referenceId_idx" ON "stock_reservation"("referenceType", "referenceId");

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "product_brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_attribute_value" ADD CONSTRAINT "product_attribute_value_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "product_attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant_attribute_value" ADD CONSTRAINT "product_variant_attribute_value_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variant_attribute_value" ADD CONSTRAINT "product_variant_attribute_value_attributeValueId_fkey" FOREIGN KEY ("attributeValueId") REFERENCES "product_attribute_value"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_attribute" ADD CONSTRAINT "category_attribute_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_attribute" ADD CONSTRAINT "category_attribute_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "product_attribute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_attribute_assignment" ADD CONSTRAINT "product_attribute_assignment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_attribute_assignment" ADD CONSTRAINT "product_attribute_assignment_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "product_attribute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_attribute_assignment" ADD CONSTRAINT "product_attribute_assignment_attributeValueId_fkey" FOREIGN KEY ("attributeValueId") REFERENCES "product_attribute_value"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_batch" ADD CONSTRAINT "inventory_batch_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_batch" ADD CONSTRAINT "inventory_batch_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_batch_attribute_assignment" ADD CONSTRAINT "inventory_batch_attribute_assignment_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "inventory_batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_batch_attribute_assignment" ADD CONSTRAINT "inventory_batch_attribute_assignment_attributeId_fkey" FOREIGN KEY ("attributeId") REFERENCES "product_attribute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_batch_attribute_assignment" ADD CONSTRAINT "inventory_batch_attribute_assignment_attributeValueId_fkey" FOREIGN KEY ("attributeValueId") REFERENCES "product_attribute_value"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_stock" ADD CONSTRAINT "inventory_stock_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_stock" ADD CONSTRAINT "inventory_stock_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "inventory_location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_stock" ADD CONSTRAINT "inventory_stock_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "inventory_batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movement" ADD CONSTRAINT "inventory_movement_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movement" ADD CONSTRAINT "inventory_movement_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "inventory_location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movement" ADD CONSTRAINT "inventory_movement_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "inventory_batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_movement" ADD CONSTRAINT "inventory_movement_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_reservation" ADD CONSTRAINT "stock_reservation_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_reservation" ADD CONSTRAINT "stock_reservation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "inventory_location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_reservation" ADD CONSTRAINT "stock_reservation_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "inventory_batch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
