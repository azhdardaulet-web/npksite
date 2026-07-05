import { prisma } from '../../lib/prisma';
import * as xlsx from 'xlsx';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

const purchaseItemSchema = z.object({
  number: z.number(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  procurementType: z.string().min(1),
  deliveryPlace: z.string().optional().nullable(),
  unit: z.string().optional().nullable(),
  quantity: z.string().optional().nullable(),
  estimatedAmount: z.number().optional().nullable(),
  year: z.number()
});

export type PurchaseItemInput = z.infer<typeof purchaseItemSchema>;

export const purchaseService = {
  async findAll(filters: { year?: number; type?: string; q?: string; page: number; limit: number }) {
    const { year, type, q, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.PurchaseItemWhereInput = {};
    if (year) where.year = year;
    if (type) where.procurementType = type;
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.purchaseItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { number: 'asc' },
      }),
      prisma.purchaseItem.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async create(data: PurchaseItemInput) {
    return prisma.purchaseItem.create({ data });
  },

  async update(id: string, data: Partial<PurchaseItemInput>) {
    return prisma.purchaseItem.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.purchaseItem.delete({ where: { id } });
  },

  async importFromExcel(buffer: Buffer) {
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Convert to 2D array to map columns A=number, B=name, C=description, D=procurementType, E=deliveryPlace, F=unit, G=quantity, H=estimatedAmount, I=year
    const rows = xlsx.utils.sheet_to_json<any[]>(sheet, { header: 1 });
    
    const valid: PurchaseItemInput[] = [];
    const errors: { row: number; error: string }[] = [];

    // Skip header row if it contains text
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      const [numberRaw, name, description, procurementType, deliveryPlace, unit, quantityRaw, estimatedAmountRaw, yearRaw] = row;

      const number = typeof numberRaw === 'number' ? numberRaw : parseInt(numberRaw as string);
      const estimatedAmount = typeof estimatedAmountRaw === 'number' ? estimatedAmountRaw : parseFloat(estimatedAmountRaw as string);
      const year = typeof yearRaw === 'number' ? yearRaw : parseInt(yearRaw as string);
      const quantity = quantityRaw ? String(quantityRaw) : null;

      try {
        const item = purchaseItemSchema.parse({
          number: isNaN(number) ? undefined : number,
          name: name ? String(name) : '',
          description: description ? String(description) : null,
          procurementType: procurementType ? String(procurementType) : '',
          deliveryPlace: deliveryPlace ? String(deliveryPlace) : null,
          unit: unit ? String(unit) : null,
          quantity: quantity,
          estimatedAmount: isNaN(estimatedAmount) ? null : estimatedAmount,
          year: isNaN(year) ? undefined : year
        });
        valid.push(item);
      } catch (err: any) {
        errors.push({ row: i + 1, error: err.message || 'Invalid data' });
      }
    }

    return { valid, errors };
  },

  async bulkCreate(items: PurchaseItemInput[]) {
    return prisma.$transaction(async (tx) => {
      let count = 0;
      for (const item of items) {
        await tx.purchaseItem.upsert({
          where: { number_year: { number: item.number, year: item.year } },
          update: item,
          create: item,
        });
        count++;
      }
      return count;
    });
  }
};
