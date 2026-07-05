// Проверка hCaptcha-токена. Если HCAPTCHA_SECRET не задан в .env — пропускаем
// проверку (дев-режим без ключей).
export async function verifyHCaptcha(token: string): Promise<boolean> {
  const secret = process.env.HCAPTCHA_SECRET;
  if (!secret) return true;

  const res = await fetch('https://hcaptcha.com/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `response=${encodeURIComponent(token)}&secret=${encodeURIComponent(secret)}`,
  });
  const data = (await res.json()) as { success: boolean };
  return data.success;
}
