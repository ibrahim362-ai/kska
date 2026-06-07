/*
  Warnings:

  - A unique constraint covering the columns `[referralCode]` on the table `TicketPurchase` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "TicketPurchase" ADD COLUMN     "referralCode" TEXT,
ADD COLUMN     "referredBy" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "TicketPurchase_referralCode_key" ON "TicketPurchase"("referralCode");

-- CreateIndex
CREATE INDEX "TicketPurchase_referralCode_idx" ON "TicketPurchase"("referralCode");

-- CreateIndex
CREATE INDEX "TicketPurchase_referredBy_idx" ON "TicketPurchase"("referredBy");
