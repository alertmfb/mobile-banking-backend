-- CreateTable
CREATE TABLE "kyc_user_details" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT,
    "phoneOne" TEXT,
    "phoneTwo" TEXT,
    "title" TEXT,
    "maritalStatus" TEXT,
    "residentialAddress" TEXT,
    "residentialLga" TEXT,
    "residentialState" TEXT,
    "originLga" TEXT,
    "originState" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kyc_user_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "cardType" TEXT NOT NULL,
    "pickupBranch" TEXT NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "kyc_user_details_userId_key" ON "kyc_user_details"("userId");

-- AddForeignKey
ALTER TABLE "kyc_user_details" ADD CONSTRAINT "kyc_user_details_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
