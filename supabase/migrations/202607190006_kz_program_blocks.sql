BEGIN;

-- Обновляются только keyword_kz и title_kz первых четырёх блоков.
-- Переводы lead1/lead2/points не совпадают со структурой текущих RU-полей.
DO $$
DECLARE
  missing_numbers text;
BEGIN
  SELECT string_agg(source.n::text, ', ' ORDER BY source.n)
  INTO missing_numbers
  FROM (VALUES (1), (2), (3), (4)) AS source(n)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.program_blocks AS block WHERE block.n = source.n
  );

  IF missing_numbers IS NOT NULL THEN
    RAISE EXCEPTION 'Не найдены программные блоки: %. Обновление отменено.', missing_numbers;
  END IF;
END
$$;

UPDATE public.program_blocks AS block
SET
  keyword_kz = source.keyword_kz,
  title_kz = source.title_kz
FROM (
  VALUES
    (1, 'ЕҢБЕК', 'Еңбек адамы'),
    (2, 'СӨЗ', 'Уәдесіне берік мемлекет'),
    (3, 'ЗАҢ', 'Әділдік іске асады'),
    (4, 'АДАМ', 'Адамға қызмет ететін экономика')
) AS source(n, keyword_kz, title_kz)
WHERE block.n = source.n;

COMMIT;

SELECT n, keyword_kz, title_kz
FROM public.program_blocks
WHERE n IN (1, 2, 3, 4)
ORDER BY n;
