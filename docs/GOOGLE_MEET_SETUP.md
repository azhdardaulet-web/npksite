# Google Meet приёмная — инструкция для разработчика

Эта задача — часть сайта Народной партии Казахстана (`npksite`): монорепо из
`app/` (React-сайт), `cms/packages/api` (Express + Prisma + PostgreSQL,
бэкенд) и `cms/packages/cms` (React-админка). На сайте есть общественная
приёмная (`/priemnaya`), где гражданин может выбрать «Видеоприём» вместо
письменного обращения — вот для этого режима и нужен Google Meet.

**Хорошая новость:** вся работа вокруг интеграции уже сделана — миграции
БД, эндпоинты бэкенда, экран в CMS-админке, письма гражданину, фоновые
напоминания. Единственное, чего не хватает — это реального вызова Google
Calendar API, который создаёт встречу и возвращает ссылку на Meet. Тебе
нужно реализовать **две функции в одном файле**, остальной код их уже вызывает.

---

## TL;DR — если хочешь сразу к делу

Открой:
```
cms/packages/api/src/lib/googleCalendar.ts
```
Там две функции-заглушки: `createGoogleMeetEvent()` (сейчас бросает
ошибку) и `cancelGoogleMeetEvent()` (сейчас ничего не делает). В
комментариях над каждой — точное описание, что она должна делать, какие
параметры принимает и что возвращает. Реализуй их по образцу из раздела
[«Что писать в коде»](#что-писать-в-creategooglemeetevent) ниже — больше
нигде в проекте ничего менять не нужно.

---

## Как это работает (логика уже собрана)

1. Гражданин на `/priemnaya` выбирает вкладку «Видеоприём» вместо
   «Письменное обращение» и отправляет форму → обращение (модель `Appeal`
   в Prisma) сохраняется с полем `format: 'VIDEO'`.
2. Менеджер приёмной заходит в CMS-админку (`/dashboard` → «Обращения»),
   видит бейдж 🎥 у таких обращений, открывает карточку → блок
   «Видеоприём» → выбирает депутата (справочник `TeamMember` с
   `group: 'FACTION'` — это раздел «Фракция → Депутаты» в админке) и
   удобное время.
3. Фронт CMS отправляет `PUT /cms/api/v1/appeals/:id/meeting` (уже
   реализовано, см. `cms/packages/api/src/modules/appeals/appeals.controller.ts`).
   Бэкенд создаёт/обновляет запись `AppealMeeting` и внутри вызывает
   `createGoogleMeetEvent()`.
4. **Сейчас**, пока функция не реализована, она просто бросает ошибку.
   Это ожидаемо и ничего не ломает: встреча всё равно сохраняется в БД со
   статусом `PENDING`, текст ошибки попадает в поле `lastError`, а
   менеджер в CMS видит жёлтый бейдж «Ожидает подключения Calendar API» и
   кнопку «Повторить попытку» (нажатие на неё просто ещё раз вызывает тот
   же `PUT`-запрос).
5. **Как только ты реализуешь функцию**, она вернёт `{ meetLink,
   calendarEventId }`. Бэкенд сразу проставит статус `SCHEDULED`, отправит
   письмо гражданину со ссылкой (уже реализовано, через `sendMail`), и с
   этого момента фоновый планировщик (`cms/packages/api/src/lib/reminders.ts`,
   уже работает, `node-cron` каждые 5 минут) начнёт следить за встречей и
   пришлёт напоминание за час до неё — на email точно, по SMS пока нет
   (см. раздел про SMS ниже).

Менять `appeals.controller.ts`, `reminders.ts`, код CMS-фронта — **не
нужно**, они уже написаны под контракт `googleCalendar.ts` и ничего не
знают о конкретной реализации внутри него.

---

## Пошагово: получить доступ в Google Cloud Console

1. Зайти на **console.cloud.google.com** под Google-аккаунтом, который
   партия готова использовать как «организатора» встреч (реальный
   аккаунт партии, не личный — именно на его календаре будут появляться
   события и с его подписью уходить приглашения).
2. Создать новый проект (или выбрать существующий, если для сайта уже
   что-то заведено — например, для YouTube-интеграции, которую параллельно
   делает кто-то ещё в этом же проекте).
3. **APIs & Services → Library** → найти «Google Calendar API» → нажать
   **Enable**.
4. **APIs & Services → OAuth consent screen** → тип **External** (если
   аккаунт обычный Gmail, не Google Workspace) или **Internal** (если
   Workspace на домене партии) → заполнить название приложения. Если
   consent screen останется в статусе Testing — добавить себя в список
   тестовых пользователей (Test users), иначе авторизация не пройдёт.
5. **APIs & Services → Credentials → Create Credentials → OAuth client
   ID** → тип **Desktop app** — так проще всего получить refresh token
   локально, без настройки redirect URI под прод-домен.
6. Google выдаст `Client ID` и `Client Secret` — это значения для
   `GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET` в `cms/.env`.
7. Получить `refresh_token` — это делается **один раз**, локальным
   скриптом (не через продакшен). Пакеты `googleapis` и
   `google-auth-library` уже добавлены в зависимости
   (`cms/packages/api/package.json`) — `pnpm install` их подтянет (в
   проекте именно **pnpm**-воркспейсы, обычный `npm install` в
   `cms/packages/api` не сработает — увидишь ошибку про `workspace:*`,
   это нормально, просто используй `pnpm`). Нужен authorization code flow
   с `access_type: 'offline'` и `prompt: 'consent'`, залогиниться тем
   самым аккаунтом партии из шага 1, из ответа сохранить `refresh_token`
   в `GOOGLE_REFRESH_TOKEN`.
8. `GOOGLE_CALENDAR_ID` — проще всего оставить `primary` (основной
   календарь аккаунта). Если хочется отдельный календарь под приёмную —
   создать его в Google Calendar → Settings → Integrate calendar →
   Calendar ID, и использовать этот ID.

Куда вписывать значения — `cms/.env` (реальный, не закоммиченный файл;
структура/плейсхолдеры для примера — в `cms/.env.example`):
```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GOOGLE_CALENDAR_ID=
```

---

## Что писать в `createGoogleMeetEvent()`

Рабочий каркас — можно вставлять как есть и адаптировать:

```ts
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { v4 as uuidv4 } from 'uuid';

const oauth2Client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

export async function createGoogleMeetEvent(input: CreateMeetEventInput): Promise<CreateMeetEventResult> {
  const endTime = new Date(input.startTime.getTime() + input.durationMinutes * 60_000);
  const response = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID ?? 'primary',
    conferenceDataVersion: 1,
    requestBody: {
      summary: input.summary,
      description: input.description,
      start: { dateTime: input.startTime.toISOString(), timeZone: 'Asia/Almaty' },
      end: { dateTime: endTime.toISOString(), timeZone: 'Asia/Almaty' },
      attendees: input.attendeeEmails.map(email => ({ email })),
      conferenceData: {
        createRequest: { requestId: uuidv4(), conferenceSolutionKey: { type: 'hangoutsMeet' } },
      },
    },
  });
  const meetLink = response.data.hangoutLink;
  const calendarEventId = response.data.id;
  if (!meetLink || !calendarEventId) throw new Error('Google Calendar не вернул ссылку на встречу');
  return { meetLink, calendarEventId };
}

export async function cancelGoogleMeetEvent(calendarEventId: string): Promise<void> {
  await calendar.events.delete({ calendarId: process.env.GOOGLE_CALENDAR_ID ?? 'primary', eventId: calendarEventId });
}
```

Типы `CreateMeetEventInput`/`CreateMeetEventResult` уже описаны в том же
файле `googleCalendar.ts` — менять их не нужно, только тело функций.

---

## Как проверить, что заработало

Поднять окружение (детали — `docs/PRAVKI.md`, раздел «Как поднять
окружение»): PostgreSQL + MinIO через `brew services`, бэкенд —
`cms/packages/api` (`npm run dev`, порт 3001), CMS-админка —
`cms/packages/cms` (порт 5190).

1. Зайти в CMS-админку под тестовым аккаунтом (сид создаёт
   `admin@npk.kz` / `ChangeMe123!` — **сменить пароль перед продакшеном**).
2. Раздел «Фракция → Депутаты» — убедиться, что хотя бы у одного депутата
   заполнен Email (поле уже есть в форме редактирования).
3. На сайте (`/priemnaya`) отправить тестовое обращение с вкладкой
   «Видеоприём», указав свой email.
4. В CMS «Обращения» найти это обращение (бейдж 🎥), открыть карточку →
   «Видеоприём» → выбрать депутата и время → «Назначить видеозвонок».
5. Если `.env` заполнен верно — статус станет «Запланировано», появится
   реальная ссылка на Meet, придёт письмо на указанный email. Если
   что-то не так с credentials — увидишь текст ошибки прямо в интерфейсе
   (поле `lastError` на карточке).

---

## SMS-напоминания — отдельная, ещё не начатая задача

Это **не входит** в объём интеграции с Google Calendar, но раз речь про
напоминания — стоит знать. `cms/packages/api/src/lib/sms.ts` — точно
такая же по духу заглушка (контракт `sendSms({ to, text })`), сейчас
просто пишет в лог и ничего не отправляет. В проекте вообще нет ни
одного подключённого SMS-провайдера (есть только модель `SmsCode` под
верификацию телефона при вступлении в партию — тоже не реализована).
Нужно выбрать провайдера с поддержкой Казахстана (Mobizon, SMS.ru и
т.п.) — это решение для заказчика, не для этой задачи.

---

## Известные ограничения текущей реализации (осознанно, для MVP)

- Одна активная встреча на обращение (`AppealMeeting.appealId`
  уникален в схеме) — перенос времени перезаписывает предыдущую запись,
  истории переносов не хранится.
- При переносе старое событие в календаре удаляется
  (`cancelGoogleMeetEvent`) и создаётся новое — Google Calendar это
  нормально обрабатывает, дублей не остаётся.
- Если у депутата не заполнен email — он не попадёт в число приглашённых
  участников события (но гражданин всё равно получит письмо со ссылкой,
  если указал свой email на форме).

## Где что лежит (шпаргалка)

| Что | Файл |
|---|---|
| **Единственное место для правки** | `cms/packages/api/src/lib/googleCalendar.ts` |
| Схема БД (`Appeal.format`, `AppealMeeting`, `TeamMember.email`) | `cms/packages/api/prisma/schema.prisma` |
| Эндпоинты назначения/отмены звонка | `cms/packages/api/src/modules/appeals/appeals.controller.ts` |
| Фоновые напоминания (email, SMS-заглушка) | `cms/packages/api/src/lib/reminders.ts`, `sms.ts` |
| Экран CMS «Обращения» (блок «Видеоприём») | `cms/packages/cms/src/pages/appeals/AppealsPage.tsx` |
| Хуки CMS (`useScheduleAppealMeeting`, `useDeputies` и т.д.) | `cms/packages/cms/src/hooks/useAppeals.ts` |
| Форма на сайте (переключатель «Видеоприём») | `app/src/sections/ReceptionFull.tsx` |
| Переменные окружения | `cms/.env` (реальный), `cms/.env.example` (образец) |
