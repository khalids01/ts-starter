-- CreateEnum
CREATE TYPE "StoreSeoPage" AS ENUM ('home', 'about');

-- CreateTable
CREATE TABLE "store_page_seo" (
    "page" "StoreSeoPage" NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "title" VARCHAR(120),
    "description" VARCHAR(320),
    "imageUrl" VARCHAR(2048),
    "publishedTitle" VARCHAR(120),
    "publishedDescription" VARCHAR(320),
    "publishedImageUrl" VARCHAR(2048),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_page_seo_pkey" PRIMARY KEY ("page")
);
