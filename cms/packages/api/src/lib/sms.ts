import { logger } from './logger';

// ─── SMS — dev-заглушка (замени тело на реальный провайдер) ────────────────
//
// В проекте пока нет ни одного реального SMS-провайдера. Оба существующих
// вызывающих кода уже полностью готовы и ждут только эту функцию:
//   1. join-requests.controller.ts — подпись заявления о вступлении
//      (POST /api/v1/join-requests/send-code, модель SmsCode в schema.prisma,
//      bcrypt-хеш кода, TTL 5 мин, кулдаун 60с, лимит попыток — всё готово).
//   2. reminders.ts — напоминание за час до видеоприёма.
// Сейчас sendSms() только логирует код через logger.warn — этого достаточно
// для локальной разработки/тестов (код виден в консоли сервера), но НЕ для
// продакшена. Какой провайдер выбрать (Mobizon/SMS.ru/Twilio и т.п.) —
// решает партнёр-разработчик вместе с заказчиком.
//
// Контракт нарочно простой (как sendMail), чтобы вызывающий код не пришлось
// переписывать — только заполнить тело функции ниже и добавить переменные
// окружения (SMS_API_KEY/SMS_API_URL/SMS_SENDER_NAME — уже есть в
// cms/.env.example) по образцу SMTP_* в cms/.env.

export async function sendSms(opts: { to: string; text: string }): Promise<void> {
  logger.warn(`SMS provider not configured — skipping SMS to ${opts.to}: ${opts.text}`);
}
