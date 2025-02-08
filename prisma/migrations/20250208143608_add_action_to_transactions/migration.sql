-- CreateEnum
CREATE TYPE "TransactionAction" AS ENUM ('DEBIT', 'CREDIT');

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "action" "TransactionAction" NOT NULL DEFAULT 'DEBIT';
