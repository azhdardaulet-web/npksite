-- Единый формат ФИО руководства: Фамилия Имя Отчество.
-- Для каждой локали сохраняется собственное написание имени.
UPDATE "TeamMemberTranslation" AS translation
SET
  "name" = CASE translation."lang"
    WHEN 'kz' THEN CASE member."slug"
      WHEN 'shokanov-nursultan' THEN 'Шоқанов Нұрсұлтан Нұрланұлы'
      WHEN 'kusainov-bejbut-bulatovich' THEN 'Құсайынов Бейбіт Болатұлы'
      WHEN 'aukenov-miras' THEN 'Әукенов Мирас Серікбекұлы'
      WHEN 'kurmanbaev-zhandos' THEN 'Құрманбаев Жандос'
      WHEN 'maksutov-kalel-mukataevich' THEN 'Мақсұтов Кәлел Мұқатайұлы'
    END
    ELSE CASE member."slug"
      WHEN 'shokanov-nursultan' THEN 'Шоканов Нурсултан Нурланович'
      WHEN 'kusainov-bejbut-bulatovich' THEN 'Кусаинов Бейбит Булатович'
      WHEN 'aukenov-miras' THEN 'Аукенов Мирас Серикбекович'
      WHEN 'kurmanbaev-zhandos' THEN 'Курманбаев Жандос Конспаевич'
      WHEN 'maksutov-kalel-mukataevich' THEN 'Максутов Калел Мукатаевич'
    END
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
