-- Казахская версия заголовка и текста для депутатских запросов.
-- Русская версия остаётся в legacy-полях title/description, поэтому все
-- существующие документы автоматически сохраняют свой текст без переноса.
ALTER TABLE "Document"
  ADD COLUMN "titleKz" TEXT,
  ADD COLUMN "descriptionKz" TEXT;
