-- Product media, highlights, search keywords, and merchandising cleanup
ALTER TABLE "product"
  DROP COLUMN IF EXISTS "media",
  ADD COLUMN "coverImageUrl" TEXT,
  ADD COLUMN "searchKeywords" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "isTrending" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "badgeLabel" TEXT;

ALTER TABLE "product_variant"
  DROP COLUMN IF EXISTS "media",
  ADD COLUMN "imageUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

CREATE TABLE "product_highlight" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "iconUrl" TEXT,
  "imageUrl" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "product_highlight_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "product_isTrending_idx" ON "product"("isTrending");
CREATE INDEX "product_highlight_productId_idx" ON "product_highlight"("productId");
CREATE INDEX "product_highlight_sortOrder_idx" ON "product_highlight"("sortOrder");

ALTER TABLE "product_highlight"
  ADD CONSTRAINT "product_highlight_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "product"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
