-- CreateTable
CREATE TABLE "public"."JourneyAuditLog" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "officerId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "fromStep" TEXT,
    "toStep" TEXT,
    "fromPercentage" INTEGER,
    "toPercentage" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JourneyAuditLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."JourneyAuditLog" ADD CONSTRAINT "JourneyAuditLog_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JourneyAuditLog" ADD CONSTRAINT "JourneyAuditLog_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "public"."ResidenceJourney"("id") ON DELETE CASCADE ON UPDATE CASCADE;
