// Валидация ИИН РК (12 цифр: ГГММДД + век/пол + порядковый номер + контрольная цифра).
// Зеркалит cms/packages/shared/src/index.ts isValidIin — там же используется на бэкенде
// при финальной отправке заявки, здесь — для мгновенной подсказки при вводе на /vstupit.

export function isValidIin(iin: string): boolean {
  if (!/^\d{12}$/.test(iin)) return false;
  const d = iin.split('').map(Number);

  // 7-я цифра — век+пол: 1/2 → 1800-е, 3/4 → 1900-е, 5/6 → 2000-е; нечётная — мужчина, чётная — женщина.
  const centuryDigit = d[6];
  if (centuryDigit < 1 || centuryDigit > 6) return false;
  const century = Math.floor((centuryDigit - 1) / 2) + 18;
  const yy = d[0] * 10 + d[1];
  const mm = d[2] * 10 + d[3];
  const dd = d[4] * 10 + d[5];
  if (mm < 1 || mm > 12) return false;
  const year = century * 100 + yy;
  const daysInMonth = new Date(year, mm, 0).getDate();
  if (dd < 1 || dd > daysInMonth) return false;

  const w1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  let control = d.slice(0, 11).reduce((sum, digit, i) => sum + digit * w1[i], 0) % 11;
  if (control === 10) {
    const w2 = [3, 4, 5, 6, 7, 8, 9, 10, 11, 1, 2];
    control = d.slice(0, 11).reduce((sum, digit, i) => sum + digit * w2[i], 0) % 11;
    if (control === 10) return false;
  }
  return control === d[11];
}
