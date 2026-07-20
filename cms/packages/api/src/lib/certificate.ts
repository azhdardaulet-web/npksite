import fs from 'fs';
import path from 'path';
import { PDFDocument, PDFFont, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import QRCode from 'qrcode';
import sharp from 'sharp';

const brandRed = '#ed1a3b';
const red = rgb(0.929, 0.102, 0.231);
const black = rgb(0.063, 0.063, 0.063);

function repoAsset(relative: string): Buffer {
  const candidates = [
    path.resolve(process.cwd(), '../../..', relative),
    path.resolve(process.cwd(), relative),
  ];
  const found = candidates.find(fs.existsSync);
  if (!found) throw new Error(`Не найден ресурс партбилета: ${relative}`);
  return fs.readFileSync(found);
}

function fitText(font: PDFFont, text: string, maxWidth: number, preferred: number, min = 18): number {
  let size = preferred;
  while (size > min && font.widthOfTextAtSize(text, size) > maxWidth) size -= 1;
  return size;
}

const ICON_PATHS = {
  id: '<rect width="20" height="14" x="2" y="5" rx="2"/><path d="M16 10h2M16 14h2"/><circle cx="9" cy="11" r="2"/><path d="M6.2 15a3 3 0 0 1 5.6 0"/>',
  user: '<circle cx="12" cy="7" r="4"/><path d="M4 22a8 8 0 0 1 16 0"/>',
  calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>',
} as const;

async function makeIconPng(kind: keyof typeof ICON_PATHS): Promise<Buffer> {
  const svg = `<svg width="124" height="124" viewBox="0 0 62 62" xmlns="http://www.w3.org/2000/svg"><rect width="62" height="62" rx="10" fill="${brandRed}"/><g transform="translate(12 12) scale(1.58)" fill="none" stroke="white" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[kind]}</g></svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function drawCard(pdf: PDFDocument, opts: { lang: 'kz' | 'ru'; name: string; number: string; date: string; qr: Buffer; font: PDFFont; bold: PDFFont }) {
  const page = pdf.addPage([880, 555]);
  const { font, bold } = opts;
  const frameSvg = `<svg width="1760" height="1110" viewBox="0 0 880 555" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="876" height="551" rx="22" fill="white" stroke="${brandRed}" stroke-width="2"/></svg>`;
  const frame = await pdf.embedPng(await sharp(Buffer.from(frameSvg)).png().toBuffer());
  page.drawImage(frame, { x: 0, y: 0, width: 880, height: 555 });

  const logoSvg = repoAsset(`content/Logo/${opts.lang === 'kz' ? 'kz' : 'ru'} logo.svg`);
  const logoPng = await sharp(logoSvg, { density: 600 }).png().toBuffer();
  const logo = await pdf.embedPng(logoPng);
  page.drawImage(logo, { x: 44, y: 448, width: opts.lang === 'kz' ? 295 : 300, height: 100 });
  page.drawLine({ start: { x: 44, y: 438 }, end: { x: 836, y: 438 }, color: red, thickness: 2 });

  const title = opts.lang === 'kz' ? 'ПАРТИЯЛЫҚ БИЛЕТ' : 'ПАРТИЙНЫЙ БИЛЕТ';
  page.drawText(title, { x: 44, y: 375, size: 45, font: bold, color: red });

  const rows = opts.lang === 'kz'
    ? [['id', 'Мүшелік нөмірі', `№ ${opts.number}`], ['user', 'Аты-жөні', opts.name.toUpperCase()], ['calendar', 'Партияға қабылданған күні:', opts.date]]
    : [['id', 'Номер члена партии', `№ ${opts.number}`], ['user', 'ФИО', opts.name.toUpperCase()], ['calendar', 'Дата вступления в партию:', opts.date]];
  const iconImages = await Promise.all(['id', 'user', 'calendar'].map(async (kind) => pdf.embedPng(await makeIconPng(kind as keyof typeof ICON_PATHS))));
  [285, 202, 119].forEach((y, index) => {
    const [, label, value] = rows[index]!;
    page.drawImage(iconImages[index]!, { x: 44, y, width: 62, height: 62 });
    page.drawText(label!, { x: 124, y: y + 40, size: 17, font, color: black });
    const valueSize = fitText(bold, value!, 500, index === 1 ? 27 : 29);
    page.drawText(value!, { x: 124, y: y + 8, size: valueSize, font: bold, color: index === 1 ? black : red });
  });

  const qrImage = await pdf.embedPng(opts.qr);
  page.drawImage(qrImage, { x: 674, y: 190, width: 160, height: 160 });
  const note = opts.lang === 'kz'
    ? ['Түпнұсқалығын тексеру', 'үшін QR кодты', 'сканерлеңіз']
    : ['Отсканируйте QR-код', 'для проверки', 'подлинности'];
  note.forEach((line, i) => page.drawText(line, { x: 678, y: 162 - i * 19, size: 15, font, color: black }));
}

export async function generateMembershipCardPdf(opts: { fullNameKz: string; fullNameRu: string; memberNumber: string; joinDate: Date; verifyUuid: string }): Promise<Buffer> {
  const siteUrl = process.env.SITE_URL ?? 'http://localhost:3000';
  const verifyUrl = `${siteUrl}/verify/${opts.verifyUuid}`;
  const qr = await QRCode.toBuffer(verifyUrl, { margin: 0, width: 320, errorCorrectionLevel: 'M' });
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(repoAsset('app/public/fonts/Formular.otf'));
  const bold = await pdf.embedFont(repoAsset('app/public/fonts/Formular-Bold.otf'));
  const date = opts.joinDate.toLocaleDateString('ru-RU');
  await drawCard(pdf, { lang: 'kz', name: opts.fullNameKz, number: opts.memberNumber, date, qr, font, bold });
  await drawCard(pdf, { lang: 'ru', name: opts.fullNameRu, number: opts.memberNumber, date, qr, font, bold });
  return Buffer.from(await pdf.save());
}
