import { Router } from 'express';
import { logger } from '../../lib/logger';

export const publicAddressRouter = Router();

export interface AddressSuggestion {
  label: string; // полная строка для показа в выпадающем списке
  value: string; // строка, которую подставляем в поле адреса при выборе
}

// GET /api/v1/address/suggest?q=... — автоподсказки адреса через 2ГИС Suggest API
// (План правок №2, C4). Без TWOGIS_API_KEY просто отдаёт пустой список — поле адреса
// на /vstupit остаётся обычным текстовым инпутом, подсказки необязательны.
publicAddressRouter.get('/suggest', async (req, res) => {
  const q = String(req.query.q ?? '').trim();
  if (q.length < 3) {
    res.json({ suggestions: [] });
    return;
  }

  const apiKey = process.env.TWOGIS_API_KEY;
  if (!apiKey) {
    res.json({ suggestions: [] });
    return;
  }

  try {
    const url = new URL('https://catalog.api.2gis.com/3.0/suggests');
    url.searchParams.set('q', q);
    url.searchParams.set('key', apiKey);
    url.searchParams.set('country_code', 'kz');
    url.searchParams.set('fields', 'items.point,items.address_name,items.full_name');

    const response = await fetch(url.toString());
    if (!response.ok) {
      logger.warn(`2GIS suggest вернул ${response.status}`);
      res.json({ suggestions: [] });
      return;
    }

    const data = (await response.json()) as {
      result?: { items?: Array<{ full_name?: string; address_name?: string; name?: string }> };
    };
    const items = data.result?.items ?? [];
    const suggestions: AddressSuggestion[] = items
      .map((it) => {
        const label = it.full_name || [it.name, it.address_name].filter(Boolean).join(', ');
        return label ? { label, value: label } : null;
      })
      .filter((s): s is AddressSuggestion => !!s)
      .slice(0, 6);

    res.json({ suggestions });
  } catch (err) {
    logger.warn(`Не удалось получить подсказки адреса: ${err instanceof Error ? err.message : err}`);
    res.json({ suggestions: [] });
  }
});
