import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, FileText } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useT } from '@/i18n/useT';
import { getDeputyRequest, type DeputyRequest } from '@/lib/deputyRequests';
import './FactionRequestsPage.css';

export function FactionRequestDetailPage() {
  const { slug = '' } = useParams();
  const { language } = useLanguage();
  const t = useT();
  const [request, setRequest] = useState<DeputyRequest | null | undefined>(undefined);

  useEffect(() => {
    setRequest(undefined);
    getDeputyRequest(slug).then((item) => setRequest(item ?? null));
  }, [slug]);

  if (request === undefined) return <div className="npr-detail npr-detail--loading">{t('factionRequests.materialLoading')}</div>;
  if (request === null) return <Navigate to="/frakciya/zaprosy" replace />;

  const localizedSourceUrl = language === 'kz'
    ? request.sourceUrl.replace('/ru/', '/kz/')
    : request.sourceUrl;

  return (
    <article className="npr-detail">
      <div className="npr-detail__inner">
        <Link className="npr-detail__back" to="/frakciya/zaprosy">
          <ArrowLeft size={16} /> {t('factionRequests.back')}
        </Link>

        <header className="npr-detail__header">
          <div className="npr-detail__meta">
            <span>{request.date}</span>
            <span className="npr-card__dot" />
            <span>{t('factionRequests.badge')}</span>
          </div>
          <h1>{request.title}</h1>
        </header>

        {request.documentUrl ? (
          <section className="npr-pdf" aria-label="Документ депутатского запроса">
            <div className="npr-pdf__toolbar">
              <div><FileText size={19} /> {t('factionRequests.pdfOriginal')}</div>
              <a href={request.documentUrl} target="_blank" rel="noopener noreferrer">
                {t('factionRequests.openSeparate')} <ExternalLink size={15} />
              </a>
            </div>
            <iframe src={`${request.documentUrl}#view=FitH`} title={`PDF: ${request.title}`} />
          </section>
        ) : (
          <div className="npr-detail__body">
            {request.content.map((block, index) => <p key={index}>{block}</p>)}
          </div>
        )}

        <footer className="npr-detail__source">
          <span>{t('factionRequests.source')}</span>
          <a href={localizedSourceUrl} target="_blank" rel="noopener noreferrer">
            {t('factionRequests.openOriginal')} <ExternalLink size={14} />
          </a>
        </footer>
      </div>
    </article>
  );
}
