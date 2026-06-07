-- AlterTable
ALTER TABLE "ChallengeResponse" ADD COLUMN     "awardedAt" TIMESTAMP(3),
ADD COLUMN     "awardedBy" TEXT,
ADD COLUMN     "pointsAwarded" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "ChallengeResponse_pointsAwarded_idx" ON "ChallengeResponse"("pointsAwarded");
