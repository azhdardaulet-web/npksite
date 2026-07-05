# CLAUDE.md — НПК Сайт (npksite)

Контекст для Claude Code при работе с этим репозиторием. Основной план работ ведётся в [docs/PLAN.md](docs/PLAN.md) — начинай с него, если он существует, и обновляй по мере продвижения по задачам.

## Структура репозитория

Монорепозиторий из трёх независимых частей:

| Папка | Что это | Стек |
|---|---|---|
| `app/` | Фронтенд сайта партии (SPA) — основная часть, с которой обычно ведётся работа. Здесь же будет жить админка CMS/CRM (`/admin`) | React 19 + TypeScript + Vite |
| `cms/` | **Устаревший черновик** отдельного backend/CMS (Node.js, pnpm-workspace, Docker/nginx) — более ранняя попытка, заменена решением на Supabase (см. [docs/PLAN.md](docs/PLAN.md), Часть 1). Не развивать, не трогать без явного запроса | Node.js, pnpm-workspace (`packages/api`, `packages/cms`, `packages/shared`), Docker/nginx |
| `content/` | Исходные медиафайлы (шрифты, логотипы, фото, видео) для загрузки в CMS/сайт | статика |

Актуальная CMS/CRM-архитектура (Supabase + `/admin` внутри `app/`, Edge Functions, интеграции с SMS/Telegram/Claude API/Daily.co) описана в [docs/PLAN.md](docs/PLAN.md) — это основной план работ по Блоку 2 ТЗ, следуй ему пошагово (Этапы 0–9).

Верхнеуровневые справочные файлы: `SITE_ARCHITECTURE.md` (подробное описание секций/кнопок/форм каждой страницы для проектирования CMS) и `tech-spec.md` (техспека по компонентам и зависимостям). Читай их перед крупными изменениями — они могут местами устаревать, сверяйся с кодом.

## Стек фронтенда (`app/`)

- **React 19** + **TypeScript**, сборка на **Vite 7**
- Роутинг: `react-router-dom` v7 (`app/src/App.tsx`)
- Стили: **Tailwind CSS** + частично инлайн-стили в компонентах, `class-variance-authority`, `tailwind-merge`
- UI-примитивы: **Radix UI** (`@radix-ui/react-*`), обёртки в `app/src/components/ui`
- Формы: `react-hook-form` + `zod` (резолверы), но часть форм — обычный `<form onSubmit>` без RHF
- Анимации: `gsap` + `@gsap/react`, `framer-motion`, `lenis` (плавный скролл)
- 3D/WebGL: `three` + `three.meshline` (карта на главной)
- Прочее: `embla-carousel-react`, `recharts`, `sonner` (тосты), `date-fns`

## Структура `app/src`

```
app/src/
  App.tsx          — роуты (React Router)
  main.tsx         — точка входа
  pages/           — страницы (по одной на роут)
  sections/        — крупные блоки, переиспользуемые между страницами/секциями главной
  components/       — общие компоненты (хедеры, футер, кнопки), components/ui — Radix-обёртки
  hooks/           — кастомные хуки (useCountUp, useCountdown, useLenis, use-mobile и т.д.)
  lib/             — утилиты и хардкод-данные (см. ниже)
  types/           — общие TS-типы (index.ts)
```

## Где лежат хардкод-данные

Данные пока не подключены к CMS/API и захардкожены в коде:

- **`app/src/lib/data.ts`** — основной централизованный источник: `candidates` (кандидаты), `regions` (филиалы/регионы с председателями, адресами, телефонами), `newsItems` (новости), `testimonials` (отзывы), `socialStats` (соцсети), `regionFilterTags`, `ELECTION_DATE`.
- Часть данных **не централизована** и лежит прямо внутри страниц/секций (например, списки новостей в `NewsPage.tsx`, `MediaPage.tsx`, `NarodnoeMediaPage.tsx`, `SmiPage.tsx`, контакты в `Footer.tsx`, пункты меню в `DesktopHeader.tsx`/`MobileHeader.tsx`). При добавлении новых блоков данных — сверяйся с `SITE_ARCHITECTURE.md`, где перечислены потенциальные CMS-сущности по каждой странице.
- `app/src/lib/hero-map.ts`, `hero-glow.ts` — логика WebGL-анимации карты, не данные контента.

