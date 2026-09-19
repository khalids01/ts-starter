-- CreateTable
CREATE TABLE "store_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "storeName" TEXT NOT NULL,
    "supportEmail" TEXT,
    "supportPhone" TEXT,
    "defaultCurrency" TEXT NOT NULL DEFAULT 'BDT',
    "orderNumberPrefix" TEXT NOT NULL DEFAULT 'ORD',
    "reservationDurationMinutes" INTEGER NOT NULL DEFAULT 30,
    "checkoutEnabled" BOOLEAN NOT NULL DEFAULT true,
    "checkoutNotice" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_settings_pkey" PRIMARY KEY ("id")
);
