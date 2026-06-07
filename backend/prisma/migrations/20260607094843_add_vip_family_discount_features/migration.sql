-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "familyTicket" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasVipOption" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxFamilyMembers" INTEGER,
ADD COLUMN     "pointsReward" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "vipPoints" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "vipPrice" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "TicketPurchase" ADD COLUMN     "familyMembers" TEXT,
ADD COLUMN     "finalPrice" DOUBLE PRECISION,
ADD COLUMN     "isGift" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVip" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pointsAwarded" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "recipientEmail" TEXT,
ADD COLUMN     "recipientName" TEXT,
ADD COLUMN     "recipientPhone" TEXT;
