CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE "JoinRequest"
  ADD COLUMN "memberNumber" TEXT,
  ADD COLUMN "fullNameKz" TEXT,
  ADD COLUMN "fullNameRu" TEXT,
  ADD COLUMN "joinDate" DATE,
  ADD COLUMN "cardFileUrl" TEXT,
  ADD COLUMN "verifyUuid" UUID NOT NULL DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX "JoinRequest_memberNumber_key" ON "JoinRequest"("memberNumber");
CREATE UNIQUE INDEX "JoinRequest_verifyUuid_key" ON "JoinRequest"("verifyUuid");

INSERT INTO "Setting" ("key", "value", "updatedAt")
VALUES ('member_number_start', '', CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;
