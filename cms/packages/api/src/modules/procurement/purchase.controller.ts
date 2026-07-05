import { Router } from 'express';
import multer from 'multer';
import * as xlsx from 'xlsx';
import { purchaseService, PurchaseItemInput } from './purchase.service';
import { authenticateToken, requireRole } from '../../middleware/auth';

// Set up multer for memory storage (for Excel import)
const upload = multer({ storage: multer.memoryStorage() });

export const publicPurchaseRouter = Router();

// GET /api/v1/purchases-plan
publicPurchaseRouter.get('/', async (req, res, next) => {
  try {
    const { year, type, q, page, limit } = req.query;
    const result = await purchaseService.findAll({
      year: year ? parseInt(year as string) : undefined,
      type: type as string,
      q: q as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export const procurementRouter = Router();

// Middleware to restrict access
procurementRouter.use(authenticateToken, requireRole('PROCUREMENT_MANAGER', 'ADMIN'));

// GET /cms/api/v1/purchases
procurementRouter.get('/', async (req, res, next) => {
  try {
    const { year, type, q, page, limit } = req.query;
    const result = await purchaseService.findAll({
      year: year ? parseInt(year as string) : undefined,
      type: type as string,
      q: q as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /cms/api/v1/purchases
procurementRouter.post('/', async (req, res, next) => {
  try {
    const item = await purchaseService.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

// PUT /cms/api/v1/purchases/:id
procurementRouter.put('/:id', async (req, res, next) => {
  try {
    const item = await purchaseService.update(req.params.id, req.body);
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// DELETE /cms/api/v1/purchases/:id
procurementRouter.delete('/:id', async (req, res, next) => {
  try {
    await purchaseService.delete(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// POST /cms/api/v1/purchases/import
procurementRouter.post('/import', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }
    const result = await purchaseService.importFromExcel(req.file.buffer);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /cms/api/v1/purchases/import/confirm
procurementRouter.post('/import/confirm', async (req, res, next) => {
  try {
    const items: PurchaseItemInput[] = req.body.items;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid data format, expected array' });
    }
    const count = await purchaseService.bulkCreate(items);
    res.json({ message: `Successfully imported ${count} items`, count });
  } catch (err) {
    next(err);
  }
});

// GET /cms/api/v1/purchases/export
procurementRouter.get('/export', async (req, res, next) => {
  try {
    const { year, type, q } = req.query;
    // Get all matching items without pagination
    const result = await purchaseService.findAll({
      year: year ? parseInt(year as string) : undefined,
      type: type as string,
      q: q as string,
      page: 1,
      limit: 1000000,
    });

    const rows = result.data.map(item => ({
      'Номер лота': item.number,
      'Наименование': item.name,
      'Описание': item.description,
      'Способ закупки': item.procurementType,
      'Место поставки': item.deliveryPlace,
      'Единица измерения': item.unit,
      'Количество': item.quantity,
      'Сумма': item.estimatedAmount,
      'Год': item.year,
    }));

    const worksheet = xlsx.utils.json_to_sheet(rows);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Purchases');

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="purchases.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    next(err);
  }
});
