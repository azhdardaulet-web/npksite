# ТЗ: CMS + CRM для сайта НПК (Блок 2)

## Правки заказчика от 22.06.2026 — выполнено

- Главная и `/novosti`: слайдер получает 10 последних опубликованных новостей и обновляется ежедневно в 07:00 по времени Астаны.
- «Голос партии»: 10 последних видео YouTube, обновление кэша после 07:00 по времени Астаны.
- «Лица партии» временно заменены на «Руководство партии» без подзаголовка.
- Карточки программы связаны якорями с нужными разделами, тексты трёх баннеров обновлены.
- Текст блока вступления обновлён; дата выборов подтверждена как 23 августа 2026 года.
- Подключены новые русская и казахская версии видео, программы и устава из `content/new files`.
- Страница устава получила кнопку скачивания и встроенный просмотр PDF в стилистике сайта.
- В руководство добавлены заместители Председателя Лейла Куленова и Ильмира Жумат с карточками и персональными страницами.
- Для формы вступления добавлен резервный список из 20 филиалов на случай недоступности CMS.
- Внесены редакторские правки верхних разделов от 22.07.2026: блок «О партии», история партии и формулировки программных баннеров; отдельный раздел «Состав фракции» снят с публикации.
- Обновлены показатели фракции до 7 законопроектов, 3217+ поправок и 154+ запросов; перенесён архив из 192 депутатских запросов за 20 страниц с полными HTML-текстами и встроенными PDF для ранних материалов, архив доступен в русском и казахском режимах; выровнена bento-сетка достижений.
- Выполнены правки группы 3 для «Народного медиа»: из меню пресс-центра убраны «Галерея» и «Видео», обновлены тексты, светлая тема и бегущая строка, добавлены обложки программ, студийные фотографии и четыре карточки медиакоманды с персональными страницами на русском и казахском языках.

## Пошаговая инструкция для разработки через вайб-кодинг

**Исполнитель:** DA Digital · **Инструменты:** Claude Code + VS Code + Antigravity
**Исходная точка:** фронтенд готов (React 19 + TypeScript + React Router v6 + Tailwind, SPA). Все данные хардкожены, формы — имитация без бэкенда.
**Дедлайн по ТЗ:** Блок 2 — до 10 июля 2026.

> **Ревизия архитектуры (актуальная):** первая версия этого документа предлагала Supabase. От неё отказались — в проекте уже есть папка `cms/`, рабочий backend+admin (Node.js/Express/Prisma/PostgreSQL/MinIO), перенесённый и отточенный автором на другом проекте (DAR Rail). Решено адаптировать этот код под НПК на месте, а не поднимать Supabase с нуля. Часть 1 и Часть 2 ниже написаны под это решение.

---

## Часть 0. Что именно извлечено из ТЗ (scope Блока 2)

### CMS (раздел 6 ТЗ)

| № | Функция | Детали из ТЗ |
|---|---|---|
| 6.1 | Роли и доступы | 5 ролей после правок №2: Администратор, Главный редактор, Редактор раздела, Менеджер приёмной, Депутат |
| 6.2 | Управление новостями | Заголовок RU/KZ, текст, фото, категория, теги. Кнопки: черновик / опубликовать / запланировать (дата-время). После публикации → автопост в Telegram. Поиск по новостям на сайте |
| 6.3 | Управление страницами | Редактирование текстовых блоков через визуальный редактор, замена фото без разработчика, управление меню, загрузка PDF (Устав, депутатские запросы) |
| 6.4 | Заявки на вступление | Все заявки с /vstupit → раздел «Заявки». Статусы: Новая → В обработке → Принята → Отклонена. Экспорт в Excel. Email-уведомление ответственному |
| 6.5 | Обращения граждан | Все обращения с /priemnaya → раздел «Обращения». Внутренние заметки, смена статуса, email-уведомление заявителю при смене статуса |

### CRM-функции (разделы 5.8, 5.9 ТЗ)

| Функция | Детали |
|---|---|
| Форма вступления с SMS | 4 шага: ФИО+дата рождения+пол → телефон+email+город → SMS-код → экран успеха. SMS-шлюз: mobizon.kz / smsway.kz / SMSC (~15–25 ₸/SMS, оплачивает заказчик). Опционально после успеха — блок доставки мерча (вопрос открыт) |
| Письменное обращение | ФИО, телефон/email, тема (выпадающий список), текст, файл (PDF/JPG). После отправки — номер обращения + уведомление на email. Всё падает в CRM |
| Видеоприём [NEW] | Как онлайн-запись к нотариусу: выбор депутата → дата → слот → SMS-подтверждение. Видеозвонок в браузере (WebRTC), без Zoom/Teams. SMS+email напоминание за 1 час. Депутат управляет расписанием через личный кабинет |

### AI-функции (раздел 7 ТЗ)

| Функция | Детали |
|---|---|
| Чат-бот | Claude API. База знаний: контент сайта + программа + FAQ. Отвечает на языке обращения (RU/KZ). Не генерирует политических высказываний. Виджет в правом нижнем углу на всех страницах. Бюджет API ~30 000 ₸/мес — оплачивает заказчик |
| Автопостинг в Telegram | Новость опубликована в CMS → пост в @halykparty: заголовок + лид (200 симв.) + ссылка + фото. Задержка 0/5–15 мин настраивается. Кнопка «Не публиковать в TG» на каждой новости. Нужен Bot Token от @BotFather |

### Технические требования (раздел 8 ТЗ)

- Backend: собственная разработка (Node.js или аналог), **без WordPress**
- БД: **PostgreSQL**
- Безопасность: защита от SQL-инъекций и XSS, reCAPTCHA на формах, **2FA для администраторов CMS**, ежедневные бэкапы, соответствие закону РК о персональных данных
- SEO: sitemap.xml генерируется автоматически при публикации
- Хостинг: облачный (казахстанский или европейский), SSL обязателен
- CDN: Cloudflare

### Что НЕ входит в этот документ (отдельные этапы)

- Магазин мерча (Фаза 2, после решения логистики, Kaspi Pay) — отдельные 14 рабочих дней
- AI-видеообращения через HeyGen — вне scope, отдельный проект

---

## Часть 1. Архитектурное решение

