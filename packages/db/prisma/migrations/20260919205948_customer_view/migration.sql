-- AlterTable
ALTER TABLE "order" ADD COLUMN     "ecommerceCustomerId" TEXT;

-- CreateTable
CREATE TABLE "ecommerce_customer" (
    "id" TEXT NOT NULL,
    "normalizedEmail" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "adminNote" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ecommerce_customer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ecommerce_customer_normalizedEmail_key" ON "ecommerce_customer"("normalizedEmail");

-- CreateIndex
CREATE UNIQUE INDEX "ecommerce_customer_userId_key" ON "ecommerce_customer"("userId");

-- CreateIndex
CREATE INDEX "ecommerce_customer_name_idx" ON "ecommerce_customer"("name");

-- CreateIndex
CREATE INDEX "ecommerce_customer_phone_idx" ON "ecommerce_customer"("phone");

-- CreateIndex
CREATE INDEX "order_ecommerceCustomerId_idx" ON "order"("ecommerceCustomerId");

-- AddForeignKey
ALTER TABLE "ecommerce_customer" ADD CONSTRAINT "ecommerce_customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_ecommerceCustomerId_fkey" FOREIGN KEY ("ecommerceCustomerId") REFERENCES "ecommerce_customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
