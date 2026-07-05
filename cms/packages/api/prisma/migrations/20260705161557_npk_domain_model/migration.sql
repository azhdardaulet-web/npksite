-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'CHIEF_EDITOR', 'SECTION_EDITOR', 'FACTION', 'BRANCH_EDITOR', 'RECEPTION_MANAGER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "NewsStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "NewsFormat" AS ENUM ('news', 'party_release', 'article', 'analytics', 'interview');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('image', 'video', 'pdf', 'document');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('ustav', 'deputy_request', 'press_kit', 'other');

-- CreateEnum
CREATE TYPE "Lang" AS ENUM ('ru', 'kz');

-- CreateEnum
CREATE TYPE "TeamMemberGroup" AS ENUM ('LEADERSHIP', 'MEDIA_TEAM');

-- CreateEnum
CREATE TYPE "JoinRequestRole" AS ENUM ('member', 'volunteer', 'observer');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "JoinRequestStatus" AS ENUM ('NEW', 'PROCESSING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AppealStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "branchId" TEXT,
    "section" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "News" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "format" "NewsFormat" NOT NULL,
    "status" "NewsStatus" NOT NULL DEFAULT 'DRAFT',
    "imageUrl" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "readingTime" INTEGER,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tgPosted" BOOLEAN NOT NULL DEFAULT false,
    "tgSkip" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsTranslation" (
    "id" TEXT NOT NULL,
    "newsId" TEXT NOT NULL,
    "lang" "Lang" NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "ogImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryFolder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GalleryFolder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "type" "MediaType" NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "folderId" TEXT,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gallery" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "duration" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "folderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Gallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "photoUrl" TEXT,
    "group" "TeamMemberGroup" NOT NULL DEFAULT 'LEADERSHIP',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMemberTranslation" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "lang" "Lang" NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMemberTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "DocumentType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "year" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageBlock" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageTranslation" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "lang" "Lang" NOT NULL,
    "title" TEXT NOT NULL,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "ogImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "cityRu" TEXT NOT NULL,
    "cityKz" TEXT NOT NULL,
    "addressRu" TEXT NOT NULL,
    "addressKz" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "department" TEXT,
    "chairman" TEXT,
    "lng" DOUBLE PRECISION,
    "lat" DOUBLE PRECISION,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JoinRequest" (
    "id" TEXT NOT NULL,
    "role" "JoinRequestRole" NOT NULL DEFAULT 'member',
    "fullName" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "branchId" TEXT,
    "status" "JoinRequestStatus" NOT NULL DEFAULT 'NEW',
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "merchAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JoinRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppealTopic" (
    "id" TEXT NOT NULL,
    "nameRu" TEXT NOT NULL,
    "nameKz" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppealTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appeal" (
    "id" TEXT NOT NULL,
    "appealNumber" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "topicId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "fileUrl" TEXT,
    "status" "AppealStatus" NOT NULL DEFAULT 'NEW',
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsCode" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SmsCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopSubscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShopSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "district" TEXT,
    "photoUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateTranslation" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "lang" "Lang" NOT NULL,
    "promise" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoryEvent" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HistoryEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoryEventTranslation" (
    "id" TEXT NOT NULL,
    "historyEventId" TEXT NOT NULL,
    "lang" "Lang" NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HistoryEventTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramBlock" (
    "id" TEXT NOT NULL,
    "n" INTEGER NOT NULL,
    "keyword" TEXT NOT NULL,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramBlockTranslation" (
    "id" TEXT NOT NULL,
    "programBlockId" TEXT NOT NULL,
    "lang" "Lang" NOT NULL,
    "title" TEXT NOT NULL,
    "lead1" TEXT,
    "lead2" TEXT,
    "points" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramBlockTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaProject" (
    "id" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "url" TEXT,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaProjectTranslation" (
    "id" TEXT NOT NULL,
    "mediaProjectId" TEXT NOT NULL,
    "lang" "Lang" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaProjectTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaPublication" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "sourceType" TEXT NOT NULL,
    "mediaName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT,
    "imageUrl" TEXT,
    "url" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaPublication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "labelRu" TEXT NOT NULL,
    "labelKz" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "parentId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faq" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "lang" "Lang" NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_branchId_idx" ON "User"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_tokenHash_idx" ON "RefreshToken"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "News_slug_key" ON "News"("slug");

-- CreateIndex
CREATE INDEX "News_status_idx" ON "News"("status");

-- CreateIndex
CREATE INDEX "News_format_idx" ON "News"("format");

-- CreateIndex
CREATE INDEX "News_publishedAt_idx" ON "News"("publishedAt");

-- CreateIndex
CREATE INDEX "News_slug_idx" ON "News"("slug");

-- CreateIndex
CREATE INDEX "NewsTranslation_newsId_idx" ON "NewsTranslation"("newsId");

-- CreateIndex
CREATE INDEX "NewsTranslation_lang_idx" ON "NewsTranslation"("lang");

-- CreateIndex
CREATE UNIQUE INDEX "NewsTranslation_newsId_lang_key" ON "NewsTranslation"("newsId", "lang");

-- CreateIndex
CREATE INDEX "GalleryFolder_parentId_idx" ON "GalleryFolder"("parentId");

-- CreateIndex
CREATE INDEX "Media_folderId_idx" ON "Media"("folderId");

-- CreateIndex
CREATE INDEX "Media_type_idx" ON "Media"("type");

-- CreateIndex
CREATE INDEX "Media_uploadedById_idx" ON "Media"("uploadedById");

-- CreateIndex
CREATE INDEX "Gallery_folderId_idx" ON "Gallery"("folderId");

-- CreateIndex
CREATE INDEX "Gallery_sortOrder_idx" ON "Gallery"("sortOrder");

-- CreateIndex
CREATE INDEX "TeamMember_sortOrder_idx" ON "TeamMember"("sortOrder");

-- CreateIndex
CREATE INDEX "TeamMember_group_idx" ON "TeamMember"("group");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMemberTranslation_memberId_lang_key" ON "TeamMemberTranslation"("memberId", "lang");

-- CreateIndex
CREATE INDEX "Document_type_idx" ON "Document"("type");

-- CreateIndex
CREATE INDEX "Document_year_idx" ON "Document"("year");

-- CreateIndex
CREATE UNIQUE INDEX "Page_slug_key" ON "Page"("slug");

-- CreateIndex
CREATE INDEX "Page_slug_idx" ON "Page"("slug");

-- CreateIndex
CREATE INDEX "PageBlock_pageId_sortOrder_idx" ON "PageBlock"("pageId", "sortOrder");

-- CreateIndex
CREATE INDEX "PageTranslation_pageId_idx" ON "PageTranslation"("pageId");

-- CreateIndex
CREATE UNIQUE INDEX "PageTranslation_pageId_lang_key" ON "PageTranslation"("pageId", "lang");

-- CreateIndex
CREATE INDEX "Branch_sortOrder_idx" ON "Branch"("sortOrder");

-- CreateIndex
CREATE INDEX "JoinRequest_status_idx" ON "JoinRequest"("status");

-- CreateIndex
CREATE INDEX "JoinRequest_phone_idx" ON "JoinRequest"("phone");

-- CreateIndex
CREATE INDEX "JoinRequest_branchId_idx" ON "JoinRequest"("branchId");

-- CreateIndex
CREATE INDEX "JoinRequest_createdAt_idx" ON "JoinRequest"("createdAt");

-- CreateIndex
CREATE INDEX "AppealTopic_sortOrder_idx" ON "AppealTopic"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Appeal_appealNumber_key" ON "Appeal"("appealNumber");

-- CreateIndex
CREATE INDEX "Appeal_status_idx" ON "Appeal"("status");

-- CreateIndex
CREATE INDEX "Appeal_appealNumber_idx" ON "Appeal"("appealNumber");

-- CreateIndex
CREATE INDEX "Appeal_createdAt_idx" ON "Appeal"("createdAt");

-- CreateIndex
CREATE INDEX "SmsCode_phone_idx" ON "SmsCode"("phone");

-- CreateIndex
CREATE INDEX "SmsCode_createdAt_idx" ON "SmsCode"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ShopSubscriber_email_key" ON "ShopSubscriber"("email");

-- CreateIndex
CREATE INDEX "Candidate_sortOrder_idx" ON "Candidate"("sortOrder");

-- CreateIndex
CREATE INDEX "Candidate_region_idx" ON "Candidate"("region");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateTranslation_candidateId_lang_key" ON "CandidateTranslation"("candidateId", "lang");

-- CreateIndex
CREATE INDEX "HistoryEvent_sortOrder_idx" ON "HistoryEvent"("sortOrder");

-- CreateIndex
CREATE INDEX "HistoryEvent_year_idx" ON "HistoryEvent"("year");

-- CreateIndex
CREATE UNIQUE INDEX "HistoryEventTranslation_historyEventId_lang_key" ON "HistoryEventTranslation"("historyEventId", "lang");

-- CreateIndex
CREATE INDEX "ProgramBlock_sortOrder_idx" ON "ProgramBlock"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramBlockTranslation_programBlockId_lang_key" ON "ProgramBlockTranslation"("programBlockId", "lang");

-- CreateIndex
CREATE INDEX "MediaProject_sortOrder_idx" ON "MediaProject"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "MediaProjectTranslation_mediaProjectId_lang_key" ON "MediaProjectTranslation"("mediaProjectId", "lang");

-- CreateIndex
CREATE INDEX "MediaPublication_sortOrder_idx" ON "MediaPublication"("sortOrder");

-- CreateIndex
CREATE INDEX "MediaPublication_date_idx" ON "MediaPublication"("date");

-- CreateIndex
CREATE INDEX "Testimonial_sortOrder_idx" ON "Testimonial"("sortOrder");

-- CreateIndex
CREATE INDEX "MenuItem_parentId_idx" ON "MenuItem"("parentId");

-- CreateIndex
CREATE INDEX "MenuItem_sortOrder_idx" ON "MenuItem"("sortOrder");

-- CreateIndex
CREATE INDEX "Faq_lang_idx" ON "Faq"("lang");

-- CreateIndex
CREATE INDEX "Faq_sortOrder_idx" ON "Faq"("sortOrder");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "News" ADD CONSTRAINT "News_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsTranslation" ADD CONSTRAINT "NewsTranslation_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "News"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryFolder" ADD CONSTRAINT "GalleryFolder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "GalleryFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "GalleryFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gallery" ADD CONSTRAINT "Gallery_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gallery" ADD CONSTRAINT "Gallery_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "GalleryFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMemberTranslation" ADD CONSTRAINT "TeamMemberTranslation_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "TeamMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageBlock" ADD CONSTRAINT "PageBlock_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageTranslation" ADD CONSTRAINT "PageTranslation_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JoinRequest" ADD CONSTRAINT "JoinRequest_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appeal" ADD CONSTRAINT "Appeal_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "AppealTopic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateTranslation" ADD CONSTRAINT "CandidateTranslation_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoryEventTranslation" ADD CONSTRAINT "HistoryEventTranslation_historyEventId_fkey" FOREIGN KEY ("historyEventId") REFERENCES "HistoryEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramBlockTranslation" ADD CONSTRAINT "ProgramBlockTranslation_programBlockId_fkey" FOREIGN KEY ("programBlockId") REFERENCES "ProgramBlock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaProjectTranslation" ADD CONSTRAINT "MediaProjectTranslation_mediaProjectId_fkey" FOREIGN KEY ("mediaProjectId") REFERENCES "MediaProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "MenuItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
