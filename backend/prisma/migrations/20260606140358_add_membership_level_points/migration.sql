-- AlterTable
ALTER TABLE "Membership" ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pointsReward" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Membership_level_idx" ON "Membership"("level");
