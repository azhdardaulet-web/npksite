import { Router, Request, Response } from 'express';
import { z } from 'zod';
import * as XLSX from 'xlsx';
import bcrypt from 'bcrypt';
import { prisma } from '../../lib/prisma';
import { authenticateToken, requireRole } from '../../middleware/auth';
import { verifyHCaptcha } from '../../lib/hcaptcha';
import { sendMail } from '../../lib/mailer';
import { generateMembershipCardPdf } from '../../lib/certificate';
import { ensurePrivateMembershipCardsBucket, MEMBERSHIP_CARDS_BUCKET, minioClient } from '../../lib/minio';
import { sendSms } from '../../lib/sms';
import { getSetting } from '../../lib/settings';
import { logger } from '../../lib/logger';
import { JoinRequestRoleSchema, GenderSchema, kzPhoneSchema, iinSchema, idDocNumberSchema } from '@npk/shared';
import { Prisma } from '@prisma/client';

export const joinRequestsRouter = Router();
export const cmsJoinRequestsRouter = Router();

function handleError(err: unknown, res: Response): void {
  const e = err as { message?: string; status?: number };
  res.status(e.status ?? 500).json({ error: e.message ?? 'Внутренняя ошибка' });
}

// iin/idDocNumber/address/smsCode/чекбоксы — намеренно ОПЦИОНАЛЬНЫ на уровне схемы:
// этот же эндпоинт принимает и короткую форму на главной (JoinSection.tsx — только
// ФИО+телефон, без SMS-подписи), и полный 5-шаговый визард на /vstupit (шаг «Подпись»
// требует всё на уровне UI — там кнопка «Отправить» просто не активна, пока не заполнено).
// Если smsCode пришёл — сервер обязан его проверить (см. ниже), иначе 400.
const JoinRequestInputSchema = z.object({
  role: JoinRequestRoleSchema.default('member'),
  fullName: z.string().min(1),
  birthDate: z.coerce.date().optional(),
  gender: GenderSchema.optional(),
  iin: iinSchema.optional(),
  idDocNumber: idDocNumberSchema.optional(),
  address: z.string().min(1).max(500).optional(),
  phone: kzPhoneSchema,
  email: z.string().email().optional(),
  city: z.string().min(1).optional(),
  branchId: z.string().uuid().optional(),
  merchAddress: z.string().max(500).optional(),
  // Шаг 3 визарда — оба обязательны, если вообще присутствуют в запросе (полный визард их всегда шлёт).
  article8Consent: z.boolean().optional(),
  dataConsent: z.boolean().optional(),
  // Шаг 4 визарда — код из SMS. Если передан, будет реально проверен против SmsCode.
  smsCode: z.string().regex(/^\d{6}$/).optional(),
  hCaptchaToken: z.string().min(1, 'Пройдите проверку hCaptcha'),
});

// ─── SMS-подпись заявления (шаг 4 визарда «Подпись») ───────────────────────────

const SMS_CODE_TTL_MS = 5 * 60 * 1000; // код действителен 5 минут
const SMS_CODE_MAX_ATTEMPTS = 5; // столько неверных попыток ввода допускается на один код
const SMS_RESEND_COOLDOWN_MS = 60 * 1000; // не чаще раза в минуту на один номер

function generateSmsCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function checkSmsCode(phone: string, code: string): Promise<boolean> {
  const record = await prisma.smsCode.findFirst({
    where: { phone, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });
  if (!record || record.attempts >= SMS_CODE_MAX_ATTEMPTS) return false;
  const ok = await bcrypt.compare(code, record.codeHash);
  if (!ok) {
    await prisma.smsCode.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
    return false;
  }
  // Код одноразовый — гасим его сразу после успешной проверки, чтобы не переиспользовали повторно.
  await prisma.smsCode.update({ where: { id: record.id }, data: { expiresAt: new Date() } });
  return true;
}

// POST /api/v1/join-requests/send-code — отправляет SMS-код на телефон (шаг 4 визарда).
// sendSms() пока заглушка (см. lib/sms.ts) — код уходит в лог сервера, реальная отправка
// появится, когда подключат провайдера. Логика проверки кода при этом менять не придётся.
joinRequestsRouter.post('/send-code', async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone } = z.object({ phone: kzPhoneSchema }).parse(req.body);

    const recent = await prisma.smsCode.findFirst({
      where: { phone, createdAt: { gt: new Date(Date.now() - SMS_RESEND_COOLDOWN_MS) } },
      orderBy: { createdAt: 'desc' },
    });
    if (recent) {
      res.status(429).json({ error: 'Код уже отправлен. Попробуйте через минуту.' });
      return;
    }

    const code = generateSmsCode();
    const codeHash = await bcrypt.hash(code, 10);
    await prisma.smsCode.create({ data: { phone, codeHash, expiresAt: new Date(Date.now() + SMS_CODE_TTL_MS) } });
    await sendSms({ to: phone, text: `Код подтверждения НПК: ${code}. Никому не сообщайте его.` });

    res.json({ message: 'Код отправлен', expiresInSeconds: SMS_CODE_TTL_MS / 1000 });
  } catch (err) {
    handleError(err, res);
  }
});

