-- CreateEnum
CREATE TYPE "AppealFormat" AS ENUM ('WRITTEN', 'VIDEO');

-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('PENDING', 'SCHEDULED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Appeal" ADD COLUMN     "format" "AppealFormat" NOT NULL DEFAULT 'WRITTEN';

-- AlterTable
ALTER TABLE "TeamMember" ADD COLUMN     "email" TEXT;

-- CreateTable
CREATE TABLE "AppealMeeting" (
    "id" TEXT NOT NULL,
    "appealId" TEXT NOT NULL,
    "deputyId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 30,
    "status" "MeetingStatus" NOT NULL DEFAULT 'PENDING',
    "meetLink" TEXT,
    "calendarEventId" TEXT,
    "lastError" TEXT,
    "reminderSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppealMeeting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppealMeeting_appealId_key" ON "AppealMeeting"("appealId");

-- CreateIndex
CREATE INDEX "AppealMeeting_status_idx" ON "AppealMeeting"("status");

-- CreateIndex
CREATE INDEX "AppealMeeting_scheduledAt_idx" ON "AppealMeeting"("scheduledAt");

-- CreateIndex
CREATE INDEX "Appeal_format_idx" ON "Appeal"("format");

-- AddForeignKey
ALTER TABLE "AppealMeeting" ADD CONSTRAINT "AppealMeeting_appealId_fkey" FOREIGN KEY ("appealId") REFERENCES "Appeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppealMeeting" ADD CONSTRAINT "AppealMeeting_deputyId_fkey" FOREIGN KEY ("deputyId") REFERENCES "TeamMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
