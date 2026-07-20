-- Единый формат ФИО руководства: Фамилия Имя Отчество.
-- Обновляем обе локали существующих записей; seed использует тот же источник.
UPDATE "TeamMemberTranslation" AS translation
SET
  "name" = CASE member."slug"
    WHEN 'shokanov-nursultan' THEN 'Шоканов Нурсултан Нурланович'
    WHEN 'kusainov-bejbut-bulatovich' THEN 'Кусаинов Бейбит Булатович'
    WHEN 'aukenov-miras' THEN 'Аукенов Мирас Серикбекович'
    WHEN 'kurmanbaev-zhandos' THEN 'Курманбаев Жандос Конспаевич'
    WHEN 'maksutov-kalel-mukataevich' THEN 'Максутов Калел Мукатаевич'
  END,
  "updatedAt" = CURRENT_TIMESTAMP
FROM "TeamMember" AS member
WHERE translation."memberId" = member."id"
  AND member."slug" IN (
    'shokanov-nursultan',
    'kusainov-bejbut-bulatovich',
    'aukenov-miras',
    'kurmanbaev-zhandos',
    'maksutov-kalel-mukataevich'
  );
