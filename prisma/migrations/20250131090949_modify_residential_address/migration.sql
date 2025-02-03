-- CreateEnum
CREATE TYPE "MeterType" AS ENUM ('BEDC', 'EKEDC', 'AEDC', 'EEDC', 'IBEDC', 'IKEDC', 'JEDC', 'KAEDC', 'KEDCO', 'PHEDC', 'YEDC');

-- CreateEnum
CREATE TYPE "BuildingType" AS ENUM ('DETACHED', 'SEMI_DETACHED', 'BUNGALOW', 'DUPLEX', 'APARTMENT', 'FLATS');

-- AlterTable
ALTER TABLE "beneficiary" ADD COLUMN     "meterName" TEXT,
ADD COLUMN     "meterNumber" TEXT,
ADD COLUMN     "meterType" "MeterType",
ADD COLUMN     "meterTypeFull" TEXT;

-- AlterTable
ALTER TABLE "residential_addresses" ADD COLUMN     "buildingColour" TEXT,
ADD COLUMN     "buildingPhoto" TEXT,
ADD COLUMN     "buildingType" "BuildingType",
ADD COLUMN     "gateColor" TEXT,
ADD COLUMN     "identifierName" TEXT,
ADD COLUMN     "identifierRelationship" TEXT,
ADD COLUMN     "occupancyLength" TEXT,
ADD COLUMN     "otherName" TEXT,
ADD COLUMN     "streetPhoto" TEXT,
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "city" DROP NOT NULL,
ALTER COLUMN "state" DROP NOT NULL,
ALTER COLUMN "zipcode" DROP NOT NULL,
ALTER COLUMN "landmark" DROP NOT NULL,
ALTER COLUMN "lga" DROP NOT NULL;

-- CreateTable
CREATE TABLE "NextOfKin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "otherName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "dob" TEXT NOT NULL,
    "pob" TEXT NOT NULL,
    "country" TEXT NOT NULL,

    CONSTRAINT "NextOfKin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "creditEmail" BOOLEAN NOT NULL DEFAULT false,
    "creditSms" BOOLEAN NOT NULL DEFAULT false,
    "creditPush" BOOLEAN NOT NULL DEFAULT false,
    "creditWhatsapp" BOOLEAN NOT NULL DEFAULT false,
    "debitEmail" BOOLEAN NOT NULL DEFAULT false,
    "debitSms" BOOLEAN NOT NULL DEFAULT false,
    "debitPush" BOOLEAN NOT NULL DEFAULT false,
    "debitWhatsapp" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ip" TEXT,
    "browser" TEXT,
    "os" TEXT,
    "device" TEXT,
    "location" TEXT,
    "longitude" TEXT,
    "latitude" TEXT,
    "lastUsed" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bill_payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "biller" TEXT,
    "productId" TEXT,
    "productType" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bill_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_userId_key" ON "notification_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "devices_deviceId_key" ON "devices"("deviceId");

-- AddForeignKey
ALTER TABLE "NextOfKin" ADD CONSTRAINT "NextOfKin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill_payments" ADD CONSTRAINT "bill_payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill_payments" ADD CONSTRAINT "bill_payments_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
