-- AlterTable
ALTER TABLE "public"."Application" ADD COLUMN     "applicationType" TEXT NOT NULL DEFAULT 'RESIDENCE';

-- CreateTable
CREATE TABLE "public"."ResidenceJourney" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "percentage" INTEGER NOT NULL DEFAULT 20,
    "currentStep" TEXT NOT NULL DEFAULT 'ACCOUNT_CREATED',
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ResidenceJourney_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."JourneyStep" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "step" TEXT NOT NULL,
    "percentage" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "notes" TEXT,

    CONSTRAINT "JourneyStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MedicalVerification" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "hospital" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "notes" TEXT,

    CONSTRAINT "MedicalVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reference" TEXT,
    "paidAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ImmigrationReview" (
    "id" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "decision" TEXT,
    "notes" TEXT,

    CONSTRAINT "ImmigrationReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResidenceJourney_applicationId_key" ON "public"."ResidenceJourney"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "JourneyStep_journeyId_step_key" ON "public"."JourneyStep"("journeyId", "step");

-- CreateIndex
CREATE UNIQUE INDEX "MedicalVerification_journeyId_key" ON "public"."MedicalVerification"("journeyId");

-- CreateIndex
CREATE UNIQUE INDEX "ImmigrationReview_journeyId_key" ON "public"."ImmigrationReview"("journeyId");

-- AddForeignKey
ALTER TABLE "public"."ResidenceJourney" ADD CONSTRAINT "ResidenceJourney_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JourneyStep" ADD CONSTRAINT "JourneyStep_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "public"."ResidenceJourney"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MedicalVerification" ADD CONSTRAINT "MedicalVerification_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "public"."ResidenceJourney"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "public"."ResidenceJourney"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ImmigrationReview" ADD CONSTRAINT "ImmigrationReview_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "public"."ResidenceJourney"("id") ON DELETE CASCADE ON UPDATE CASCADE;
