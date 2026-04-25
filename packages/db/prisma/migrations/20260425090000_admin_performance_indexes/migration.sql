-- CreateIndex
CREATE INDEX "user_createdAt_idx" ON "user"("createdAt");

-- CreateIndex
CREATE INDEX "user_role_idx" ON "user"("role");

-- CreateIndex
CREATE INDEX "user_banned_idx" ON "user"("banned");

-- CreateIndex
CREATE INDEX "user_archived_idx" ON "user"("archived");

-- CreateIndex
CREATE INDEX "invitation_email_idx" ON "invitation"("email");

-- CreateIndex
CREATE INDEX "invitation_status_idx" ON "invitation"("status");

-- CreateIndex
CREATE INDEX "invitation_expiresAt_idx" ON "invitation"("expiresAt");

-- CreateIndex
CREATE INDEX "feedback_createdAt_idx" ON "feedback"("createdAt");

-- CreateIndex
CREATE INDEX "feedback_status_idx" ON "feedback"("status");

-- CreateIndex
CREATE INDEX "notification_userId_createdAt_idx" ON "notification"("userId", "createdAt");
