// Возвращает русское значение, если выбранное языковое поле пустое.
export function localizedValue<T>(value: T | null | undefined, fallback: T | null | undefined): T | null {
  if (typeof value === 'string' && value.trim().length === 0) return fallback ?? null;
  if (Array.isArray(value) && value.length === 0) return fallback ?? null;
  if (value === null || value === undefined) return fallback ?? null;
  return value;
}
