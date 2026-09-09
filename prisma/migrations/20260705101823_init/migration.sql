-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "passportNumber" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Submitted',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Application_applicationId_key" ON "Application"("applicationId");
