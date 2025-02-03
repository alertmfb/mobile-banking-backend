-- CreateEnum
CREATE TYPE "PromoType" AS ENUM ('SIGNUP', 'REFERRAL', 'PROMO');

-- CreateTable
CREATE TABLE "promo_applies" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "awarded" BOOLEAN NOT NULL DEFAULT false,
    "amount" DECIMAL(10,2),
    "awardedDate" TIMESTAMP(3),
    "transactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promo_applies_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "promo_applies" ADD CONSTRAINT "promo_applies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promo_applies" ADD CONSTRAINT "promo_applies_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
