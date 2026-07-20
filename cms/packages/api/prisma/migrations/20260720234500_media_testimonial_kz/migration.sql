-- Казахские поля для раздела «СМИ о нас» и отзывов.
ALTER TABLE "MediaPublication"
  ADD COLUMN "titleKz" TEXT,
  ADD COLUMN "excerptKz" TEXT;

ALTER TABLE "Testimonial"
  ADD COLUMN "quoteKz" TEXT,
  ADD COLUMN "authorKz" TEXT;

ALTER TABLE "Candidate"
  ADD COLUMN "nameKz" TEXT,
  ADD COLUMN "regionKz" TEXT,
  ADD COLUMN "districtKz" TEXT;
