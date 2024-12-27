-- CreateEnum
CREATE TYPE "AddressVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAILED');

-- AlterTable
ALTER TABLE "residential_addresses" ADD COLUMN     "addressVerificationStatus" "AddressVerificationStatus" NOT NULL DEFAULT 'PENDING';
