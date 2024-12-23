/*
  Warnings:

  - You are about to drop the `PhoneNumber` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "OnboardEnum" AS ENUM ('NEW', 'INITIATED', 'PHONE_VERIFIED', 'SET_EMAIL', 'EMAIL_VERIFIED', 'SET_PASSCODE', 'SET_PIN', 'KYB_STARTED', 'KYB_SUBMITTED', 'KYB_APPROVED', 'KYB_FAILED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "AccountProviderEnum" AS ENUM ('BANKONE');

-- CreateEnum
CREATE TYPE "GenderEnum" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "OnboardType" AS ENUM ('NEW', 'EXISTING');

-- CreateEnum
CREATE TYPE "LoginEnum" AS ENUM ('INITIATED', 'PHONE_VERIFIED', 'LOGGED_IN');

-- DropTable
DROP TABLE "PhoneNumber";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "username" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "otherName" TEXT,
    "gender" "GenderEnum",
    "reference" TEXT,
    "password" TEXT,
    "passcode" TEXT,
    "pin" TEXT,
    "dob" TEXT,
    "pob" TEXT,
    "country" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "onboardType" "OnboardType" NOT NULL DEFAULT 'NEW',
    "onboarding" "OnboardEnum" NOT NULL DEFAULT 'NEW',
    "login" "LoginEnum" NOT NULL DEFAULT 'INITIATED',
    "loginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastLogin" TIMESTAMP(3),
    "token" TEXT,
    "otp" TEXT,
    "otpExpires" TIMESTAMP(3),
    "otpId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "cusomterId" TEXT,
    "trackingRef" TEXT,
    "accountNumber" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "AccountProviderEnum" NOT NULL DEFAULT 'BANKONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "residential_addresses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipcode" TEXT NOT NULL,
    "landmark" TEXT NOT NULL,
    "lga" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "residential_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kycs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nationalityStatus" BOOLEAN NOT NULL DEFAULT false,
    "faceVerifyStatus" BOOLEAN NOT NULL DEFAULT false,
    "ninStatus" BOOLEAN NOT NULL DEFAULT false,
    "bvnStatus" BOOLEAN NOT NULL DEFAULT false,
    "attestation" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kycs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_phoneNumber_key" ON "users"("phoneNumber");

-- CreateIndex
CREATE INDEX "users_phoneNumber_idx" ON "users"("phoneNumber");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_id_idx" ON "users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_accountNumber_key" ON "accounts"("accountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_userId_key" ON "accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "residential_addresses_userId_key" ON "residential_addresses"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "kycs_userId_key" ON "kycs"("userId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "residential_addresses" ADD CONSTRAINT "residential_addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kycs" ADD CONSTRAINT "kycs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
