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

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{ filename: string; content: Buffer; contentType?: string }>;
}) {
  if (process.env.RESEND_API_KEY) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.RESEND_FROM ?? process.env.SMTP_FROM ?? 'НПК <noreply@halykpartiyasy.kz>',
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
        attachments: opts.attachments?.map((file) => ({ filename: file.filename, content: file.content.toString('base64') })),
      }),
    });
    if (!response.ok) throw new Error(`Resend: ${response.status} ${await response.text()}`);
    logger.info(`Email sent via Resend to ${opts.to}: ${opts.subject}`);
    return;
  }
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    logger.warn('Resend/SMTP not configured — skipping email send');
    return;
  }
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM ?? 'НПК <noreply@halykparty.kz>',
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      attachments: opts.attachments,
    });
    logger.info(`Email sent to ${opts.to}: ${opts.subject}`);
  } catch (err) {
    logger.error('Failed to send email', { error: (err as Error).message });
  }
}
