-- CreateTable
CREATE TABLE "rate_limit_settings" (
    "id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "publicEnabled" BOOLEAN NOT NULL DEFAULT true,
    "publicWindowSeconds" INTEGER NOT NULL DEFAULT 60,
    "publicMaxRequests" INTEGER NOT NULL DEFAULT 60,
    "authEnabled" BOOLEAN NOT NULL DEFAULT true,
    "authWindowSeconds" INTEGER NOT NULL DEFAULT 60,
    "authMaxRequests" INTEGER NOT NULL DEFAULT 10,
    "protectedEnabled" BOOLEAN NOT NULL DEFAULT true,
    "protectedWindowSeconds" INTEGER NOT NULL DEFAULT 60,
    "protectedMaxRequests" INTEGER NOT NULL DEFAULT 120,
    "adminEnabled" BOOLEAN NOT NULL DEFAULT true,
    "adminWindowSeconds" INTEGER NOT NULL DEFAULT 60,
    "adminMaxRequests" INTEGER NOT NULL DEFAULT 300,
    "specialEnabled" BOOLEAN NOT NULL DEFAULT true,
    "specialWindowSeconds" INTEGER NOT NULL DEFAULT 60,
    "specialMaxRequests" INTEGER NOT NULL DEFAULT 30,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rate_limit_settings_pkey" PRIMARY KEY ("id")
);
