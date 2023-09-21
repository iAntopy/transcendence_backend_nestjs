-- AlterTable
ALTER TABLE "users" ADD COLUMN     "image" TEXT,
ADD COLUMN     "isAuthenticated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isAuthenticating" BOOLEAN NOT NULL DEFAULT false;
