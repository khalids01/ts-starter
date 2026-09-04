-- AlterTable
ALTER TABLE "auth_settings" ADD COLUMN     "discordSignInEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "discordSignUpEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "googleSignInEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "googleSignUpEnabled" BOOLEAN NOT NULL DEFAULT true;
