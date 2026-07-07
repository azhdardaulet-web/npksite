import JSZip from 'jszip';
import type { NewsFormat } from '@/hooks/useNews';

// Общая логика разбора .docx для импорта новостей — используется и в полном
// групповом импортере (WordImporter.tsx), и в компактной панели импорта
// прямо на экране создания статьи (NewsEditor.tsx).

export interface LangData {
  title: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  slug: string;
}

export interface ParsedArticle {
  orderNum: number;
  ru: LangData;
  kz: LangData;
  publishedAt: string;
  selected: boolean;
  format: NewsFormat;
  imageUrl: string;
}

export async function extractTextFromDocx(file: File): Promise<string[]> {
  const zip = new JSZip();
  const loaded = await zip.loadAsync(file);
  const docXml = await loaded.file('word/document.xml')!.async('string');

  const parser = new DOMParser();
  const doc = parser.parseFromString(docXml, 'application/xml');

  const paragraphs: string[] = [];
  const pNodes = doc.getElementsByTagNameNS('*', 'p');

  for (let i = 0; i < pNodes.length; i++) {
    const tNodes = pNodes[i].getElementsByTagNameNS('*', 't');
    let line = '';
    for (let j = 0; j < tNodes.length; j++) {
      line += tNodes[j].textContent ?? '';
    }
    const trimmed = line.trim();
    if (trimmed) paragraphs.push(trimmed);
  }

  return paragraphs;
}

// Label-only markers (value on the next line)
const LABEL_MARKERS: [RegExp, 'slug' | 'seoTitle' | 'seoDescription' | 'skip'][] = [
  [/^URL:\s*$/, 'slug'],
  [/^SEO Заголовок:\s*$/, 'seoTitle'],
  [/^Meta Описание:\s*$/, 'seoDescription'],
  [/^Meta Сипаттама:\s*$/, 'seoDescription'],
  [/^Meta Description:\s*$/, 'seoDescription'],
  [/^Порядковый номер:\s*$/, 'skip'],
  [/^Meta Ключевые слова:\s*$/, 'skip'],
  [/^Meta Кілт сөздер:\s*$/, 'skip'],
  [/^Meta Keywords:\s*$/, 'skip'],
];

// Inline label+value (value on same line after colon)
const INLINE_MARKERS: [RegExp, 'slug' | 'seoTitle' | 'seoDescription'][] = [
  [/^URL:\s+(.+)/, 'slug'],
  [/^SEO Заголовок:\s+(.+)/, 'seoTitle'],
  [/^Meta Описание:\s+(.+)/i, 'seoDescription'],
  [/^Meta Сипаттама:\s+(.+)/i, 'seoDescription'],
  [/^Meta Description:\s+(.+)/i, 'seoDescription'],
];

// Lines that are purely metadata and should never appear in body
const META_LINE = /^(URL|SEO Заголовок|Meta Описание|Meta Сипаттама|Meta Description|Порядковый номер|Meta Ключевые|Meta Кілт|Meta Keywords)/i;

export function parseLangSection(lines: string[]): LangData {
  let title = '';
  let slug = '';
  let seoTitle = '';
  let seoDescription = '';
  const bodyLines: string[] = [];
  let titleSet = false;

  type NextField = 'slug' | 'seoTitle' | 'seoDescription' | 'skip' | null;
  let nextField: NextField = null;

  for (const line of lines) {
    if (nextField !== null) {
      if (nextField === 'slug') slug = line;
      else if (nextField === 'seoTitle') seoTitle = line;
      else if (nextField === 'seoDescription') seoDescription = line;
      nextField = null;
      continue;
    }

    let foundLabel = false;
    for (const [regex, field] of LABEL_MARKERS) {
      if (regex.test(line)) { nextField = field; foundLabel = true; break; }
    }
    if (foundLabel) continue;

    let foundInline = false;
    for (const [regex, field] of INLINE_MARKERS) {
      const m = line.match(regex);
      if (m) {
        if (field === 'slug') slug = m[1].trim();
        else if (field === 'seoTitle') seoTitle = m[1].trim();
        else if (field === 'seoDescription') seoDescription = m[1].trim();
        foundInline = true;
        break;
      }
    }
    if (foundInline) continue;

    if (META_LINE.test(line)) continue;

    if (!titleSet) {
      title = line;
      titleSet = true;
    } else {
      bodyLines.push(line);
    }
  }

  const content = bodyLines.join('\n\n');
  return { title, content, seoTitle, seoDescription, slug };
}

export function parseArticles(lines: string[]): ParsedArticle[] {
  const SEPARATOR = /^─{10,}$/;
  const articles: ParsedArticle[] = [];

  const sections: string[][] = [];
  let current: string[] = [];
  for (const line of lines) {
    if (SEPARATOR.test(line)) {
      if (current.length) { sections.push(current); current = []; }
    } else {
      current.push(line);
    }
  }
  if (current.length) sections.push(current);

  for (const section of sections) {
    const articleLine = section.find((l) => /^Статья\s*#\d+/.test(l));
    const orderNum = articleLine ? parseInt(articleLine.match(/(\d+)/)?.[1] ?? '0') : 1;

    const ruIdx = section.findIndex((l) => /🇷🇺|РУССКИЙ/.test(l));
    const kzIdx = section.findIndex((l) => /🇰🇿|ҚАЗАҚША|КАЗАХСКИЙ/.test(l));

    let ruLines: string[] = [];
    let kzLines: string[] = [];

    if (ruIdx >= 0 && kzIdx > ruIdx) {
      ruLines = section.slice(ruIdx + 1, kzIdx);
      kzLines = section.slice(kzIdx + 1);
    } else if (ruIdx >= 0) {
      ruLines = section.slice(ruIdx + 1);
    } else if (kzIdx >= 0) {
      kzLines = section.slice(kzIdx + 1);
    } else {
      // Нет языковых меток вовсе — считаем весь раздел русским текстом
      // (упрощённый формат одиночной статьи для компактного импорта).
      ruLines = section;
    }

    const ru = parseLangSection(ruLines);
    const kz = parseLangSection(kzLines);

    if (!ru.title && !kz.title) continue;

    articles.push({
      orderNum: orderNum || 1,
      ru,
      kz,
      publishedAt: '',
      selected: true,
      format: 'article',
      imageUrl: '',
    });
  }

  articles.sort((a, b) => a.orderNum - b.orderNum);
  return articles;
}
