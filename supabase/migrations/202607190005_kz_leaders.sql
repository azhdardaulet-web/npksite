BEGIN;

-- Полные биографии не обновляются: full_bio_kz отсутствует в источнике.
DO $$
DECLARE
  missing_slugs text;
BEGIN
  SELECT string_agg(source.slug, ', ' ORDER BY source.slug)
  INTO missing_slugs
  FROM (
    VALUES
      ('shokanov-nursultan'),
      ('kusainov-bejbut-bulatovich'),
      ('aukenov-miras'),
      ('kurmanbaev-zhandos'),
      ('maksutov-kalel-mukataevich')
  ) AS source(slug)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.leaders AS leader WHERE leader.slug = source.slug
  );

  IF missing_slugs IS NOT NULL THEN
    RAISE EXCEPTION 'Не найдены руководители: %. Обновление отменено.', missing_slugs;
  END IF;
END
$$;

UPDATE public.leaders AS leader
SET
  name_kz = source.name_kz,
  position_kz = source.position_kz,
  bio_kz = source.bio_kz
FROM (
  VALUES
    ('shokanov-nursultan', 'Нұрсұлтан Шоқанов', 'Партия төрағасы', 'Партияны 2026 жылдан бері басқарады. Бұған дейін ҚХП-ның Алматы қалалық және Алматы облыстық филиалдарын басқарған. Алматы қаласы VIII шақырылым мәслихатының депутаты.'),
    ('kusainov-bejbut-bulatovich', 'Бейбіт Құсайынов', 'Партия төрағасының орынбасары', 'ҚХП Алматы қалалық филиалының төрағасы, Алматы қаласы VIII шақырылым мәслихатының депутаты, мәдениет, спорт және жастар мәселелері жөніндегі комиссияның төрағасы.'),
    ('aukenov-miras', 'Мирас Әукенов', 'Партия төрағасының орынбасары', 'Партияда 2022 жылдан бері қызмет етеді. Бұған дейін TALAP талдау орталығының атқарушы директоры болған. «Ерен еңбегі үшін» және «Халық алғысы» медальдарымен марапатталған.'),
    ('kurmanbaev-zhandos', 'Жандос Құрманбаев', 'Партия төрағасының стратегия және идеология жөніндегі орынбасары', '2026 жылдан бері партияның стратегиясы мен идеологиясына жауап береді. 2023 жылдан бері медиа жөніндегі кеңесші. Маркетинг, қоғаммен байланыс және теледидар салаларында тәжірибесі бар.'),
    ('maksutov-kalel-mukataevich', 'Кәлел Мақсұтов', 'Партия төрағасының орынбасары', 'ҚХП-ның Қарағанды облыстық филиалын да басқарады. Бұған дейін Қарқаралы ауданының әкімі болған, Атырау облысының әкімдіктерінде жұмыс істеген.')
) AS source(slug, name_kz, position_kz, bio_kz)
WHERE leader.slug = source.slug;

COMMIT;

SELECT slug, name_kz, position_kz, bio_kz
FROM public.leaders
WHERE slug IN (
  'shokanov-nursultan',
  'kusainov-bejbut-bulatovich',
  'aukenov-miras',
  'kurmanbaev-zhandos',
  'maksutov-kalel-mukataevich'
)
ORDER BY sort_order, slug;
