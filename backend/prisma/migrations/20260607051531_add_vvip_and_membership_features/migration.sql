-- AlterTable
ALTER TABLE "Membership" ADD COLUMN     "challengeAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "communityAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "vipSeat" BOOLEAN NOT NULL DEFAULT false;