// POST /api/v1/join-requests/verify-code — мгновенная проверка кода в UI до финальной отправки
// заявки. НЕ гасит код (в отличие от checkSmsCode при реальной отправке) — иначе пользователь
// не смог бы этим же кодом подписать заявление на следующем шаге после успешной проверки.
joinRequestsRouter.post('/verify-code', async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, code } = z.object({ phone: kzPhoneSchema, code: z.string().regex(/^\d{6}$/) }).parse(req.body);
    const record = await prisma.smsCode.findFirst({
      where: { phone, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    const valid = !!record && record.attempts < SMS_CODE_MAX_ATTEMPTS && (await bcrypt.compare(code, record.codeHash));
    res.json({ valid });
  } catch (err) {
    handleError(err, res);
  }
});

// ─── Public: POST /api/v1/join-requests ───────────────────────────────────────

joinRequestsRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  const parsed = JoinRequestInputSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }
  try {
    const captchaOk = await verifyHCaptcha(parsed.data.hCaptchaToken);
    if (!captchaOk) {
      res.status(400).json({ error: 'Неверная капча' });
      return;
    }

    const { hCaptchaToken: _t, smsCode, article8Consent: _a, dataConsent: _d, ...data } = parsed.data;

    // Код передан — значит, это полный визард (/vstupit), и подпись обязана быть настоящей.
    let phoneVerified = false;
    if (smsCode !== undefined) {
      const codeOk = await checkSmsCode(data.phone, smsCode);
      if (!codeOk) {
        res.status(400).json({ error: 'Неверный или просроченный код из SMS' });
        return;
      }
      phoneVerified = true;
    }

    const joinRequest = await prisma.joinRequest.create({ data: { ...data, phoneVerified } });

    const notifyEmail = await getSetting('notify_email');
    if (notifyEmail) {
      await sendMail({
        to: notifyEmail,
        subject: 'Новая заявка на вступление в партию',
        html: `
          <p>Поступила новая заявка на вступление (роль: ${joinRequest.role}).</p>
          <p><b>ФИО:</b> ${joinRequest.fullName}</p>
          <p><b>Телефон:</b> ${joinRequest.phone}</p>
          <p><b>Город:</b> ${joinRequest.city ?? '—'}</p>
        `,
      });
    }

    // Гражданину — только подтверждение приёма в обработку (план правок №2, D3).
    // Партбилет с QR уходит отдельным письмом позже, при смене статуса на «Принята».
    if (joinRequest.email) {
      await sendMail({
        to: joinRequest.email,
        subject: 'Заявление принято к рассмотрению — Народная партия Казахстана',
        html: `
          <p>Здравствуйте, ${joinRequest.fullName}!</p>
          <p>Ваше заявление на вступление в Народную партию Казахстана принято к рассмотрению.</p>
          <p>Номер заявления: <b>${joinRequest.id}</b></p>
          <p>Мы свяжемся с вами после рассмотрения.</p>
        `,
      });
    }

    res.status(201).json({ message: 'Заявка успешно отправлена', id: joinRequest.id });
  } catch (err) {
    handleError(err, res);
  }
});

// ─── CMS: GET /cms/api/v1/join-requests ───────────────────────────────────────
// По ТЗ (п. 6.1) заявки на вступление видит только Администратор — остальные
// роли отвечают за новости/контент/обращения, но не за приём в партию.

