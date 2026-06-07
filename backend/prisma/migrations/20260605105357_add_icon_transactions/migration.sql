-- CreateTable
CREATE TABLE "IconTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IconTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IconTransaction_userId_idx" ON "IconTransaction"("userId");

-- CreateIndex
CREATE INDEX "IconTransaction_type_idx" ON "IconTransaction"("type");

-- CreateIndex
CREATE INDEX "IconTransaction_createdAt_idx" ON "IconTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "IconTransaction_userId_createdAt_idx" ON "IconTransaction"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "IconTransaction" ADD CONSTRAINT "IconTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
