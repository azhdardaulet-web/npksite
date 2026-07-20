BEGIN;

-- Защита от частичного обновления: должны существовать все семь RU-тем.
DO $$
DECLARE
  matched_count integer;
BEGIN
  SELECT count(*)
  INTO matched_count
  FROM public.appeal_topics
  WHERE name_ru IN (
    'Общий вопрос',
    'Социальная помощь',
    'ЖКХ и инфраструктура',
    'Образование',
    'Медицина',
    'Труд и занятость',
    'Другое'
  );

  IF matched_count <> 7 THEN
    RAISE EXCEPTION
      'Ожидалось 7 тем обращений, найдено: %. Обновление отменено.',
      matched_count;
  END IF;
END
$$;

UPDATE public.appeal_topics
SET name_kz = CASE name_ru
  WHEN 'Общий вопрос' THEN 'Жалпы сұрақ'
  WHEN 'Социальная помощь' THEN 'Әлеуметтік көмек'
  WHEN 'ЖКХ и инфраструктура' THEN 'Тұрғын үй-коммуналдық шаруашылық және инфрақұрылым'
  WHEN 'Образование' THEN 'Білім'
  WHEN 'Медицина' THEN 'Медицина'
  WHEN 'Труд и занятость' THEN 'Еңбек және жұмыспен қамту'
  WHEN 'Другое' THEN 'Басқа'
  ELSE name_kz
END
WHERE name_ru IN (
  'Общий вопрос',
  'Социальная помощь',
  'ЖКХ и инфраструктура',
  'Образование',
  'Медицина',
  'Труд и занятость',
  'Другое'
);

COMMIT;

-- Результат для ручной проверки в SQL Editor.
SELECT name_ru, name_kz
FROM public.appeal_topics
WHERE name_ru IN (
  'Общий вопрос',
  'Социальная помощь',
  'ЖКХ и инфраструктура',
  'Образование',
  'Медицина',
  'Труд и занятость',
  'Другое'
)
ORDER BY name_ru;
