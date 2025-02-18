-- AlterTable
ALTER TABLE "beneficiary" ADD COLUMN     "meterAddress" TEXT;

-- AlterTable
ALTER TABLE "bill_payments" ADD COLUMN     "confirmCode" TEXT,
ADD COLUMN     "reference" TEXT,
ADD COLUMN     "token" TEXT,
ADD COLUMN     "units" TEXT;
