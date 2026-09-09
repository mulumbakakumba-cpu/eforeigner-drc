/*
  Warnings:

  - A unique constraint covering the columns `[idempotencyKey]` on the table `Application` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Application" ADD COLUMN     "idempotencyKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Application_idempotencyKey_key" ON "public"."Application"("idempotencyKey");
