-- CreateTable
CREATE TABLE "Challenge" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'GENERAL',
    "imageUrl" TEXT,
    "points" INTEGER NOT NULL DEFAULT 10,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxResponses" INTEGER,
    "totalResponses" INTEGER NOT NULL DEFAULT 0,
    "acceptCount" INTEGER NOT NULL DEFAULT 0,
    "rejectCount" INTEGER NOT NULL DEFAULT 0,
    "skipCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeResponse" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "content" TEXT,
    "mediaUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChallengeResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Challenge_creatorId_idx" ON "Challenge"("creatorId");

-- CreateIndex
CREATE INDEX "Challenge_isActive_idx" ON "Challenge"("isActive");

-- CreateIndex
CREATE INDEX "Challenge_startsAt_idx" ON "Challenge"("startsAt");

-- CreateIndex
CREATE INDEX "Challenge_endsAt_idx" ON "Challenge"("endsAt");

-- CreateIndex
CREATE INDEX "Challenge_type_idx" ON "Challenge"("type");

-- CreateIndex
CREATE INDEX "ChallengeResponse_challengeId_idx" ON "ChallengeResponse"("challengeId");

-- CreateIndex
CREATE INDEX "ChallengeResponse_userId_idx" ON "ChallengeResponse"("userId");

-- CreateIndex
CREATE INDEX "ChallengeResponse_action_idx" ON "ChallengeResponse"("action");

-- CreateIndex
CREATE INDEX "ChallengeResponse_createdAt_idx" ON "ChallengeResponse"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeResponse_challengeId_userId_key" ON "ChallengeResponse"("challengeId", "userId");

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeResponse" ADD CONSTRAINT "ChallengeResponse_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeResponse" ADD CONSTRAINT "ChallengeResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
