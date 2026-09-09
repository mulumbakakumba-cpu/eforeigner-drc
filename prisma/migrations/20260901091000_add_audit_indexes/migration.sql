CREATE INDEX "JourneyAuditLog_applicationId_createdAt_idx" ON "JourneyAuditLog"("applicationId", "createdAt");
CREATE INDEX "DocumentAccessLog_applicationId_createdAt_idx" ON "DocumentAccessLog"("applicationId", "createdAt");
CREATE INDEX "Payment_journeyId_status_idx" ON "Payment"("journeyId", "status");
