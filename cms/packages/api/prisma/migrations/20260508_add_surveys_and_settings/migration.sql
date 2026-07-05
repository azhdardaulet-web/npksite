-- CreateEnum
CREATE TYPE "SurveyType" AS ENUM ('transportation', 'forwarding');

-- CreateTable
CREATE TABLE "SurveySubmission" (
    "id" TEXT NOT NULL,
    "surveyType" "SurveyType" NOT NULL,
    "company" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SurveySubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "SurveySubmission_surveyType_idx" ON "SurveySubmission"("surveyType");

-- CreateIndex
CREATE INDEX "SurveySubmission_createdAt_idx" ON "SurveySubmission"("createdAt");

-- Seed default settings
INSERT INTO "Setting" ("key", "value", "updatedAt") VALUES
  ('survey_notification_email', '', NOW()),
  ('survey_notifications_enabled', 'false', NOW())
ON CONFLICT ("key") DO NOTHING;
