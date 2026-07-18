-- AlterEnum
ALTER TYPE "DocumentType" ADD VALUE 'appeal_sample';

-- AlterTable
ALTER TABLE "Appeal" ADD COLUMN     "attachments" JSONB;
