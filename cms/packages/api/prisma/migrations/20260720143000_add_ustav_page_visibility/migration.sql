INSERT INTO "Page" ("id", "slug", "isPublished", "createdAt", "updatedAt")
VALUES ('10000000-0000-4000-8000-000000000020', 'ustav', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;
