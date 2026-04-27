CREATE TABLE "webhook_event" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "attemptCount" INTEGER NOT NULL DEFAULT 1,
    "errorMessage" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_event_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "webhook_event_provider_eventId_key" ON "webhook_event"("provider", "eventId");
CREATE INDEX "webhook_event_status_createdAt_idx" ON "webhook_event"("status", "createdAt");
CREATE INDEX "webhook_event_eventType_createdAt_idx" ON "webhook_event"("eventType", "createdAt");