Backend и админка **уже существуют** в папке `cms/` — это рабочий проект DAR Rail CMS, перенесённый и отточенный автором на предыдущей работе. Решение — **адаптировать его на месте под НПК**, а не поднимать новую инфраструктуру (Supabase из первой версии этого документа отменяется).

**Стек (уже в проекте, не меняется):**

| Часть | Расположение | Технологии |
|---|---|---|
| API | `cms/packages/api` | Node.js 20 + Express 5 + Prisma + PostgreSQL 16 |
| Админка | `cms/packages/cms` | React 19 + Vite + Tailwind |
| Общие типы/схемы | `cms/packages/shared` | Zod-схемы, переиспользуются и в API, и в админке |
| Файлы | MinIO (S3-совместимо) | тот же self-hosted инстанс в деве и в проде (см. ниже про бэкапы) |
| Инфраструктура | `cms/docker-compose.yml`, `cms/nginx/` | Docker + nginx как реверс-прокси/SSL |

**Что уже реализовано и переиспользуется как есть — трогать не нужно:**

- JWT-авторизация (access-токен + httpOnly refresh-cookie), роли с иерархией доступа — `cms/packages/api/src/middleware/auth.ts`, `cms/packages/api/src/modules/auth/*`.
- helmet, CORS с allowlist через `CORS_ORIGINS`, rate-limiting (общий + отдельно жёсткий на `/auth/login`), логирование (winston + morgan) — `cms/packages/api/src/index.ts`.
- Чёткое разделение публичных роутов (`/api/v1/*`) и CMS-роутов, требующих авторизации (`/cms/api/v1/*`).
- **hCaptcha уже встроен** в схемы публичных форм (`SupplierFormInputSchema`, `ContactFormInputSchema` в `cms/packages/shared/src/index.ts`) — это закрывает требование ТЗ про reCAPTCHA на формах, менять механизм не нужно, только завести ключи hCaptcha под домен НПК.
- Excel-экспорт (`xlsx` уже в зависимостях `packages/api`) — нужен для «Заявок» (п. 6.4 ТЗ).
- Обработка изображений (`sharp`), email через `nodemailer`/SMTP (`cms/packages/api/src/lib/mailer.ts`).
- Медиабиблиотека с папками (`Media`, `GalleryFolder`, `Gallery`) — используем как есть для фото новостей, PDF, резюме и т.д.
- `Page` / `PageBlock` / `PageTranslation` — готовый паттерн для редактируемых текстовых блоков страниц (п. 6.3 ТЗ) — используем как есть.
- `Document` — готова под PDF (Устав, депутатские запросы, пресс-кит), только расширить enum типов.
- `Setting` (key/value) — готова под счётчики главной, соцсети, `notify_email`, `tg_delay_minutes`.

**Что предстоит поменять/добавить под НПК:**

1. **Бренд.** Постепенно заменить упоминания «DAR Rail» на «НПК»/нейтральные названия в README, `.env.example`, `mailer.ts` (поле `from`), названиях контейнеров в `docker-compose.yml` — не критично для функциональности, делать по ходу дела, не отдельной задачей.
2. **Prisma-схема (`cms/packages/api/prisma/schema.prisma`).** Убрать модели, специфичные для DAR Rail и не нужные НПК: `Service`/`ServiceTranslation` (заменяется на `MediaProject`), `Partner`, `Client`, `PurchaseItem`/`PurchasePlan`, `SupplierForm`, `ContactFormSubmission` (заменяется на `Appeal`), `Vacancy`/`VacancyTranslation`/`ResumeApplication`, `SurveySubmission`. Переименовать/расширить переиспользуемые: `Office` → `Branch` (+ `chairman`, `lng`/`lat`), `TeamMember`/`TeamMemberTranslation` — добавить enum `group` (`LEADERSHIP` | `MEDIA_TEAM`), чтобы одна модель обслуживала и «Руководство», и медиакоманду «Народного медиа». Полная новая схема — Часть 2.
3. **Роли (актуализировано по плану правок №2, Этап 6).** Enum `Role`: `ADMIN`, `CHIEF_EDITOR`, `SECTION_EDITOR`, `RECEPTION_MANAGER`, `DEPUTY`. `BRANCH_EDITOR` удалён, существующие пользователи переведены в `SECTION_EDITOR`; прежняя роль `FACTION` переименована в `DEPUTY`. Поле `section` используется для редактора раздела, `branchId` оставлено в схеме только для совместимости старых данных и при миграции очищено.
4. **Интеграции.** SMS (Mobizon), автопостинг в Telegram, чат-бот на Claude API, видеоприём (Daily.co) реализуются как обычные Express-роуты в новых модулях `cms/packages/api/src/modules/*`. Для отложенных задач (запланированная публикация новости, автопостинг с задержкой, напоминания о видеоприёме за час) — добавляем `node-cron` (аналог pg_cron из Supabase-варианта).
5. **2FA.** В текущем auth-модуле его нет — добавляется поверх существующего JWT-flow в Этапе 8 (TOTP через `otplib` или аналог), обязателен для роли `ADMIN`.
6. **Секреты** — как и раньше: только в `cms/.env` (уже в `.gitignore`), никогда во фронтенде и никогда в `cms/packages/cms` (админка — это тоже клиентский код, собирается в статику).

**Итоговая схема:**

```
Сайт (React SPA, app/, готов) ──────┐
                                     ├──> cms/packages/api (Express + Prisma + PostgreSQL)
Админка (cms/packages/cms, React) ──┘         │
                                              ├──> MinIO (медиа, self-hosted, дев и прод)
                                              ├──> Mobizon API (SMS)
                                              ├──> Telegram Bot API (автопостинг)
                                              ├──> Claude API (чат-бот)
                                              ├──> Daily.co (видеоприём, WebRTC)
                                              └──> SMTP (email-уведомления, nodemailer уже настроен)
```

**Расхождение с ТЗ, которое снимается этим решением:** в Supabase-варианте был пункт «Supabase как формальный аналог Node.js» — теперь backend буквально Node.js/Express/PostgreSQL, никаких оговорок перед заказчиком не нужно. Остаётся открытым только вопрос SPA vs Next.js SSR для SEO — как и раньше, не блокирует Блок 2, отдельным этапом (см. Этап 9).

