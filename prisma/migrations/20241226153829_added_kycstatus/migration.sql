/*
  Warnings:

  - The values [KYB_STARTED,KYB_SUBMITTED,KYB_APPROVED,KYB_FAILED] on the enum `OnboardEnum` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `cusomterId` on the `accounts` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "KycEnum" AS ENUM ('NEW', 'STARTED', 'SUBMITTED', 'APPROVED', 'FAILED');

-- AlterEnum
BEGIN;
CREATE TYPE "OnboardEnum_new" AS ENUM ('NEW', 'INITIATED', 'PHONE_VERIFIED', 'SET_EMAIL', 'EMAIL_VERIFIED', 'SET_PASSCODE', 'SET_PIN', 'COMPLETED');
ALTER TABLE "users" ALTER COLUMN "onboarding" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "onboarding" TYPE "OnboardEnum_new" USING ("onboarding"::text::"OnboardEnum_new");
ALTER TYPE "OnboardEnum" RENAME TO "OnboardEnum_old";
ALTER TYPE "OnboardEnum_new" RENAME TO "OnboardEnum";
DROP TYPE "OnboardEnum_old";
ALTER TABLE "users" ALTER COLUMN "onboarding" SET DEFAULT 'NEW';
COMMIT;

-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "cusomterId",
ADD COLUMN     "customerId" TEXT;

-- AlterTable
ALTER TABLE "kycs" ADD COLUMN     "residentialAddressStatus" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "bvnLookup" TEXT,
ADD COLUMN     "kycStatus" "KycEnum" NOT NULL DEFAULT 'NEW',
ADD COLUMN     "ninLookup" TEXT;
