/*
  Warnings:

  - The `invoicePeriod` column on the `bill_payments` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "bill_payments" DROP COLUMN "invoicePeriod",
ADD COLUMN     "invoicePeriod" INTEGER;
