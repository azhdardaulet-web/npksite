import { useState } from 'react';
import { Search } from 'lucide-react';
import { SectionHeader } from '@/components/SectionHeader';
import { candidates, newsItems } from '@/lib/data';

export function SearchPage() {
  const [query, setQuery] = useState('');

  const filteredCandidates = query.length >= 2
    ? candidates.filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || c.region.toLowerCase().includes(query.toLowerCase()))
    : [];

  const filteredNews = query.length >= 2
    ? newsItems.filter(n => n.title.toLowerCase().includes(query.toLowerCase()))
    : [];

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

        {query.length >= 2 && (
          <div className="space-y-6">
            {filteredCandidates.length > 0 && (
              <div>
                <h3 className="text-label font-medium text-steel mb-3 uppercase tracking-wider">Кандидаты</h3>
                <div className="space-y-2">
                  {filteredCandidates.map(c => (
                    <div key={c.id} className="bg-cinder rounded-card p-4 border border-white/[0.08]">
                      <p className="text-body-lg font-bold text-white">{c.name}</p>
                      <p className="text-label text-steel">{c.region} &middot; {c.district}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {filteredNews.length > 0 && (
              <div>
                <h3 className="text-label font-medium text-steel mb-3 uppercase tracking-wider">Новости</h3>
                <div className="space-y-2">
                  {filteredNews.map(n => (
                    <div key={n.id} className="bg-cinder rounded-card p-4 border border-white/[0.08]">
                      <p className="text-body-lg font-bold text-white">{n.title}</p>
                      <p className="text-label text-steel">{n.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {filteredCandidates.length === 0 && filteredNews.length === 0 && (
              <p className="text-body text-fog text-center py-8">Ничего не найдено</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
