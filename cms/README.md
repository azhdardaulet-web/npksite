# DAR Rail CMS

Headless CMS для управления контентом сайта [darrail.com](https://darrail.com).

**Стек:** Node.js 20 + Express 5 + Prisma + PostgreSQL 16 | React 19 + Vite + Tailwind | MinIO | Docker + Nginx

---

## Предварительные требования

| Инструмент | Версия |
|---|---|
| Docker Desktop | 24+ |
| Node.js | 20 LTS |
| pnpm | 9+ (`npm i -g pnpm`) |

---

## Быстрый старт (5 команд)

```bash
# 1. Скопируй и заполни переменные окружения
cp .env.example .env
# Отредактируй .env: укажи пароли, JWT-секреты, hCaptcha ключ

# 2. Установи зависимости (нужно только для локальной разработки)
pnpm install

# 3. Подними базу данных и MinIO
docker compose up -d postgres minio

# 4. Примени миграции и засей базу начальными данными
cd packages/api && npx prisma migrate deploy && pnpm db:seed && cd ../..

# 5. Подними все сервисы
docker compose up -d
```

После запуска:
- **Public API:** http://localhost:3001/api/v1/
- **CMS (admin panel):** http://localhost:8080
- **MinIO Console:** http://localhost:9001
- **Health check:** http://localhost:3001/health

---

## Переменные окружения

| Переменная | Обязательна | Описание |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `POSTGRES_DB` | ✅ | Имя базы данных |
| `POSTGRES_USER` | ✅ | Пользователь PostgreSQL |
| `POSTGRES_PASSWORD` | ✅ | Пароль PostgreSQL |
| `JWT_SECRET` | ✅ | 64-символьная hex-строка для access token |
| `JWT_REFRESH_SECRET` | ✅ | 64-символьная hex-строка для refresh token |
| `JWT_EXPIRES_IN` | — | Время жизни access token (default: `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | — | Время жизни refresh token (default: `7d`) |
| `MINIO_ENDPOINT` | ✅ | Хост MinIO (в Docker: `minio`) |
| `MINIO_PORT` | — | Порт MinIO (default: `9000`) |
| `MINIO_ACCESS_KEY` | ✅ | Логин MinIO |
| `MINIO_SECRET_KEY` | ✅ | Пароль MinIO |
| `MINIO_BUCKET` | — | Название бакета (default: `darrail-media`) |
| `MINIO_PUBLIC_URL` | ✅ | Публичный URL для доступа к файлам |
| `HCAPTCHA_SECRET` | ✅ | Секретный ключ hCaptcha (для форм) |
| `PORT` | — | Порт API (default: `3001`) |
| `CORS_ORIGINS` | ✅ | Comma-separated список разрешённых origin |
| `SMTP_HOST` | — | SMTP-сервер для уведомлений |
| `SMTP_PORT` | — | SMTP-порт |
| `SMTP_USER` | — | SMTP-логин |
| `SMTP_PASS` | — | SMTP-пароль |
| `NOTIFICATION_EMAIL` | — | Email для получения заявок поставщиков |
| `VITE_API_URL` | ✅ | URL API для CMS фронтенда |
| `VITE_HCAPTCHA_SITE_KEY` | ✅ | Публичный ключ hCaptcha для форм |

Для генерации JWT-секретов:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Создание первого администратора

Seed-скрипт автоматически создаёт admin-пользователя при первом запуске:

| Поле | Значение |
|---|---|
| Email | `admin@darrail.com` |
| Пароль | `ChangeMe123!` |
| Роль | `ADMIN` |

**Смени пароль сразу после первого входа** через CMS → Профиль → Сменить пароль.

Для ручного запуска seed:
```bash
cd packages/api && pnpm db:seed
```

---

## Роли пользователей

| Роль | Доступ |
|---|---|
| `ADMIN` | Полный доступ ко всему |
| `NEWS_EDITOR` | Создание и редактирование новостей |
| `PROCUREMENT_MANAGER` | Управление закупками и заявками поставщиков |
| `CONTENT_MANAGER` | Редактирование страниц, партнёры, команда |

---

## Структура проекта

```
cms/
├── docker-compose.yml
├── .env.example
├── nginx/
│   ├── Dockerfile
│   └── nginx.conf          # Публичный сайт + CMS (VPN-only)
└── packages/
    ├── api/                # Express 5 + Prisma backend
    │   ├── Dockerfile
    │   ├── prisma/
    │   │   ├── schema.prisma
    │   │   ├── seed.ts
    │   │   └── migrations/
    │   └── src/
    │       ├── modules/    # news, media, procurement, pages, ...
    │       ├── middleware/  # auth, requireRole
    │       └── index.ts
    ├── cms/                # React 19 + Vite admin panel
    │   ├── Dockerfile
    │   ├── nginx-spa.conf  # SPA fallback для nginx
    │   └── src/
    └── shared/             # Zod-схемы, общие типы
```

---

## Деплой

### Требования к серверу

- Ubuntu 22.04 LTS, 2 CPU, 4 GB RAM (минимум)
- Открытые порты: 80, 443
- VPN для доступа к CMS (рекомендуется WireGuard)

### Пошаговый деплой

```bash
# На сервере
git clone <repo> && cd cms

# Заполни продакшн .env
cp .env.example .env && nano .env

# Подними всё
docker compose up -d

# Применить миграции
docker compose exec api npx prisma migrate deploy

# Засеять базу (только первый раз)
docker compose exec api node -e "require('./dist/prisma/seed.js')"
```

### SSL-сертификаты

Положи в `nginx/ssl/`:
- `fullchain.pem`
- `privkey.pem`

Раскомментируй HTTPS-блок в `nginx/nginx.conf` и обнови `server_name`.

### Доступ к CMS через VPN

CMS (`cms.darrail.local`) доступна только с VPN-подсети (`10.0.0.0/8`).
Настрой WireGuard или OpenVPN на сервере, добавь запись `cms.darrail.local` в `/etc/hosts` клиентов.

---

## Разработка

```bash
# Запустить базу локально
docker compose up -d postgres minio

# API (порт 3001)
cd packages/api && pnpm dev

# CMS (порт 5173)
cd packages/cms && pnpm dev

# Prisma Studio
cd packages/api && pnpm db:studio
```

---

## Резервное копирование

```bash
# Ручной дамп базы
docker compose exec postgres pg_dump -U darrail darrail_cms > backup_$(date +%Y%m%d).sql

# Восстановление
docker compose exec -T postgres psql -U darrail darrail_cms < backup_20250501.sql
```

Рекомендуется настроить cron для автоматического pg_dump + загрузки в S3/MinIO.

---

*DAR Rail CMS v1.0 | Май 2025*
