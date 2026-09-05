-- CreateTable
CREATE TABLE "user_auth_method" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_auth_method_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_settings" (
    "id" TEXT NOT NULL,
    "githubSignInEnabled" BOOLEAN NOT NULL DEFAULT true,
    "githubSignUpEnabled" BOOLEAN NOT NULL DEFAULT true,
    "magicLinkSignInEnabled" BOOLEAN NOT NULL DEFAULT true,
    "magicLinkSignUpEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auth_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_auth_method_method_idx" ON "user_auth_method"("method");

-- CreateIndex
CREATE UNIQUE INDEX "user_auth_method_userId_method_key" ON "user_auth_method"("userId", "method");

-- AddForeignKey
ALTER TABLE "user_auth_method" ADD CONSTRAINT "user_auth_method_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
