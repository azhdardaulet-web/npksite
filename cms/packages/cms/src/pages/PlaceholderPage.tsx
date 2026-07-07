import { Construction } from 'lucide-react';

// Раздел упомянут в структуре сайдбара, но контент-модель под него ещё не
// спроектирована (нет ни таблицы в БД, ни страницы на сайте) — честная
// заглушка вместо выдумывания функциональности.
export default function PlaceholderPage({ title, note }: { title: string; note?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 bg-white rounded-xl border border-brand-silver/50">
      <Construction size={40} className="text-brand-silver mb-4" />
      <h1 className="text-lg font-semibold text-brand-dark">{title}</h1>
      <p className="text-sm text-brand-gray mt-2 max-w-md">
        {note ?? 'Раздел в разработке — модель данных и страница на сайте ещё не спроектированы.'}
      </p>
    </div>
  );
}
