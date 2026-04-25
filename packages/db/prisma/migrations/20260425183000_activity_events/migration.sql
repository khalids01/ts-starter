-- CreateTable
CREATE TABLE "activity_event" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "actorUserId" TEXT,
  "targetUserId" TEXT,
  "visitorId" TEXT,
  "severity" TEXT NOT NULL DEFAULT 'info',
  "message" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "activity_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_event_createdAt_idx" ON "activity_event"("createdAt");

-- CreateIndex
CREATE INDEX "activity_event_type_createdAt_idx" ON "activity_event"("type", "createdAt");

-- CreateIndex
CREATE INDEX "activity_event_actorUserId_createdAt_idx" ON "activity_event"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "activity_event_targetUserId_createdAt_idx" ON "activity_event"("targetUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "activity_event"
ADD CONSTRAINT "activity_event_actorUserId_fkey"
FOREIGN KEY ("actorUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_event"
ADD CONSTRAINT "activity_event_targetUserId_fkey"
FOREIGN KEY ("targetUserId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
