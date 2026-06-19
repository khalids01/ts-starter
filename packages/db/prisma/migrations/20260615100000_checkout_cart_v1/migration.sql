-- CreateTable
CREATE TABLE "cart" (
    "id" TEXT NOT NULL,
    "cartToken" TEXT,
    "userId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_item" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cart_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cart_cartToken_key" ON "cart"("cartToken");

-- CreateIndex
CREATE INDEX "cart_userId_idx" ON "cart"("userId");

-- CreateIndex
CREATE INDEX "cart_expiresAt_idx" ON "cart"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "cart_item_cartId_variantId_key" ON "cart_item"("cartId", "variantId");

-- CreateIndex
CREATE INDEX "cart_item_cartId_idx" ON "cart_item"("cartId");

-- CreateIndex
CREATE INDEX "cart_item_variantId_idx" ON "cart_item"("variantId");

-- AddForeignKey
ALTER TABLE "cart" ADD CONSTRAINT "cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
