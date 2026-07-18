import { logger } from './logger';

// ─── SMS — заглушка ─────────────────────────────────────────────────────────
//
// В проекте пока нет ни одного реального SMS-провайдера (только модель
// SmsCode в schema.prisma — задел под верификацию телефона при вступлении
// в партию, Этап 4 плана, тоже не реализован). Для напоминаний о видеоприёме
// (см. reminders.ts) нужен провайдер вроде Mobizon/SMS.ru/Twilio — какой
// именно, решает партнёр-разработчик вместе с заказчиком.
//
// Контракт нарочно простой (as sendMail), чтобы reminders.ts не пришлось
// переписывать — только заполнить тело функции и добавить переменные
// окружения (SMS_API_KEY и т.п.) по образцу SMTP_* в cms/.env.

export async function sendSms(opts: { to: string; text: string }): Promise<void> {
  logger.warn(`SMS provider not configured — skipping SMS to ${opts.to}: ${opts.text}`);
}
