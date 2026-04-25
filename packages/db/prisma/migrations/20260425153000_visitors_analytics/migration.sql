-- CreateTable
CREATE TABLE "visitor_identity" (
  "id" TEXT NOT NULL,
  "visitorId" TEXT NOT NULL,
  "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "firstUserId" TEXT,
  "lastUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "visitor_identity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visitor_session" (
  "id" TEXT NOT NULL,
  "visitorIdentityId" TEXT NOT NULL,
  "userId" TEXT,
  "isBot" BOOLEAN NOT NULL DEFAULT false,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "entryPath" TEXT NOT NULL,
  "lastPath" TEXT NOT NULL,
  "referrer" TEXT,
  "deviceType" TEXT,
  "country" TEXT,
  "ipHash" TEXT,
  "eventCount" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "visitor_session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "visitor_identity_visitorId_key" ON "visitor_identity"("visitorId");

-- CreateIndex
CREATE INDEX "visitor_identity_firstSeenAt_idx" ON "visitor_identity"("firstSeenAt");

-- CreateIndex
CREATE INDEX "visitor_identity_lastSeenAt_idx" ON "visitor_identity"("lastSeenAt");

-- CreateIndex
CREATE INDEX "visitor_session_visitorIdentityId_startedAt_idx" ON "visitor_session"("visitorIdentityId", "startedAt");

-- CreateIndex
CREATE INDEX "visitor_session_lastSeenAt_idx" ON "visitor_session"("lastSeenAt");

-- CreateIndex
CREATE INDEX "visitor_session_startedAt_idx" ON "visitor_session"("startedAt");

-- CreateIndex
CREATE INDEX "visitor_session_isBot_startedAt_idx" ON "visitor_session"("isBot", "startedAt");

-- CreateIndex
CREATE INDEX "visitor_session_userId_startedAt_idx" ON "visitor_session"("userId", "startedAt");

-- AddForeignKey
ALTER TABLE "visitor_session"
ADD CONSTRAINT "visitor_session_visitorIdentityId_fkey"
FOREIGN KEY ("visitorIdentityId") REFERENCES "visitor_identity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
