import { useState } from 'react';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';

interface Category {
  id: string;
  nameRu: string;
  nameKz: string;
  slug: string;
  count: number;
}

const MOCK: Category[] = [];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(MOCK);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ nameRu: '', nameKz: '', slug: '' });

  function openCreate() {
    setEditing(null);
    setForm({ nameRu: '', nameKz: '', slug: '' });
    setModal(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setForm({ nameRu: cat.nameRu, nameKz: cat.nameKz, slug: cat.slug });
    setModal(true);
  }

  function handleSave() {
    if (!form.nameRu || !form.slug) return;
    if (editing) {
      setCategories(prev => prev.map(c => c.id === editing.id ? { ...c, ...form } : c));
    } else {
      setCategories(prev => [...prev, { id: Date.now().toString(), ...form, count: 0 }]);
    }
    setModal(false);
  }

  function handleDelete(id: string) {
    if (window.confirm('Удалить категорию?')) {
      setCategories(prev => prev.filter(c => c.id !== id));
    }
  }

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Категории новостей</h1>
          <p className="text-brand-gray text-sm mt-0.5">Управление категориями публикаций</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-brand-red text-white text-sm rounded-lg hover:bg-brand-red/90"
        >
          <Plus size={16} /> Добавить категорию
        </button>
      </div>

      <div className="bg-white rounded-xl border border-brand-silver/50 shadow-sm overflow-hidden">
        {categories.length === 0 ? (
          <div className="text-center py-16">
            <Tag size={40} className="mx-auto mb-3 text-brand-silver" />
            <p className="text-brand-dark font-medium">Категорий пока нет</p>
            <p className="text-brand-gray text-sm mt-1">Создайте первую категорию для группировки новостей</p>
            <button
              onClick={openCreate}
              className="mt-4 px-4 py-2 bg-brand-red text-white text-sm rounded-lg hover:bg-brand-red/90"
            >
              Создать категорию
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-silver/40 bg-brand-cream/50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-brand-gray uppercase tracking-wide">Название (RU)</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-brand-gray uppercase tracking-wide">Название (KZ)</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-brand-gray uppercase tracking-wide">Slug</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-brand-gray uppercase tracking-wide">Материалов</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id} className="border-b border-brand-silver/30 hover:bg-brand-cream/30 transition-colors">
                  <td className="px-5 py-3 font-medium text-brand-dark text-sm">{cat.nameRu}</td>
                  <td className="px-5 py-3 text-brand-gray text-sm">{cat.nameKz}</td>
                  <td className="px-5 py-3">
                    <code className="text-xs bg-brand-cream px-2 py-1 rounded text-brand-gray">{cat.slug}</code>
                  </td>
                  <td className="px-5 py-3 text-brand-gray text-sm">{cat.count}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(cat)} className="p-1.5 text-brand-gray hover:text-brand-dark hover:bg-brand-cream rounded">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-brand-gray hover:text-brand-red hover:bg-red-50 rounded">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-brand-silver/40 flex items-center justify-between">
              <h2 className="font-semibold text-brand-dark">{editing ? 'Редактировать' : 'Новая категория'}</h2>
              <button onClick={() => setModal(false)} className="text-brand-gray hover:text-brand-dark text-xl leading-none">×</button>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-1">Название (рус) <span className="text-brand-red">*</span></label>
                <input
                  value={form.nameRu}
                  onChange={e => {
                    const v = e.target.value;
                    setForm(p => ({ ...p, nameRu: v, slug: p.slug || autoSlug(v) }));
                  }}
                  className="w-full border border-brand-silver rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-red"
                  placeholder="Корпоративные новости"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-1">Атауы (қаз)</label>
                <input
                  value={form.nameKz}
                  onChange={e => setForm(p => ({ ...p, nameKz: e.target.value }))}
                  className="w-full border border-brand-silver rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-red"
                  placeholder="Корпоративтік жаңалықтар"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-1">Slug <span className="text-brand-red">*</span></label>
                <input
                  value={form.slug}
                  onChange={e => setForm(p => ({ ...p, slug: autoSlug(e.target.value) }))}
                  className="w-full border border-brand-silver rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-red"
                  placeholder="corporate-news"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-brand-silver/40 flex justify-end gap-3">
              <button onClick={() => setModal(false)} className="px-4 py-2 text-sm text-brand-gray hover:text-brand-dark">Отмена</button>
              <button onClick={handleSave} className="px-4 py-2 text-sm bg-brand-red text-white rounded-lg hover:bg-brand-red/90">Сохранить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
