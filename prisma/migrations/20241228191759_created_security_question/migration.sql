/*
  Warnings:

  - Added the required column `number` to the `security_questions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "security_questions" ADD COLUMN     "number" INTEGER NOT NULL;