const requireCms = [authenticateToken, requireRole('ADMIN')];

async function getNextMemberNumber(): Promise<string> {
  const requests = await prisma.joinRequest.findMany({
    where: { memberNumber: { not: null } },
    select: { memberNumber: true },
  });
  const currentMax = requests.reduce((max, item) => Math.max(max, Number(item.memberNumber) || 0), 0);
  const configuredStart = Number(await getSetting('member_number_start')) || 1;
  const next = currentMax > 0 ? currentMax + 1 : configuredStart;
  return String(next).padStart(Math.max(8, String(configuredStart).length), '0');
}

cmsJoinRequestsRouter.get('/membership-card/next-number', ...requireCms, async (_req, res) => {
  res.json({ memberNumber: await getNextMemberNumber() });
});

const ListQuerySchema = z.object({
  status: z.enum(['NEW', 'PROCESSING', 'ACCEPTED', 'REJECTED']).optional(),
  role: JoinRequestRoleSchema.optional(),
  q: z.string().max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

cmsJoinRequestsRouter.get('/', ...requireCms, async (req: Request, res: Response): Promise<void> => {
  const parsed = ListQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'Некорректные параметры', details: parsed.error.flatten() });
    return;
  }

  try {
    const { status, role, q, page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    const where: Prisma.JoinRequestWhereInput = {
      ...(status ? { status } : {}),
      ...(role ? { role } : {}),
      ...(q
        ? {
            OR: [
              { fullName: { contains: q, mode: 'insensitive' as const } },
              { phone: { contains: q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      prisma.joinRequest.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.joinRequest.count({ where }),
    ]);

    res.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    handleError(err, res);
  }
});

const ROLE_LABEL: Record<string, string> = {
  member: 'Член партии',
  volunteer: 'Волонтёр',
  observer: 'Наблюдатель',
};

const STATUS_LABEL: Record<string, string> = {
  NEW: 'Новая',
  PROCESSING: 'В обработке',
  ACCEPTED: 'Принята',
  REJECTED: 'Отклонена',
};

cmsJoinRequestsRouter.get('/export', ...requireCms, async (req: Request, res: Response): Promise<void> => {
  const parsed = ListQuerySchema.omit({ page: true, limit: true }).safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: 'Некорректные параметры', details: parsed.error.flatten() });
    return;
  }

  try {
    const { status, role, q } = parsed.data;
    const where: Prisma.JoinRequestWhereInput = {
      ...(status ? { status } : {}),
      ...(role ? { role } : {}),
      ...(q
        ? {
            OR: [
              { fullName: { contains: q, mode: 'insensitive' as const } },
              { phone: { contains: q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const requests = await prisma.joinRequest.findMany({ where, orderBy: { createdAt: 'desc' } });

    const rows = requests.map((r) => ({
      'Дата': r.createdAt.toLocaleString('ru-RU'),
      'ФИО': r.fullName,
      'Роль': ROLE_LABEL[r.role] ?? r.role,
      'Дата рождения': r.birthDate ? r.birthDate.toLocaleDateString('ru-RU') : '',
      'ИИН': r.iin ?? '',
      'Номер удостоверения': r.idDocNumber ?? '',
      'Адрес': r.address ?? '',
      'Телефон': r.phone,
      'Email': r.email ?? '',
      'Город': r.city ?? '',
      'Статус': STATUS_LABEL[r.status] ?? r.status,
      'Телефон подтверждён': r.phoneVerified ? 'Да' : 'Нет',
    }));

    const sheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'Заявки');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename="zayavki.xlsx"');
    res.send(buffer);
  } catch (err) {
    handleError(err, res);
  }
});

cmsJoinRequestsRouter.get('/:id', ...requireCms, async (req: Request, res: Response): Promise<void> => {
  try {
    const joinRequest = await prisma.joinRequest.findUnique({ where: { id: String(req.params['id']) } });
    if (!joinRequest) {
      res.status(404).json({ error: 'Заявка не найдена' });
      return;
    }
    res.json(joinRequest);
  } catch (err) {
    handleError(err, res);
  }
});

const UpdateStatusSchema = z.object({
  status: z.enum(['NEW', 'PROCESSING', 'ACCEPTED', 'REJECTED']),
});

const AcceptMembershipSchema = z.object({
  memberNumber: z.string().regex(/^\d+$/).min(1).max(30),
  fullNameKz: z.string().trim().min(3).max(250),
  fullNameRu: z.string().trim().min(3).max(250),
  joinDate: z.coerce.date(),
});

cmsJoinRequestsRouter.post('/:id/membership-card', ...requireCms, async (req: Request, res: Response): Promise<void> => {
  const parsed = AcceptMembershipSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Проверьте данные партбилета', details: parsed.error.flatten() });
    return;
  }
  try {
    const id = String(req.params['id']);
    const request = await prisma.joinRequest.findUnique({ where: { id } });
    if (!request) {
      res.status(404).json({ error: 'Заявка не найдена' });
      return;
    }
    if (!request.email) {
      res.status(400).json({ error: 'У заявки не указан email' });
      return;
    }
    if (request.status === 'ACCEPTED') {
      res.status(409).json({ error: 'Заявка уже принята' });
      return;
    }

    const numberOwner = await prisma.joinRequest.findUnique({ where: { memberNumber: parsed.data.memberNumber } });
    if (numberOwner && numberOwner.id !== id) {
      res.status(409).json({ error: 'Этот номер билета уже используется' });
      return;
    }

    const pdfBuffer = await generateMembershipCardPdf({ ...parsed.data, verifyUuid: request.verifyUuid });
    await ensurePrivateMembershipCardsBucket();
    const objectName = `${request.verifyUuid}.pdf`;
    await minioClient.putObject(
      MEMBERSHIP_CARDS_BUCKET,
      objectName,
      pdfBuffer,
      pdfBuffer.length,
      { 'Content-Type': 'application/pdf' },
    );
    const verifyUrl = `${process.env.SITE_URL ?? 'http://localhost:3000'}/verify/${request.verifyUuid}`;
    const updated = await prisma.joinRequest.update({
      where: { id },
      data: { ...parsed.data, status: 'ACCEPTED', cardFileUrl: `minio://${MEMBERSHIP_CARDS_BUCKET}/${objectName}` },
    });
    try {
      await sendMail({
        to: request.email,
        subject: 'Вы вступили в Народную партию Казахстана',
        html: `<p>Здравствуйте, ${parsed.data.fullNameRu}!</p><p>Вы вступили в Народную партию Казахстана.</p><p>Онлайн-партбилет приложен к письму.</p><p>Проверить подлинность:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
        attachments: [{ filename: `partbilet-${parsed.data.memberNumber}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }],
      });
    } catch (mailErr) {
      // Принятую заявку и сохранённый билет не откатываем из-за временного сбоя почты.
      logger.error('Не удалось отправить партбилет', { requestId: id, error: (mailErr as Error).message });
    }
    res.json(updated);
  } catch (err) {
    handleError(err, res);
  }
});

cmsJoinRequestsRouter.put('/:id/status', ...requireCms, async (req: Request, res: Response): Promise<void> => {
  const parsed = UpdateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Ошибка валидации', details: parsed.error.flatten() });
    return;
  }
  if (parsed.data.status === 'ACCEPTED') {
    res.status(400).json({ error: 'Для принятия используйте генерацию партбилета' });
    return;
  }

  try {
    const id = String(req.params['id']);
    const joinRequest = await prisma.joinRequest.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    res.json(joinRequest);
  } catch (err) {
    handleError(err, res);
  }
});

// GET /api/v1/join-requests/verify/:id — публичная проверка принятого партбилета.
// Возвращаем только имя, номер и дату вступления, без контактов и документов.
joinRequestsRouter.get('/verify/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const joinRequest = await prisma.joinRequest.findFirst({
      where: {
        verifyUuid: String(req.params['id']),
        status: 'ACCEPTED',
        memberNumber: { not: null },
        joinDate: { not: null },
      },
    });
    if (!joinRequest) {
      res.status(404).json({ found: false });
      return;
    }
    res.json({
      found: true,
      status: joinRequest.status,
      fullName: joinRequest.fullNameRu ?? joinRequest.fullName,
      memberNumber: joinRequest.memberNumber,
      joinDate: joinRequest.joinDate,
    });
  } catch (err) {
    handleError(err, res);
  }
});
