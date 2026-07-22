import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useT } from '@/i18n/useT';
import { loadDeputyRequests, type DeputyRequest } from '@/lib/deputyRequests';
import './FactionRequestsPage.css';

const PER_PAGE = 10;

function materialsLabel(count: number): string {
  const mod100 = count % 100;
  const mod10 = count % 10;
  if (mod100 >= 11 && mod100 <= 14) return 'материалов';
  if (mod10 === 1) return 'материал';
  if (mod10 >= 2 && mod10 <= 4) return 'материала';
  return 'материалов';
}

function paginationItems(page: number, totalPages: number): Array<number | 'ellipsis'> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);

  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages].filter((item) => item > 0 && item <= totalPages).sort((a, b) => a - b);
  const result: Array<number | 'ellipsis'> = [];

  sorted.forEach((item, index) => {
    if (index > 0 && item - sorted[index - 1] > 1) result.push('ellipsis');
    result.push(item);
  });

  return result;
}

function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (page: number) => void }) {
  const pageCount = Math.ceil(total / PER_PAGE);
  const items = useMemo(() => paginationItems(page, pageCount), [page, pageCount]);
  if (pageCount <= 1) return null;

  return (
    <nav className="npr-pagination" aria-label="Страницы депутатских запросов">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page === 1} aria-label="Предыдущая страница">‹</button>
      {items.map((item, index) => item === 'ellipsis' ? (
        <span className="npr-pagination__ellipsis" key={`ellipsis-${index}`}>…</span>
      ) : (
        <button
          type="button"
          key={item}
          onClick={() => onChange(item)}
          className={page === item ? 'is-active' : undefined}
          aria-current={page === item ? 'page' : undefined}
        >
          {item}
        </button>
      ))}
      <button type="button" onClick={() => onChange(page + 1)} disabled={page === pageCount} aria-label="Следующая страница">›</button>
    </nav>
  );
}

function RequestCard({ item }: { item: DeputyRequest }) {
  const t = useT();
  return (
    <Link className="npr-card" to={`/frakciya/zaprosy/${item.slug}`}>
      <div className="npr-card__icon" aria-hidden="true">
        <FileText size={26} color="#db1f26" strokeWidth={1.6} />
      </div>
      <div className="npr-card__content">
        <div className="npr-card__meta">
          <span>{item.date}</span>
          <span className="npr-card__dot" />
          <span className="npr-card__type">{t('factionRequests.badge')}</span>
        </div>
        <h3>{item.title}</h3>
        <p>{item.excerpt}</p>
        <span className="npr-card__link">
          {item.documentUrl ? t('factionRequests.openPdf') : t('factionRequests.readFull')} →
        </span>
      </div>
    </Link>
  );
}

export function FactionRequestsPage() {
  const { language } = useLanguage();
  const t = useT();
  const [page, setPage] = useState(1);
  const [requests, setRequests] = useState<DeputyRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeputyRequests()
      .then(setRequests)
      .finally(() => setLoading(false));
  }, []);

  const start = (page - 1) * PER_PAGE;
  const visible = requests.slice(start, start + PER_PAGE);

  const changePage = (nextPage: number) => {
    setPage(nextPage);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  return (
    <div className="npr-page">
      <section className="npr-hero">
        <div className="npr-hero__label">{t('factionRequests.heroLabel')}</div>
        <h1>{t('factionRequests.titleLead')} <span>{t('factionRequests.titleAccent')}</span></h1>
        <p>{t('factionRequests.description')}</p>
      </section>

      <section className="npr-list-section">
        <div className="npr-list-heading">
          <h2>{t('factionRequests.all')}</h2>
          <span>
            {loading
              ? t('factionRequests.loading')
              : language === 'kz'
                ? t('factionRequests.found', { count: requests.length })
                : <>Найдено: <strong>{requests.length}</strong> {materialsLabel(requests.length)}</>}
          </span>
        </div>

        <div className="npr-list">
          {visible.map((item) => <RequestCard key={item.slug} item={item} />)}
        </div>

        <Pagination page={page} total={requests.length} onChange={changePage} />
      </section>
    </div>
  );
}
