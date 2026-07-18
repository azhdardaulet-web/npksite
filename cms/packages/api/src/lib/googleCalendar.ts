// ─── Google Calendar / Meet — единственная точка интеграции ────────────────────
//
// Это заглушка. Реальный вызов Google Calendar API сюда подключает партнёр-
// разработчик — остальной код проекта (cms/packages/api/src/modules/appeals,
// админка CMS) уже полностью готов и вызывает только createGoogleMeetEvent()
// и cancelGoogleMeetEvent() ниже, ничего больше менять не нужно.
//
// Пошаговая инструкция и какие переменные окружения понадобятся —
// docs/GOOGLE_MEET_SETUP.md.

export interface CreateMeetEventInput {
  /** Тема события в календаре, напр. «Видеоприём: обращение NPK-2026-00042» */
  summary: string;
  /** Описание события — текст обращения, ФИО, тема */
  description: string;
  startTime: Date;
  durationMinutes: number;
  /** Email гражданина и депутата — приглашённые участники события */
  attendeeEmails: string[];
}

export interface CreateMeetEventResult {
  /** Ссылка на видеовстречу (Google Meet), уходит гражданину и депутату письмом */
  meetLink: string;
  /** ID события в Google Calendar — нужен для отмены/переноса через cancelGoogleMeetEvent */
  calendarEventId: string;
}

/**
 * Создаёт событие в Google Calendar аккаунта партии с видеозвонком (Meet)
 * и возвращает ссылку. Вызывается из PUT /cms/api/v1/appeals/:id/meeting
 * (см. appeals.controller.ts) при назначении/переносе видеоприёма.
 *
 * Ожидаемая реализация (см. docs/GOOGLE_MEET_SETUP.md):
 *   1. OAuth2-клиент (google-auth-library) с refresh token аккаунта партии
 *      из переменных окружения GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET /
 *      GOOGLE_REFRESH_TOKEN.
 *   2. calendar.events.insert({ calendarId: process.env.GOOGLE_CALENDAR_ID,
 *      conferenceDataVersion: 1, requestBody: { summary, description,
 *      start: { dateTime: startTime }, end: { dateTime: ... },
 *      attendees: attendeeEmails.map(email => ({ email })),
 *      conferenceData: { createRequest: { requestId: uuid(),
 *        conferenceSolutionKey: { type: 'hangoutsMeet' } } } } }).
 *   3. Вернуть { meetLink: response.data.hangoutLink, calendarEventId: response.data.id }.
 *
 * Пока не реализовано — бросает ошибку. Вызывающий код (appeals.controller.ts)
 * это ожидает: ловит исключение, сохраняет AppealMeeting со status=PENDING
 * и текстом ошибки в lastError, менеджеру в CMS показывается понятное
 * сообщение вместо падения запроса.
 */
export async function createGoogleMeetEvent(_input: CreateMeetEventInput): Promise<CreateMeetEventResult> {
  throw new Error(
    'Google Calendar API не подключён — см. docs/GOOGLE_MEET_SETUP.md и cms/packages/api/src/lib/googleCalendar.ts'
  );
}

/**
 * Отменяет/удаляет ранее созданное событие. Вызывается при отмене видеоприёма
 * (DELETE /cms/api/v1/appeals/:id/meeting) и при переносе на новое время
 * (старое событие лучше удалить, а не оставлять дублем в календаре).
 *
 * Ожидаемая реализация: calendar.events.delete({ calendarId, eventId }).
 * Пока не реализовано — тихо ничего не делает (не бросает ошибку), чтобы
 * отмена в нашей БД не блокировалась отсутствующей интеграцией: событие
 * останется в календаре до подключения API, это не критично.
 */
export async function cancelGoogleMeetEvent(_calendarEventId: string): Promise<void> {
  // Намеренно no-op до подключения — см. комментарий выше.
}
