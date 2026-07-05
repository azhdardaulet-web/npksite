import nodemailer from 'nodemailer';
import { logger } from './logger';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMail(opts: { to: string; subject: string; html: string }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    logger.warn('SMTP not configured — skipping email send');
    return;
  }
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM ?? 'DAR Rail <noreply@darrail.com>',
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    logger.info(`Email sent to ${opts.to}: ${opts.subject}`);
  } catch (err) {
    logger.error('Failed to send email', { error: (err as Error).message });
  }
}