## Страницы (`app/src/pages`, роуты из `App.tsx`)

| Роут | Компонент | Назначение |
|---|---|---|
| `/` | HomePage | Главная |
| `/o-partii`, `/o-partii/:sub` | AboutPage | О партии |
| `/o-partii/istoriya` | HistoryPage | История партии |
| `/programma` | ProgramPage | Программа |
| `/kandidaty` | CandidatesPage | Кандидаты |
| `/media` | MediaPage | Медиа/видео |
| `/priemnaya` | ReceptionPage | Общественная приёмная (форма обращения) |
| `/kontakty` | ContactsPage | Контакты |
| `/vstupit` | JoinPage | Вступить в партию (форма) |
| `/filialy` | BranchesPage | Филиалы/регионы |
| `/novosti` | NewsPage | Новости, список |
| `/novosti/:slug` | NewsArticlePage | Новость, отдельная статья |
| `/rukovodstvo` | LeadershipPage | Руководство |
| `/frakciya` | FactionPage | Фракция |
| `/mediakits` | PressKitPage | Пресс-кит |
| `/search` | SearchPage | Поиск по сайту |
| `/magazin` | ShopPage | Магазин (заглушка «скоро», форма подписки на email) |
| `/smi-o-nas` | SmiPage | СМИ о нас |
| `/narodnoe-media` | NarodnoeMediaPage | Народное медиа |

Примечание: `app/src/pages/Home.tsx` в роутинге не используется (не импортируется в `App.tsx`) — похоже на неактуальный/черновой файл, перед удалением уточни у пользователя.

## Формы на сайте

- **`JoinSection.tsx`** / **`JoinPage.tsx`** (`/vstupit`) — форма вступления в партию.
- **`ReceptionSection.tsx`** / **`ReceptionPage.tsx`** (`/priemnaya`) — форма обращения в общественную приёмную.
- **`ShopPage.tsx`** (`/magazin`) — форма подписки на email-уведомление об открытии магазина (заглушка, `onSubmit` ничего не отправляет).
- Общий form-компонент из shadcn/Radix — `app/src/components/ui/form.tsx` (обёртка над `react-hook-form`), но не все формы выше на неё переведены.

Ни одна форма пока не подключена к реальному backend/API — отправка либо не реализована, либо использует локальный state.

## Секреты и окружение

- В `cms/` уже есть реальный `cms/.env` (конфигурация БД/сервисов) и `cms/.env.example`.
- Во фронтенде (`app/`) `.env`-файлов и обращений к `import.meta.env`/`process.env` пока нет.
- В корне репозитория добавлен `.gitignore`, исключающий `.env`, `.env.local` и подобные файлы (кроме `*.env.example`) — см. правило 2 ниже.

## Правила

1. **Не менять дизайн и вёрстку существующих страниц без явной просьбы.** Правки логики/данных — можно, изменение визуала, разметки, стилей существующих компонентов — только если это прямо запрошено.
2. **Все секреты — только в `.env`.** Не хардкодить ключи, токены, пароли, строки подключения в коде или конфигах. Файл `.env` (и любые реальные `.env.*`, кроме `*.env.example`) должен быть в `.gitignore` — сейчас за это отвечает корневой `.gitignore`.
3. **Комментарии в коде — на русском языке.**
4. **После каждого изменения — одна строка с тем, как проверить результат** (например: команда для запуска, URL/роут для проверки в браузере, либо какой тест/скрипт запустить).
