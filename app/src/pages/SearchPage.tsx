import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { SectionHeader } from '@/components/SectionHeader';
import { fetchNews, fetchCandidates, type PublicNewsItem, type PublicCandidate } from '@/lib/api';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [news, setNews] = useState<PublicNewsItem[]>([]);
  const [candidates, setCandidates] = useState<PublicCandidate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (debounced.length < 2) {
      setNews([]);
      setCandidates([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.allSettled([
      fetchNews({ q: debounced, limit: 10 }),
      fetchCandidates(),
    ]).then(([newsRes, candidatesRes]) => {
      if (cancelled) return;
      setNews(newsRes.status === 'fulfilled' ? newsRes.value.data : []);
      const kw = debounced.toLowerCase();
      setCandidates(
        candidatesRes.status === 'fulfilled'
          ? candidatesRes.value.filter((c) => c.name.toLowerCase().includes(kw) || c.region.toLowerCase().includes(kw))
          : []
      );
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [debounced]);

  const hasQuery = debounced.length >= 2;
  const hasResults = candidates.length > 0 || news.length > 0;

  return (
    <div className="pt-[104px] pb-16">
      <div className="max-w-[800px] mx-auto px-4 md:px-10">
        <SectionHeader light="Поиск по" bold="сайту" centered />

        <div className="relative mb-8">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-steel" />
          <input
            type="text"
            placeholder="Введите запрос..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-cinder border border-white/10 rounded-card pl-12 pr-4 py-4 text-body-lg text-white placeholder:text-steel focus:border-red focus:shadow-focus outline-none transition-all"
          />
        </div>

        {hasQuery && (
          <div className="space-y-6">
            {loading && <p className="text-body text-fog text-center py-8">Поиск...</p>}
            {!loading && candidates.length > 0 && (
              <div>
                <h3 className="text-label font-medium text-steel mb-3 uppercase tracking-wider">Кандидаты</h3>
                <div className="space-y-2">
                  {candidates.map(c => (
                    <div key={c.id} className="bg-cinder rounded-card p-4 border border-white/[0.08]">
                      <p className="text-body-lg font-bold text-white">{c.name}</p>
                      <p className="text-label text-steel">{c.region}{c.district ? ` · ${c.district}` : ''}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!loading && news.length > 0 && (
              <div>
                <h3 className="text-label font-medium text-steel mb-3 uppercase tracking-wider">Новости</h3>
                <div className="space-y-2">
                  {news.map(n => (
                    <Link key={n.id} to={`/novosti/${n.slug}`} className="block bg-cinder rounded-card p-4 border border-white/[0.08] hover:border-white/20 transition-colors">
                      <p className="text-body-lg font-bold text-white">{n.title}</p>
                      <p className="text-label text-steel">{n.publishedAt ? new Date(n.publishedAt).toLocaleDateString('ru-RU') : ''}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {!loading && !hasResults && (
              <p className="text-body text-fog text-center py-8">Ничего не найдено</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