**Хостинг и бэкапы (важно из-за self-hosted MinIO):** файлы хранятся на своём MinIO, а не в managed-сервисе вроде S3/R2 — значит резервное копирование volume `minio_data` и `postgres_data` (Docker volumes) — ответственность разработчика/DevOps: ежедневный `pg_dump` + бэкап дисков VPS. Это и есть «ежедневные бэкапы» из п. 8 ТЗ — настраивается в Этапе 9, не забыть.

---

## Часть 2. Схема базы данных (Prisma, `cms/packages/api/prisma/schema.prisma`)

Модели делятся на три группы: **есть, используем как есть**, **есть, адаптируем**, **новые**. Хардкод из `app/src/lib/data.ts` и со страниц мигрирует в новые/адаптированные модели.

### Пользователи и роли

| Модель | Статус | Изменения |
|---|---|---|
| `User` | адаптирован | `Role` enum → `ADMIN` \| `CHIEF_EDITOR` \| `SECTION_EDITOR` \| `RECEPTION_MANAGER` \| `DEPUTY`. `branchId` сохранён для совместимости, `section` — для `SECTION_EDITOR` |
| `RefreshToken` | без изменений | — |

### CRM-таблицы (приоритет 1 — лиды теряются каждый день)

| Модель | Статус | Поля |
|---|---|---|
| `JoinRequest` | новая | id, role (member/volunteer/observer), fullName, birthDate, gender, phone, email, city, branchId?, status (NEW/PROCESSING/ACCEPTED/REJECTED), phoneVerified, merchAddress, createdAt |
| `Appeal` | новая | id, appealNumber (уникальный, формат `NPK-2026-00001`), fullName, phone, email, topicId, message, fileUrl, status, internalNotes, createdAt |
| `AppealTopic` | новая | id, nameRu, nameKz — справочник, 7 тем из текущей формы |
| `SmsCode` | новая | id, phone, codeHash, expiresAt, attempts — общая для верификации при вступлении (Этап 5) и при записи на видеоприём (Этап 7) |
| `VideoAppointment` | новая (Этап 7) | id, deputyId, citizenName, citizenPhone, slotStart, slotEnd, status, dailyRoomUrl, smsConfirmed |
| `DeputySchedule` | новая (Этап 7) | id, deputyId, weekday, timeFrom, timeTo, slotMinutes |
| `ShopSubscriber` | новая | id, email, createdAt |

### CMS-таблицы (приоритет 2)

| Модель | Статус | Детали |
|---|---|---|
| `News` / `NewsTranslation` | адаптируем | Уже есть почти в нужном виде. Сузить `Lang` до `ru` \| `kz`. Добавить на `News`: `tgPosted Boolean`, `tgSkip Boolean`, `format` (Новости/Релизы партии/Статьи/Аналитика/Интервью — как в фильтрах `NewsPage`), теги (`tags String[]`) |
| `Branch` | адаптируем (было `Office`) | cityRu/cityKz, addressRu/addressKz, phone, email, + добавить `chairman`, `lng`, `lat` — свести два справочника регионов из `data.ts` и `BranchMapSection` в один |
| `Candidate` / `CandidateTranslation` | новая, по паттерну `Service`/`ServiceTranslation` | name, region, district, photoUrl + перевод `promise` (RU/KZ) |
| `TeamMember` / `TeamMemberTranslation` | адаптируем (уже есть) | Добавить enum `group`: `LEADERSHIP` \| `MEDIA_TEAM` — одна модель закрывает и «Руководство» (`/rukovodstvo`), и медиакоманду `/narodnoe-media` |
| `HistoryEvent` / `HistoryEventTranslation` | новая | year, imageUrl + перевод title/text |
| `ProgramBlock` / `ProgramBlockTranslation` | новая | n, keyword, imageUrl + перевод title, lead1, lead2, points (json) |
| `MediaProject` / `MediaProjectTranslation` | новая, заменяет `Service`/`ServiceTranslation` | tag, url, imageUrl + перевод title, description — карточки `/media` |
| `MediaPublication` | новая | date, sourceType, mediaName, title, excerpt, imageUrl, url — «СМИ о нас» |
| `Testimonial` | новая | quote, author |
| `Document` | адаптируем (уже есть) | Расширить `DocumentType`: `ustav`, `deputy_request`, `press_kit`, `other` |
| `Page` / `PageBlock` / `PageTranslation` | без изменений | Уже подходит для О партии, Фракция, Контакты, футер |
| `MenuItem` | новая | labelRu, labelKz, href, parentId, sortOrder |
| `Setting` | без изменений | key/value — счётчики главной, соцсети, `notify_email`, `tg_delay_minutes` |
| `Faq` | новая (Этап 6) | question, answer, lang — база знаний чат-бота |

### Модели DAR Rail, которые удаляются (не нужны НПК)

`Service`/`ServiceTranslation` (логика переносится в `MediaProject`), `Partner`, `Client`, `PurchaseItem`/`PurchasePlan`, `SupplierForm`, `ContactFormSubmission` (заменяется `Appeal`), `Vacancy`/`VacancyTranslation`/`ResumeApplication`, `SurveySubmission`.

`Media`/`GalleryFolder`/`Gallery` — **остаются без изменений**, они общая инфраструктура медиабиблиотеки, не специфичны для DAR Rail.

Доступы по ролям реализуются вручную в контроллерах/сервисах (см. Часть 1, п. 3) — не через Postgres RLS, как было бы в Supabase-варианте, а через middleware проверки `req.user.role` / `req.user.branchId`.

---

## Часть 3. Рабочий процесс с инструментами (как экономить лимиты)

Ты работаешь тремя инструментами. Распределение ролей:

| Инструмент | Для чего | Почему |
|---|---|---|
| **Antigravity** (Gemini) | Планирование этапов, генерация черновиков больших файлов, рутинные правки, вопросы «как это работает» | Щедрые бесплатные лимиты — сжигаем их на черновую работу |
| **Claude Code** | Реализация этапов по плану, отладка, всё что касается логики, безопасности и интеграций | Лучше держит контекст проекта и меньше ломает существующий код. Токены дорогие — тратим точечно |
| **VS Code** | Смотреть код глазами, запускать `npm run dev`, коммитить в Git | Ничего не генерирует — бесплатно |

**Правила экономии токенов Claude Code (критично для тебя):**

