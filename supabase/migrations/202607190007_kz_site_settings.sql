BEGIN;

-- Контракт миграции: site_settings(key, value_ru, value_kz).
DO $$
DECLARE
  missing_keys text;
BEGIN
  SELECT string_agg(source.key, ', ' ORDER BY source.key)
  INTO missing_keys
  FROM (
    VALUES
      ('homepage_years_label'),
      ('homepage_media_followers_label'),
      ('homepage_branches_label'),
      ('homepage_requests_label'),
      ('reception_solved_label'),
      ('reception_avg_response_label'),
      ('reception_branches_label'),
      ('reception_whatsapp_response_note'),
      ('contact_email_label'),
      ('contact_phone_label'),
      ('contact_office_label'),
      ('contact_office_address')
  ) AS source(key)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.site_settings AS setting WHERE setting.key = source.key
  );

  IF missing_keys IS NOT NULL THEN
    RAISE EXCEPTION 'Не найдены настройки: %. Обновление отменено.', missing_keys;
  END IF;
END
$$;

UPDATE public.site_settings AS setting
SET value_kz = source.value_kz
FROM (
  VALUES
    ('homepage_years_label', 'жыл қызмет'),
    ('homepage_media_followers_label', 'ресми медиаресурс жазылушысы'),
    ('homepage_branches_label', 'өңірлік филиал'),
    ('homepage_requests_label', 'депутаттық сауал'),
    ('reception_solved_label', 'шешілген өтініш'),
    ('reception_avg_response_label', 'орташа жауап мерзімі'),
    ('reception_branches_label', 'қабылдау жүргізетін филиал'),
    ('reception_whatsapp_response_note', 'әдетте бір күн ішінде жауап береміз'),
    ('contact_email_label', 'Электрондық пошта'),
    ('contact_phone_label', 'Телефон'),
    ('contact_office_label', 'Кеңсе'),
    ('contact_office_address', 'Астана, Желтоқсан көшесі, 16, Қазақстан')
) AS source(key, value_kz)
WHERE setting.key = source.key;

COMMIT;

SELECT key, value_ru, value_kz
FROM public.site_settings
WHERE key IN (
  'homepage_years_label',
  'homepage_media_followers_label',
  'homepage_branches_label',
  'homepage_requests_label',
  'reception_solved_label',
  'reception_avg_response_label',
  'reception_branches_label',
  'reception_whatsapp_response_note',
  'contact_email_label',
  'contact_phone_label',
  'contact_office_label',
  'contact_office_address'
)
ORDER BY key;
