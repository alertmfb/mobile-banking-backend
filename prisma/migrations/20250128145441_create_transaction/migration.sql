/*
  Warnings:

  - You are about to drop the `Card` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('TRANSFER', 'AIRTIME', 'DATA', 'TV_BILL', 'ELECTRICITY', 'BETTING', 'PENSION');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REVERSED');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('TRANSFER', 'AIRTIME', 'DATA', 'TV_BILL', 'ELECTRICITY', 'BETTING', 'PENSION', 'CREATE_TRANSFER_BENEFICIARY', 'CREATE_AIRTIME_BENEFICIARY', 'CREATE_DATA_BENEFICIARY', 'CREATE_TV_BILL_BENEFICIARY', 'CREATE_ELECTRICITY_BENEFICIARY', 'BULK_CREATE_BENEFICIARY', 'BULK_AIRTIME', 'BULK_DATA');

-- CreateEnum
CREATE TYPE "ActivityStatus" AS ENUM ('VIEW', 'INITIATE', 'AUTHORIZE', 'REJECT');

-- CreateEnum
CREATE TYPE "CardType" AS ENUM ('VISA', 'MASTERCARD', 'VERVE');

-- CreateEnum
CREATE TYPE "PickupBranch" AS ENUM ('YABA', 'IKEJA', 'VI', 'TRADEFAIR', 'IKORODU');

-- CreateEnum
CREATE TYPE "CardRequestStatus" AS ENUM ('RECEIVED', 'PROCESSING', 'PRINTING', 'READY', 'DELIVERED', 'CANCELLED', 'SENT');

-- CreateEnum
CREATE TYPE "CardDeliveryOption" AS ENUM ('PICKUP', 'DELIVERY');

-- CreateEnum
CREATE TYPE "NetworkProvider" AS ENUM ('MTN', 'GLO', 'AIRTEL', 'NINE_MOBILE');

-- CreateEnum
CREATE TYPE "TvProvider" AS ENUM ('DSTV', 'GOTV', 'STARTIMES');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "emailToken" TEXT,
ADD COLUMN     "isEmailSet" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPhoneSet" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPinSet" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phoneToken" TEXT;

-- DropTable
DROP TABLE "Card";

-- CreateTable
CREATE TABLE "card_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "deliveryOption" "CardDeliveryOption" NOT NULL DEFAULT 'PICKUP',
    "cardType" "CardType" NOT NULL DEFAULT 'VERVE',
    "pickupBranch" "PickupBranch" NOT NULL DEFAULT 'YABA',
    "address" TEXT,
    "city" TEXT,
    "zipCode" TEXT,
    "status" "CardRequestStatus" NOT NULL DEFAULT 'RECEIVED',
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "card_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "beneficiaryId" TEXT,
    "transactionType" "TransactionType" NOT NULL DEFAULT 'TRANSFER',
    "amount" DECIMAL(10,2) NOT NULL,
    "newBalance" DECIMAL(10,2) NOT NULL,
    "reference" TEXT,
    "narration" TEXT,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_limits" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "transactionType" "TransactionType" NOT NULL DEFAULT 'TRANSFER',
    "singleLimit" DECIMAL(10,2),
    "dailyLimit" DECIMAL(10,2),
    "monthlyLimit" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_limits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "beneficiary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT,
    "beneficiaryType" "TransactionType" NOT NULL DEFAULT 'TRANSFER',
    "accountName" TEXT,
    "bankName" TEXT,
    "bankCode" TEXT,
    "accountNumber" TEXT,
    "tvCardNumber" TEXT,
    "tvCardName" TEXT,
    "tvProvider" "TvProvider",
    "phoneNumber" TEXT,
    "networkProvider" "NetworkProvider",
    "isBeneficiary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "beneficiary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "card_requests_userId_idx" ON "card_requests"("userId");

-- CreateIndex
CREATE INDEX "transactions_accountId_idx" ON "transactions"("accountId");

-- CreateIndex
CREATE INDEX "transactions_transactionType_idx" ON "transactions"("transactionType");

-- CreateIndex
CREATE INDEX "transactions_userId_idx" ON "transactions"("userId");

-- CreateIndex
CREATE INDEX "transactions_id_idx" ON "transactions"("id");

-- CreateIndex
CREATE INDEX "transactions_reference_idx" ON "transactions"("reference");

-- CreateIndex
CREATE INDEX "transaction_limits_userId_idx" ON "transaction_limits"("userId");

-- CreateIndex
CREATE INDEX "transaction_limits_transactionType_idx" ON "transaction_limits"("transactionType");

-- CreateIndex
CREATE INDEX "beneficiary_userId_idx" ON "beneficiary"("userId");

-- AddForeignKey
ALTER TABLE "card_requests" ADD CONSTRAINT "card_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_requests" ADD CONSTRAINT "card_requests_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_beneficiaryId_fkey" FOREIGN KEY ("beneficiaryId") REFERENCES "beneficiary"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_limits" ADD CONSTRAINT "transaction_limits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficiary" ADD CONSTRAINT "beneficiary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "beneficiary" ADD CONSTRAINT "beneficiary_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
