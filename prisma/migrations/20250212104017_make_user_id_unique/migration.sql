/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `next_of_kins` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "next_of_kins_userId_key" ON "next_of_kins"("userId");
