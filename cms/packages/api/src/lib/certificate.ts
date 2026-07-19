import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

// Онлайн-партбилет — PDF-сертификат с QR-кодом проверки на /verify/[id] (публичная
// страница сайта app/, без персональных данных). Отправляется по email при принятии
// заявки (статус ACCEPTED), см. join-requests.controller.ts.
export async function generateCertificatePdf(opts: {
  fullName: string;
  requestId: string;
  acceptedDate: Date;
}): Promise<Buffer> {
  const siteUrl = process.env.SITE_URL ?? 'http://localhost:3000';
  const verifyUrl = `${siteUrl}/verify/${opts.requestId}`;

  const qrPng = await QRCode.toBuffer(verifyUrl, { margin: 1, width: 300, color: { dark: '#111318', light: '#ffffff' } });

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 400]); // A5 альбомная
  const { width, height } = page.getSize();

  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  const brandRed = rgb(0.863, 0.059, 0.176); // #DC0F2D — эталонный красный НПК
  const dark = rgb(0.067, 0.075, 0.094);
  const gray = rgb(0.4, 0.4, 0.4);

  // Верхняя красная полоса — фирменный акцент.
  page.drawRectangle({ x: 0, y: height - 10, width, height: 10, color: brandRed });

  page.drawText('НАРОДНАЯ ПАРТИЯ КАЗАХСТАНА', {
    x: 40, y: height - 60, size: 12, font: fontBold, color: brandRed,
  });
  page.drawText('Онлайн-партийный билет', {
    x: 40, y: height - 95, size: 22, font: fontBold, color: dark,
  });

  page.drawText('Настоящим подтверждается, что', { x: 40, y: height - 140, size: 11, font, color: gray });
  page.drawText(opts.fullName, { x: 40, y: height - 165, size: 18, font: fontBold, color: dark });
  page.drawText('вступил(а) в Народную партию Казахстана.', { x: 40, y: height - 190, size: 11, font, color: gray });

  page.drawText(`Номер заявления: ${opts.requestId}`, { x: 40, y: height - 230, size: 10, font, color: gray });
  page.drawText(`Дата принятия: ${opts.acceptedDate.toLocaleDateString('ru-RU')}`, { x: 40, y: height - 248, size: 10, font, color: gray });

  const qrImage = await pdf.embedPng(qrPng);
  const qrSize = 110;
  page.drawImage(qrImage, { x: width - qrSize - 40, y: height - qrSize - 90, width: qrSize, height: qrSize });
  page.drawText('Проверить подлинность', {
    x: width - qrSize - 40, y: height - qrSize - 100, size: 8, font, color: gray,
  });

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}
