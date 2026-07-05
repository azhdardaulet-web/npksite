import { Router } from 'express';
import { z } from 'zod';
import { SurveyType } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { authenticateToken, requireRole } from '../../middleware/auth';
import { sendMail } from '../../lib/mailer';

export const surveysRouter = Router();
export const cmsSurveysRouter = Router();

const SURVEY_LABELS: Record<string, string> = {
  transportation: 'Перевозочная деятельность',
  forwarding: 'Транспортно-экспедиторское обслуживание',
};

const surveySchema = z.object({
  surveyType: z.enum(['transportation', 'forwarding']),
  company: z.string().min(1),
  contactName: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
  answers: z.record(z.union([z.string(), z.number()])),
});

function buildEmailHtml(data: z.infer<typeof surveySchema>): string {
  const typeLabel = SURVEY_LABELS[data.surveyType] ?? data.surveyType;
  const answersHtml = Object.entries(data.answers)
    .map(([key, val]) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #eee;color:#666;font-size:13px">${key}</td><td style="padding:6px 12px;border-bottom:1px solid #eee;font-weight:600;font-size:13px">${val}</td></tr>`)
    .join('');

  return `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5">
      <div style="background:#383233;padding:24px 32px">
        <p style="color:#D64338;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px">DAR RAIL</p>
        <h2 style="color:#fff;margin:0;font-size:20px">Новая анкета удовлетворённости</h2>
        <p style="color:rgba(255,255,255,0.6);margin:4px 0 0;font-size:13px">${typeLabel}</p>
      </div>
      <div style="padding:24px 32px">
        <h3 style="color:#383233;margin:0 0 16px;font-size:15px;text-transform:uppercase;letter-spacing:1px">Контактные данные</h3>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:6px 12px;border-bottom:1px solid #eee;color:#666;font-size:13px">Компания</td><td style="padding:6px 12px;border-bottom:1px solid #eee;font-weight:600;font-size:13px">${data.company}</td></tr>
          <tr><td style="padding:6px 12px;border-bottom:1px solid #eee;color:#666;font-size:13px">Контакт</td><td style="padding:6px 12px;border-bottom:1px solid #eee;font-weight:600;font-size:13px">${data.contactName}</td></tr>
          <tr><td style="padding:6px 12px;border-bottom:1px solid #eee;color:#666;font-size:13px">Телефон</td><td style="padding:6px 12px;border-bottom:1px solid #eee;font-weight:600;font-size:13px">${data.phone}</td></tr>
          <tr><td style="padding:6px 12px;border-bottom:1px solid #eee;color:#666;font-size:13px">Email</td><td style="padding:6px 12px;border-bottom:1px solid #eee;font-weight:600;font-size:13px">${data.email}</td></tr>
        </table>
        <h3 style="color:#383233;margin:24px 0 16px;font-size:15px;text-transform:uppercase;letter-spacing:1px">Ответы</h3>
        <table style="width:100%;border-collapse:collapse">${answersHtml}</table>
      </div>
      <div style="background:#F5F1EC;padding:16px 32px;font-size:12px;color:#766C66">
        Анкета получена через сайт DAR Rail
      </div>
    </div>
  `;
}

// POST /api/v1/surveys — public submission
surveysRouter.post('/', async (req, res, next) => {
  try {
    const data = surveySchema.parse(req.body);

    const submission = await prisma.surveySubmission.create({
      data: {
        surveyType: data.surveyType,
        company: data.company,
        contactName: data.contactName,
        phone: data.phone,
        email: data.email,
        answers: data.answers,
      },
    });

    // Send notification email if configured
    const notifSetting = await prisma.setting.findUnique({ where: { key: 'survey_notification_email' } });
    const enabledSetting = await prisma.setting.findUnique({ where: { key: 'survey_notifications_enabled' } });

    if (notifSetting?.value && enabledSetting?.value === 'true') {
      const html = buildEmailHtml(data);
      await sendMail({
        to: notifSetting.value,
        subject: `Новая анкета: ${SURVEY_LABELS[data.surveyType]} — ${data.company}`,
        html,
      });
    }

    res.status(201).json({ message: 'Анкета успешно отправлена', id: submission.id });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Ошибка валидации', details: err.errors });
    }
    next(err);
  }
});

// GET /cms/api/v1/surveys
cmsSurveysRouter.get('/', authenticateToken, requireRole('ADMIN', 'CONTENT_MANAGER'), async (req, res, next) => {
  try {
    const page = req.query.page as string | undefined;
    const limit = req.query.limit as string | undefined;
    const type = req.query.type as string | undefined;
    const skip = page ? (parseInt(page) - 1) * (limit ? parseInt(limit) : 20) : 0;
    const take = limit ? parseInt(limit) : 20;
    const validTypes: SurveyType[] = ['transportation', 'forwarding'];
    const where = type && validTypes.includes(type as SurveyType) ? { surveyType: type as SurveyType } : {};

    const [data, total] = await Promise.all([
      prisma.surveySubmission.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.surveySubmission.count({ where }),
    ]);

    res.json({ data, total, page: page ? parseInt(page) : 1, limit: take, totalPages: Math.ceil(total / take) });
  } catch (err) {
    next(err);
  }
});

// GET /cms/api/v1/surveys/:id
cmsSurveysRouter.get('/:id', authenticateToken, requireRole('ADMIN', 'CONTENT_MANAGER'), async (req, res, next) => {
  try {
    const submission = await prisma.surveySubmission.findUnique({ where: { id: req.params.id as string } });
    if (!submission) return res.status(404).json({ error: 'Не найдено' });
    res.json(submission);
  } catch (err) {
    next(err);
  }
});

// GET /cms/api/v1/settings
export const cmsSettingsRouter = Router();

cmsSettingsRouter.get('/', authenticateToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const settings = await prisma.setting.findMany();
    const result = Object.fromEntries(settings.map((s) => [s.key, s.value]));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// PUT /cms/api/v1/settings/:key
cmsSettingsRouter.put('/:key', authenticateToken, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const key = req.params.key as string;
    const { value } = req.body as { value: string };
    if (typeof value !== 'string') return res.status(400).json({ error: 'value обязателен' });

    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    res.json(setting);
  } catch (err) {
    next(err);
  }
});
