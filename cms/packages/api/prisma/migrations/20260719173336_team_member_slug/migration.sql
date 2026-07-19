-- AlterTable
ALTER TABLE "TeamMember" ADD COLUMN "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_slug_key" ON "TeamMember"("slug");