1. **`CLAUDE.md` в корне проекта** уже создан. Claude Code читает его автоматически в каждой сессии — не придётся объяснять проект заново.
2. **Один этап = одна сессия.** Закончил этап → закоммитил в Git → `/clear` → новая сессия. Длинный контекст жрёт токены квадратично.
3. **`/compact` в середине длинной сессии**, если Claude начал «забывать» начало.
4. **План — в файлах, не в чате.** Этот документ — `docs/PLAN.md`. В сессии пиши: «Выполни Этап 4 из docs/PLAN.md» — вместо копипасты простыни.
5. **Не проси Claude Code читать весь проект.** Указывай конкретные файлы: «модель в `cms/packages/api/prisma/schema.prisma`», «форма в `app/src/pages/JoinPage.tsx`».
6. **Черновики UI-страниц админки генерируй в Antigravity**, потом Claude Code подключает их к данным. Вёрстка — самая токеноёмкая часть.
7. **Git-коммит после каждого работающего шага.** Сломалось — `git checkout .` вместо токенов на починку.

---

## Часть 4. Пошаговые этапы

Каждый этап: цель → действия руками → промпт для Claude Code → как проверить. Промпты копируй как есть.

---

### Этап 0. Подготовка окружения — ВЫПОЛНЕН

- ✅ `CLAUDE.md` создан в корне.
- ✅ `docs/PLAN.md` — этот файл.
- ✅ Git-репозиторий инициализирован в корне (`app/` + `cms/` + `content/` одним репо).
- ✅ Корневой `.gitignore` — `.env` везде исключён.
- ⬜ Осталось руками: убедиться, что `cms/.env` заполнен реальными значениями (`DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `MINIO_*`, `HCAPTCHA_SECRET` и т.д. — см. таблицу переменных в `cms/README.md`); `cms/.env.example` — актуализировать под НПК по мере добавления новых переменных (Mobizon, Telegram, Claude, Daily.co — появятся в Этапах 4–7).

---

### Этап 1. Схема БД под НПК + подключение форм — лиды перестают теряться (1–2 дня)

Это самое важное: прямо сейчас каждая заявка на вступление и каждое обращение испаряются.

**Промпт 1.1 — миграция Prisma-схемы:**

```
Прочитай docs/PLAN.md, Часть 1 (пункт «Prisma-схема») и Часть 2 целиком.
Отредактируй cms/packages/api/prisma/schema.prisma:
1. Удали модели, не нужные НПК: Service, ServiceTranslation, Partner, Client,
   PurchaseItem, PurchasePlan, SupplierForm, ContactFormSubmission, Vacancy,
   VacancyTranslation, ResumeApplication, SurveySubmission (и связанные enum'ы).
2. Переименуй Office → Branch, добавь поля chairman, lng, lat.
3. В TeamMember добавь enum group (LEADERSHIP | MEDIA_TEAM).
4. В Document расширь DocumentType: добавь ustav, deputy_request, press_kit.
5. В News/NewsTranslation: сузь Lang до ru|kz, добавь News.tgPosted (Boolean),
   News.tgSkip (Boolean), News.tags (String[]), News.format (enum: news,
   party_release, article, analytics, interview).
6. Добавь новые модели из «CRM-таблицы» (Часть 2): JoinRequest, Appeal,
   AppealTopic, SmsCode, ShopSubscriber — с учётом связи Appeal.topicId →
   AppealTopic.id.
7. Добавь новые модели из «CMS-таблицы»: Candidate/CandidateTranslation,
   HistoryEvent/HistoryEventTranslation, ProgramBlock/ProgramBlockTranslation,
   MediaProject/MediaProjectTranslation, MediaPublication, Testimonial,
   MenuItem, Faq.
8. Обнови enum Role: ADMIN, CHIEF_EDITOR, SECTION_EDITOR,
   RECEPTION_MANAGER, DEPUTY. У модели User добавь section (String?).
Синхронизируй cms/packages/shared/src/index.ts — обнови/добавь Zod-схемы под
новые и изменённые модели (по образцу существующих ServiceSchema,
OfficeSchema и т.д.), убери схемы под удалённые модели.
Сгенерируй миграцию: npx prisma migrate dev --name npk_domain_model
(выполни сам через Bash, БД для дева — из cms/docker-compose.yml, подними
postgres контейнер перед этим). Покажи мне итоговый список изменённых таблиц.
```

**Промпт 1.2 — Express-роуты для форм + seed справочника тем:**

```
Прочитай cms/packages/api/src/index.ts и по одному существующему модулю
(например cms/packages/api/src/modules/contacts/contact-forms.controller.ts)
как образец структуры (controller + service, zod-валидация, hCaptcha-токен).
Создай по этому же паттерну новые публичные модули в
cms/packages/api/src/modules/:
1. join-requests/ — POST /api/v1/join-requests (создаёт JoinRequest,
   phoneVerified=false; реальная верификация — Этап 5, пока просто
   принимаем и сохраняем).
2. appeals/ — POST /api/v1/appeals (создаёт Appeal, генерирует appealNumber
   в формате NPK-2026-00001 — используй счётчик по году), возвращает номер
   в ответе. GET /api/v1/appeal-topics — отдаёт список тем для дропдауна.
3. shop-subscribers/ — POST /api/v1/shop-subscribers.
Все три — с hCaptcha-токеном по образцу ContactFormInputSchema, с валидацией
телефона под формат Казахстана +7 7XX XXX XX XX.
Добавь seed (cms/packages/api/prisma/seed.ts) для AppealTopic: 7 тем на
русском и казахском (Общий вопрос, Социальная помощь, ЖКХ и инфраструктура,
Образование, Медицина, Труд и занятость, Другое).
```

**Промпт 1.3 — фронтенд отправляет формы на реальный API:**

```
Создай app/src/lib/api.ts с базовым клиентом (fetch, базовый URL из
VITE_API_URL в .env). Подключи к реальной отправке все 5 форм:
1. app/src/pages/JoinPage.tsx — визард /vstupit → POST /api/v1/join-requests
2. JoinSection на главной → тот же эндпоинт (role='member')
3. app/src/pages/ReceptionPage.tsx → POST /api/v1/appeals
4. ReceptionSection на главной → тот же эндпоинт
5. форма email в ShopPage → POST /api/v1/shop-subscribers
Требования: не менять внешний вид форм; добавить состояния «отправка» и
«ошибка» (сейчас есть только success); при успехе обращения показывать
appealNumber из ответа API; валидация телефона под +7 7XX XXX XX XX.
```

**Проверка:** отправь тестовую заявку с сайта → `cd cms/packages/api && npx prisma studio` → таблица `JoinRequest` — запись есть. То же для `Appeal` (с номером) и `ShopSubscriber`.

---

### Этап 2. Админка: каркас под роли НПК + разделы «Заявки» и «Обращения» (2–3 дня)

Реализует пункты 6.1, 6.4 и 6.5 ТЗ, на базе уже существующей `cms/packages/cms`.

**Промпт 2.1 — адаптация каркаса админки и ролей:**

```
Прочитай текущую структуру cms/packages/cms/src (App.tsx, components/Layout.tsx,
pages/Login.tsx, store/authStore.ts). Адаптируй под роли НПК из
docs/PLAN.md (ADMIN, CHIEF_EDITOR, SECTION_EDITOR, RECEPTION_MANAGER,
DEPUTY): в сайдбаре (Layout.tsx) показывай только разделы,
доступные роли текущего пользователя (роль уже приходит в /api/v1/auth/me).
Разделы: Дашборд, Заявки, Обращения, Новости, Контент, Пользователи,
Настройки — видимость по роли:
- ADMIN: всё
- CHIEF_EDITOR: Новости, Контент
- SECTION_EDITOR: Новости и Контент (в будущем — фильтр по user.section)
- RECEPTION_MANAGER: только Обращения
- DEPUTY: только контент фракции
Не трогай сам механизм логина/JWT (cms/packages/cms/src/store/authStore.ts,
cms/packages/api/src/modules/auth/*) — он уже работает, только правь
видимость разделов. Замени старые пункты меню DAR Rail (Партнёры, Клиенты,
Закупки, Вакансии, Опросы) на актуальные для НПК.
```

**Промпт 2.2 — раздел «Заявки» (п. 6.4 ТЗ):**

```
Возьми существующий cms/packages/cms/src/pages/procurement/SupplierForms.tsx
как образец списка с фильтрами и статусами. Сделай по аналогии раздел
/zayavki (JoinRequest):
- Таблица: дата, ФИО, роль, телефон, город, статус. Фильтры по статусу,
  роли, дате. Поиск по ФИО и телефону.
- Клик по строке — карточка заявки со всеми полями.
- Смена статуса: NEW → PROCESSING → ACCEPTED → REJECTED (цветные бейджи).
- Кнопка «Экспорт в Excel» — используй уже установленный xlsx в
  cms/packages/api, сделай эндпоинт GET /cms/api/v1/join-requests/export.
- Счётчик новых заявок (status=NEW) бейджем в сайдбаре — используй паттерн
  из cms/packages/cms/src/hooks (создай useJoinRequests.ts по образцу
  useSupplierForms.ts).
```

**Промпт 2.3 — раздел «Обращения» (п. 6.5 ТЗ):**

```
Сделай /obrashcheniya по аналогии с Заявками, из модели Appeal:
- Таблица: appealNumber, дата, ФИО, тема, статус.
- Карточка обращения: все поля, прикреплённый файл (ссылка на MinIO),
  поле «Внутренние заметки» (internalNotes, видно только сотрудникам),
  смена статуса.
- Доступ у ролей ADMIN и RECEPTION_MANAGER — проверь в
  cms/packages/api/src/middleware/auth.ts (requireRole).
```

**Промпт 2.4 — email-уведомления (используем существующий mailer):**

```
cms/packages/api/src/lib/mailer.ts уже настроен на nodemailer/SMTP.
Подключи вызовы sendMail():
1. При создании JoinRequest или Appeal → письмо на email из Setting
   (ключ notify_email).
2. При смене статуса Appeal → письмо заявителю на его email (если указан):
   «Ваше обращение NPK-2026-XXXXX: статус изменён на ...».
Не создавай новую инфраструктуру для писем — используй sendMail() как есть.
```

**Проверка:** отправь заявку с сайта → в админке появилась с бейджем «Новая» → смени статус → экспортни Excel → на email пришло уведомление (нужен настроенный SMTP в `cms/.env`).

---

### Этап 3. CMS: новости + миграция хардкода (3–4 дня)

Реализует пункты 6.2 и 6.3 ТЗ. Самый объёмный этап — дели на сессии по промптам.

**Промпт 3.1 — seed: перенос хардкода в БД:**

```
Прочитай app/src/lib/data.ts и данные, разбросанные по страницам (candidates,
regions/BRANCHES из BranchMapSection, newsItems, testimonials, socialStats,
leaders из LeadershipPage, sections из HistoryPage, BLOCKS из ProgramPage,
PROJECTS из MediaPage, ALL_NEWS из NewsPage, ALL_SMI из SmiPage, materials из
PressKitPage, контакты футера). Дополни cms/packages/api/prisma/seed.ts:
перенеси весь этот хардкод в соответствующие модели (Часть 2 docs/PLAN.md).
Регионы и BRANCHES свести в одну таблицу Branch (убрать дублирование).
Выполни: cd cms/packages/api && pnpm db:seed — покажи результат.
```

**Промпт 3.2 — публичные Express-роуты для контента:**

```
По образцу существующих публичных роутов (cms/packages/api/src/modules/team/
team.controller.ts, .../contacts/offices.controller.ts) создай публичные
GET-эндпоинты (/api/v1/...) для: news (с фильтром по категории/формату и
пагинацией), candidates, branches, history-events, program-blocks,
media-projects, media-publications, testimonials, team (с фильтром по
group), documents, menu-items, settings, faq.
```

**Промпт 3.3 — сайт читает из API вместо хардкода:**

```
Переведи страницы сайта на чтение из app/src/lib/api.ts вместо
app/src/lib/data.ts. По одной странице за раз, начни с новостей: NewsPage,
NewsSection главной, NewsArticlePage (по slug), SearchPage. Затем:
CandidatesPage, LeadershipPage, BranchesPage + BranchMapSection + дропдаун
филиалов в хедере, HistoryPage, ProgramPage, SmiPage, PressKitPage,
MediaPage, ShopPage, контакты футера, ContactsPage.
Требования: дизайн не трогать; скелетон-загрузка; если API недоступен —
показывать текущие хардкод-данные как фолбэк, а не белый экран; фильтры и
пагинация NewsPage — через query-параметры к API.
Работай по одной странице за раз, останавливайся после каждой для проверки.
```

**Промпт 3.4 — редактор новостей (п. 6.2 ТЗ):**

```
Возьми cms/packages/cms/src/pages/news/NewsEditor.tsx и NewsList.tsx как
основу (они уже почти готовы под мультиязычные новости) и адаптируй:
- Список: статус (черновик/опубликовано/запланировано), дата, заголовок,
  категория, формат, отметка «в Telegram» (tgPosted). Фильтры и поиск.
- Форма: заголовок и лид на RU/KZ (вкладки), тело — уже используемый
  RichTextEditor.tsx (проверь, TipTap или аналог), обложка — загрузка через
  существующий MediaLibrary/MediaPicker, категория, теги, format.
- Кнопки: «Сохранить черновик», «Опубликовать», «Запланировать» (дата и
  время — используй node-cron джобу, которая раз в минуту проверяет
  scheduledAt <= now() и переводит SCHEDULED → PUBLISHED).
- Чекбокс «Не публиковать в Telegram» → News.tgSkip.
- slug — транслитерация из заголовка (проверь, есть ли уже утилита в
  cms/packages/api/src/modules/news/news.service.ts).
```

**Промпт 3.5 — редактор контента страниц (п. 6.3 ТЗ):**

```
Сделай в cms/packages/cms/src разделы CRUD (по образцу существующих
pages/team/TeamPage.tsx, pages/offices/OfficesPage.tsx): Кандидаты,
Руководство/Медиакоманда (TeamMember с фильтром по group), Филиалы (Branch),
История партии, Программные блоки, Медиапроекты, Пресс-кит и документы
(Document), Отзывы, СМИ о нас.
Плюс: /stranicy — редактирование PageBlock/PageTranslation (уже есть
PageEditor.tsx — адаптировать под блоки НПК: О партии, Фракция, Контакты,
футер) через RichTextEditor; /menu — MenuItem с drag-and-drop сортировкой;
/nastroyki — Setting (счётчики главной, соцсети, notify_email,
tg_delay_minutes).
Доступ по ролям: филиалы редактируют `ADMIN`, `CHIEF_EDITOR` и
`SECTION_EDITOR`; отдельной роли редактора филиала больше нет.
Делай по 2–3 сущности за раз, я проверяю между шагами.
```

**Промпт 3.6 — пользователи CMS:**

```
Адаптируй cms/packages/cms/src/pages/UsersPage.tsx под роли НПК: список
пользователей, создание нового (email, имя, роль, для SECTION_EDITOR —
поле section), деактивация
(User.status = BLOCKED). Доступ — только ADMIN.
```

**Проверка:** создай новость в админке → появилась на сайте в /novosti и в поиске. Черновик — не появился. Запланируй на +5 минут — появилась сама (node-cron сработал). Проверь управление пользователями и видимость страниц из admin-аккаунта; для остальных ролей переключатели видимости недоступны.

---

### Этап 4. Автопостинг в Telegram (0,5 дня) — п. 7.2 ТЗ

**Руками:** в Telegram открой @BotFather → /newbot → получи токен. Добавь бота администратором в канал @halykparty (на тесте — в свой тестовый канал). Добавь `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHANNEL_ID` в `cms/.env`.

**Промпт 4.1:**

```
Создай модуль cms/packages/api/src/modules/telegram/ с сервисом, который
отправляет пост в Telegram-канал через Bot API (sendPhoto): фото обложки
новости, жирный заголовок, лид до 200 символов, гиперссылка
«Читать полностью →» на страницу новости на сайте.
Вызывай эту функцию из news.service.ts сразу после смены status → PUBLISHED
(если News.tgSkip = false), с задержкой из Setting (ключ tg_delay_minutes,
0–15 минут) — реализуй через node-cron (джоба проверяет новости со статусом
PUBLISHED, tgPosted=false, publishedAt + delay <= now()).
После отправки — News.tgPosted = true, чтобы не задублировать.
Токен и chat_id — только через process.env, не хардкодить. Объясни, как
узнать chat_id канала.
```

**Проверка:** опубликуй новость → пост в тестовом канале с фото и ссылкой. Опубликуй с `tgSkip=true` — поста нет.

---

### Этап 5. SMS-верификация формы вступления (1–2 дня) — п. 5.8 ТЗ

**Руками:** дождись ответа заказчика про SMS-шлюз. Если шлюза нет — регистрируй mobizon.kz, пополни на тест ~1000 ₸. Добавь `MOBIZON_API_KEY` в `cms/.env`. **Пока провайдера нет, этап можно построить целиком на «тестовом режиме» (код в логах) и подключить шлюз позже.**

**Промпт 5.1:**

```
Создай модуль cms/packages/api/src/modules/sms/ с двумя эндпоинтами:
- POST /api/v1/sms/send { phone } — генерирует 4-значный код, сохраняет хэш
  (bcrypt, как уже используется для паролей в auth.service.ts) в SmsCode
  (expiresAt = +5 минут), отправляет через Mobizon API. Ограничение: не
  больше 3 кодов на номер в час (проверка по SmsCode.createdAt). Если
  MOBIZON_API_KEY не задан в .env — код не отправляется, а пишется в лог
  (logger.info), чтобы тестировать без реальных SMS.
- POST /api/v1/sms/verify { phone, code } — сверяет с хэшем, ставит
  phoneVerified=true у соответствующего JoinRequest (или VideoAppointment
  в Этапе 7).
Переделай визард /vstupit (app/src/pages/JoinPage.tsx) под 4 шага из ТЗ:
Шаг 1: ФИО, дата рождения, пол.
Шаг 2: телефон, email, город/область (список из GET /api/v1/branches).
Шаг 3: 4 поля SMS-кода с автофокусом, повторная отправка через 60 секунд.
Шаг 4: экран успеха + опциональный блок «Хотите получить значок?» с полем
       адреса (JoinRequest.merchAddress).
JoinRequest создаётся в БД только после успешной верификации кода.
```

**Проверка:** пройди визард на своём номере (или проверь код в логах API, если Mobizon не подключён) → неверный код отклонён → верный код создал заявку с `phoneVerified=true` в админке.

---

### Этап 6. AI чат-бот (1–2 дня) — п. 7.1 ТЗ

**Руками:** создай API-ключ на console.anthropic.com, добавь `ANTHROPIC_API_KEY` в `cms/.env`. Запроси у заказчика FAQ 20–50 вопросов — не жди, бот работает и без FAQ, на контенте сайта.

**Промпт 6.1:**

```
Создай модуль cms/packages/api/src/modules/chatbot/ с эндпоинтом
POST /api/v1/chatbot: принимает историю диалога, вызывает Claude API
(модель claude-haiku-4-5, ключ из process.env.ANTHROPIC_API_KEY через
официальный @anthropic-ai/sdk). System prompt собирается из БД: программные
блоки (ProgramBlock), контакты всех филиалов (Branch), руководство
(TeamMember, group=LEADERSHIP), темы приёмной (AppealTopic), Faq + жёсткие
правила:
- отвечать только по информации сайта партии;
- на языке обращения (русский/казахский);
- не генерировать политических высказываний и оценок, не обещать ничего
  от лица партии;
- вне темы: «Этот вопрос вне моей компетенции. Могу помочь найти
  информацию о партии»;
- направлять на страницы: вступление → /vstupit, обращение → /priemnaya,
  руководство → /rukovodstvo, филиалы → /filialy.
Кэшируй system prompt через prompt caching Anthropic API. Rate limit по IP
(express-rate-limit уже есть в проекте — переиспользуй паттерн из index.ts)
— 20 сообщений на сессию.
Виджет на сайте app/: кнопка в правом нижнем углу во всех страницах
(app/src/components/PageLayout.tsx), окно чата в стиле сайта, история в
sessionStorage, индикатор набора, ссылки в ответах кликабельны.
Сделай в cms/packages/cms раздел /faq — CRUD для модели Faq (только ADMIN
и CHIEF_EDITOR).
```

**Проверка (сценарии из ТЗ):** «Как вступить в партию?» → объясняет + ссылка /vstupit. «Где ваш офис в Таразе?» → контакты Жамбылского филиала. «Что партия думает о пенсиях?» → цитирует программу. Вопрос про погоду → отказ по скрипту. Вопрос на казахском → ответ на казахском.

---

### Этап 7. Видеоприём (3–4 дня) — п. 5.9 ТЗ, самая сложная часть

**Руками:** зарегистрируйся на daily.co (Free: 10 000 минут/мес), возьми API-ключ, добавь `DAILY_API_KEY` в `cms/.env`. Дождись ответа заказчика «кто ведёт приёмы».

**Промпт 7.1 — модель и запись на приём:**

```
Добавь роль DEPUTY в enum Role (cms/packages/api/prisma/schema.prisma) и
модель DeputyProfile (userId, photoUrl, position) — для карточек выбора на
сайте. Убедись, что модели VideoAppointment и DeputySchedule из Часть 2
уже добавлены в Этапе 1 (если нет — добавь сейчас с миграцией).
На странице app/src/pages/ReceptionPage.tsx сделай вторую вкладку
«Видеоприём» (первая — текущая форма письменного обращения):
Шаг 1: выбор депутата (карточки из GET /api/v1/deputies).
Шаг 2: календарь свободных слотов на 2 недели вперёд — эндпоинт
       GET /api/v1/deputies/:id/slots (генерируется из DeputySchedule
       минус занятые VideoAppointment).
Шаг 3: ФИО + телефон + SMS-подтверждение (переиспользуй /api/v1/sms/send
       и /api/v1/sms/verify из Этапа 5).
Шаг 4: экран успеха с датой, временем и ссылкой на звонок.
При подтверждении: POST /api/v1/video-appointments создаёт комнату через
Daily API (https://api.daily.co/v1/rooms, ключ в cms/.env), комната с
exp = конец слота + 15 минут, ссылка сохраняется в
VideoAppointment.dailyRoomUrl.
```

**Промпт 7.2 — сам звонок и кабинет депутата:**

```
1. Страница app/src/pages/VideoCallPage.tsx на роуте /videopriem/:id —
   встроенный звонок через @daily-co/daily-js (Daily Prebuilt iframe на
   весь экран). Доступ открывается за 10 минут до слота (проверка на
   бэкенде по slotStart).
2. В cms/packages/cms сделай личный кабинет /priem (роль DEPUTY):
   «Моё расписание» — задание рабочих окон по дням недели и длительности
   слота (30/45/60 мин, DeputySchedule), блокировка дат; «Мои записи» —
   список VideoAppointment с кнопкой «Присоединиться» и статусами.
3. node-cron джоба каждые 10 минут находит VideoAppointment, до которых
   осталось 55–65 минут, и шлёт гражданину SMS (Mobizon) и email
   (mailer.ts) со ссылкой.
```

**Проверка:** задай расписание депутата → запишись как гражданин с SMS-подтверждением → открой звонок в двух браузерах (депутат в кабинете, гражданин по ссылке) → видео и звук работают → напоминание пришло.

---

### Этап 8. Безопасность и соответствие ТЗ (1 день) — п. 8.4

**Промпт 8.1:**

```
Проведи аудит по требованиям безопасности из ТЗ и исправь:
1. hCaptcha уже подключён к формам (JoinRequest/Appeal/ShopSubscriber —
   проверь, что добавлен по тому же паттерну, что SupplierFormInputSchema
   в Этапе 1). Заведи ключи hCaptcha под домен НПК в .env.
2. 2FA (TOTP, библиотека otplib) — добавь поверх существующего JWT-flow в
   cms/packages/api/src/modules/auth/: обязательна для роли ADMIN,
   опциональна для остальных ролей CMS. Экран настройки в
   cms/packages/cms (QR-код + ввод кода подтверждения).
3. Пройдись по всем контроллерам cms/packages/api/src/modules/*: убедись,
   что публичные роуты (/api/v1/*) не отдают приватные поля (internalNotes
   у Appeal, passwordHash у User и т.д. — используй select в Prisma-запросах,
   не полагайся на фронтенд). Выпиши таблицей: модель → кто читает публично
   → кто пишет/читает полностью.
4. Валидация и санитизация всех входных данных (zod-схемы в
   cms/packages/shared уже частично это делают — проверь XSS в текстах
   обращений/новостей, ограничение размера файлов 10 МБ, только
   PDF/JPG/PNG — multer уже настроен, проверь fileFilter).
5. Rate limit — express-rate-limit уже используется в index.ts, убедись,
   что все новые публичные роуты (join-requests, appeals, sms, chatbot)
   тоже под ним.
6. Страница «Политика конфиденциальности» (закон РК № 94-V: цель сбора,
   согласие, право на удаление) — через существующую модель Page/PageBlock;
   подключи чекбоксы согласия к формам JoinPage и ReceptionPage.
7. Автогенерация sitemap.xml — эндпоинт GET /sitemap.xml на API (или
   отдельный статический файл, перегенерируемый node-cron раз в час) со
   всеми опубликованными новостями и статичными страницами.
```

**Руками:** настрой автоматический `pg_dump` по крону на сервере (ежедневно) + бэкап Docker-volume `minio_data` — это и есть «ежедневные бэкапы» из ТЗ (см. предупреждение в Часть 1 про self-hosted MinIO). Прогони формы: SQL-инъекция в поле имени (`' OR 1=1 --`), скрипт в тексте обращения (`<script>alert(1)</script>`) — всё должно сохраняться как безобидный текст (Prisma параметризует запросы сама, но проверь ручные `$queryRaw`, если такие есть).

---

### Этап 9. Деплой и передача (1 день)

**Промпт 9.1:**

```
Подготовь проект к продакшену:
1. Проверь cms/docker-compose.yml — актуализируй сервисы (postgres, minio,
   api, cms, nginx, frontend). Добавь healthcheck и restart policy, если
   где-то не хватает.
2. vite build для app/ и cms/packages/cms — проверь, что CMS собирается
   отдельным бандлом от основного сайта (уже так по структуре — админка
   не примешивается к app/, она отдельный docker-сервис).
3. Чек-лист деплоя на VPS (казахстанский или европейский облачный
   провайдер): Docker Compose поднимается, nginx с SSL-сертификатом
   (Let's Encrypt или свой), домен halykpartiyasy.kz указывает на сервер.
4. Cloudflare перед VPS: proxy DNS-записи (оранжевое облако) — даёт CDN
   и скрывает IP сервера, плюс 301-redirect qhp.kz через Bulk Redirects.
5. robots.txt и мета-теги: закрой /cms (админку) от индексации.
6. Настрой ежедневный cron на сервере: pg_dump + архивирование volume
   minio_data в отдельное хранилище (S3/облако) — см. Часть 1 про бэкапы.
7. Прогони Lighthouse: цель PageSpeed Mobile ≥ 80 — если ниже, оптимизируй
   (ленивые изображения, WebP, префетч шрифтов).
```

**Руками — передача заказчику (требования раздела 11 ТЗ):**

- Перевести VPS-хостинг, домен и все API-ключи (Anthropic, Mobizon, Daily, Telegram, SMTP) на аккаунты/оплату заказчика.
- Создать учётки CMS по списку заказчика.
- Записать видеоинструкцию по CMS — экран + голос, по разделам админки.
- День обучения редактора(ов) и администратора.
- Зафиксировать открытый вопрос SSR/prerender для SEO (Часть 1) — предложить заказчику как доп. соглашение, если критично.

---

## Часть 5. Порядок и сроки

| Этап | Что | Дней | Зависимости от заказчика |
|---|---|---|---|
| 0 | Окружение, CLAUDE.md | 0,5 | — (выполнен) |
| 1 | Prisma-схема + рабочие формы | 1–2 | — |
| 2 | Админка: роли + заявки + обращения + email | 2–3 | email ответственного |
| 3 | CMS: новости + контент + миграция | 3–4 | список пользователей CMS |
| 4 | Автопостинг Telegram | 0,5 | Bot Token / доступ к каналу |
| 5 | SMS-верификация /vstupit | 1–2 | выбор SMS-шлюза |
| 6 | AI чат-бот | 1–2 | FAQ (не блокирует), бюджет API |
| 7 | Видеоприём | 3–4 | список депутатов и график |
| 8 | Безопасность, 2FA, sitemap | 1 | — |
| 9 | Деплой, обучение, передача | 1 | доступы к хостингу/DNS |
| | **Итого** | **14–20 раб. дней** | совпадает с оценкой ТЗ (14–21) |

**Принцип порядка:** этапы 1–3 — ядро, делай строго последовательно. Этапы 4–6 независимы друг от друга — можно переставлять под готовность заказчика. Этап 7 самый рискованный — не оставляй на последние два дня, начни как только придёт ответ про депутатов.

## Часть 6. Ежемесячные расходы заказчика (передать в отчёт)

| Сервис | Стоимость | Зачем |
|---|---|---|
| VPS-хостинг (Docker: Postgres+MinIO+API+CMS+nginx) | ~$20–40/мес в зависимости от провайдера | БД, файлы, backend, deploy |
| Claude API | ~$50–70/мес (~30 000 ₸ из ТЗ) | чат-бот |
| Mobizon | ~15–25 ₸/SMS по факту | верификация + напоминания |
| Daily.co | $0 (до 10 000 мин/мес) | видеоприём |
| SMTP (существующий провайдер почты заказчика или Resend free-tier) | $0 | email-уведомления |
| Cloudflare | $0 | CDN + редиректы |
| hCaptcha | $0 (free tier) | защита форм |

---

## Статус выполнения

| Этап | Статус |
|---|---|
| 0 | Выполнен |
| 1 | Выполнен |
| 2 | Выполнен |
| 3 | Частично: Промпты 3.1, 3.2, 3.4, 3.5 (частично), 3.6 выполнены + доработана старая админка darrail (News/Branches/Users/Pages). Промпт 3.3 (сайт `app/` на API) — сделаны News (NewsPage/NewsSection/NewsArticlePage/SearchPage), CandidatesPage, LeadershipPage, HistoryPage, ProgramPage, MediaPage, SmiPage, PressKitPage, отзывы в ReceptionPage/Section. Осталось: BranchesPage + BranchMapSection + дропдаун филиалов в хедере, ShopPage, ContactsPage + контакты футера, NarodnoeMediaPage (медиакоманда, group=MEDIA_TEAM) |
| 4–9 | Не начаты |

---

*Документ производный от ТЗ v1.0 (июнь 2026) и SITE_ARCHITECTURE.md. Архитектура пересмотрена: вместо Supabase используется адаптация существующего backend/admin проекта из папки `cms/` (Node.js/Express/Prisma/PostgreSQL/MinIO, изначально написан для другого проекта — DAR Rail). Расхождение с ТЗ, требующее фиксации с заказчиком: вопрос SPA vs Next.js SSR для SEO — вынесен в отдельное решение (Этап 9).*
