-- CreateTable
CREATE TABLE "public"."DocumentAccessLog" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentAccessLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."DocumentAccessLog" ADD CONSTRAINT "DocumentAccessLog_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
