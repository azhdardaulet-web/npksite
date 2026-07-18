import cron from 'node-cron';
import { prisma } from './prisma';
import { sendMail } from './mailer';
import { sendSms } from './sms';
import { logger } from './logger';

// ─── Напоминание за 1 час до видеоприёма ────────────────────────────────────
//
// Каждые 5 минут ищем AppealMeeting со status=SCHEDULED, scheduledAt в
// ближайший час и ещё не напомненные (reminderSentAt=null), шлём email
// (реальный, через sendMail) + SMS (заглушка, см. sms.ts — тихо ничего не
// делает, пока не подключён провайдер) и помечаем reminderSentAt, чтобы не
// напомнить дважды.
//
// Работает уже сейчас для email — SMS начнёт реально уходить, как только
// в sms.ts появится настоящий провайдер, здесь менять ничего не нужно.

const REMINDER_WINDOW_MS = 60 * 60 * 1000; // 1 час

async function sendDueReminders(): Promise<void> {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + REMINDER_WINDOW_MS);

  const due = await prisma.appealMeeting.findMany({
    where: {
      status: 'SCHEDULED',
      reminderSentAt: null,
      scheduledAt: { gte: now, lte: windowEnd },
    },
    include: { appeal: true, deputy: { include: { translations: true } } },
  });

  for (const meeting of due) {
    const deputyName = meeting.deputy.translations.find(t => t.lang === 'ru')?.name ?? meeting.deputy.translations[0]?.name ?? 'депутат';
    const when = meeting.scheduledAt.toLocaleString('ru-RU', { timeZone: 'Asia/Almaty', dateStyle: 'short', timeStyle: 'short' });

    if (meeting.appeal.email) {
      await sendMail({
        to: meeting.appeal.email,
        subject: `Напоминание: видеоприём через час (${meeting.appeal.appealNumber})`,
        html: `
          <p>Здравствуйте, ${meeting.appeal.fullName}!</p>
          <p>Напоминаем: через час, в ${when}, у вас видеоприём с ${deputyName}.</p>
          ${meeting.meetLink ? `<p>Ссылка на встречу: <a href="${meeting.meetLink}">${meeting.meetLink}</a></p>` : ''}
        `,
      });
    }
    await sendSms({
      to: meeting.appeal.phone,
      text: `НПК: напоминаем, через час (${when}) у вас видеоприём с ${deputyName}. ${meeting.meetLink ?? ''}`,
    });

    await prisma.appealMeeting.update({ where: { id: meeting.id }, data: { reminderSentAt: now } });
    logger.info(`Reminder sent for AppealMeeting ${meeting.id} (appeal ${meeting.appeal.appealNumber})`);
  }
}

export function startReminderScheduler(): void {
  // Каждые 5 минут — окно в час достаточно широкое, чтобы не пропустить встречу
  cron.schedule('*/5 * * * *', () => {
    sendDueReminders().catch(err => logger.error('Reminder scheduler failed', { error: (err as Error).message }));
  });
  logger.info('Reminder scheduler started (video-call reminders, every 5 min)');
}
