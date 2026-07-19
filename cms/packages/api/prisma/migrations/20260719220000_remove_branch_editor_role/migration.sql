-- Редакторов филиала переводим в редакторы раздела до удаления старого enum.
-- Роль аппарата фракции переименовываем в понятную для НПК роль депутата.
ALTER TYPE "Role" RENAME TO "Role_old";

CREATE TYPE "Role" AS ENUM (
  'ADMIN',
  'CHIEF_EDITOR',
  'SECTION_EDITOR',
  'RECEPTION_MANAGER',
  'DEPUTY'
);

ALTER TABLE "User"
  ALTER COLUMN "role" TYPE "Role"
  USING (
    CASE "role"::text
      WHEN 'BRANCH_EDITOR' THEN 'SECTION_EDITOR'
      WHEN 'FACTION' THEN 'DEPUTY'
      ELSE "role"::text
    END
  )::"Role";

UPDATE "User"
SET "branchId" = NULL
WHERE "branchId" IS NOT NULL;

DROP TYPE "Role_old";
