/*
  Warnings:

  - You are about to drop the `NextOfKin` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Relationship" AS ENUM ('FATHER', 'MOTHER', 'SIBLING', 'FRIEND');

-- DropForeignKey
ALTER TABLE "NextOfKin" DROP CONSTRAINT "NextOfKin_userId_fkey";

-- AlterTable
ALTER TABLE "kycs" ADD COLUMN     "nextOfKinStatus" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "NextOfKin";

-- CreateTable
CREATE TABLE "next_of_kins" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT,
    "country" TEXT,
    "relationship" "Relationship" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "next_of_kins_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "next_of_kins" ADD CONSTRAINT "next_of_kins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
