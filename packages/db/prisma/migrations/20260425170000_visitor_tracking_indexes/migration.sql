-- Improve active session reuse and admin visitor range aggregation.
CREATE INDEX "visitor_session_visitorIdentityId_isBot_lastSeenAt_idx"
ON "visitor_session"("visitorIdentityId", "isBot", "lastSeenAt");

CREATE INDEX "visitor_session_startedAt_userId_idx"
ON "visitor_session"("startedAt", "userId");
