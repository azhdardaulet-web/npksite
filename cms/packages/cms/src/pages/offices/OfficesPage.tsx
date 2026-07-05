import { useState } from 'react';
import { Plus, Trash2, Pencil, Building2, Phone, Mail, MapPin, Clock, User } from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────

type Group = 'headquarters' | 'branch' | 'regional' | 'site';

const GROUP_LABELS: Record<Group, string> = {
  headquarters: 'Центральный офис компании',
  branch: 'Филиал',
  regional: 'Региональные подразделения',
  site: 'Региональные участки',
};

const GROUP_ORDER: Group[] = ['headquarters', 'branch', 'regional', 'site'];

interface ContactPerson {
  id: string;
  group: Group;
  personName: string;
  personRole: string;
  personPhoto: string;
  office: string;
  phone: string;
  email: string;
  hours: string;
  sortOrder: number;
}

// ─── Static seed data ─────────────────────────────────────────────────────────

const SEED: ContactPerson[] = [
  {
    id: 'hq1', group: 'headquarters', sortOrder: 0,
    personName: 'ДЮСЕНОВ РИНАТ ТАСБУЛАТОВИЧ',
    personRole: 'Генеральный директор ТОО «DAR RAIL»',
    personPhoto: '',
    office: 'Республика Казахстан, г. Астана, проспект Ракимжан Кошкарбаева, 1/5, 6-этаж',
    phone: '+7 7172 39 99 88 (вн.510)',
    email: 'info@darrail.com',
    hours: '09:00 – 18:00',
  },
  {
    id: 'br1', group: 'branch', sortOrder: 0,
    personName: 'СМИРНОВА ЛАРИСА ИОСИФОВНА',
    personRole: 'Директор Филиала',
    personPhoto: '',
    office: 'Республика Казахстан, г. Алматы, проспект Достык, 291/23, 2-этаж',
    phone: '+7 7172 39 99 88',
    email: 'info-almaty@darrail.com',
    hours: '09:00 – 18:00',
  },
  {
    id: 'rp1', group: 'regional', sortOrder: 0,
    personName: 'ЕРМОЛЬЧЕВ АЛЕКСАНДР АЛЕКСАНДРОВИЧ',
    personRole: 'Директор регионального подразделения на ст. Тобол',
    personPhoto: '',
    office: 'Республика Казахстан, пос. Тобол, улица Станционная, 1, 1-этаж',
    phone: '+7 714 64 00 26 (вн.5101)',
    email: 'Info-tobol@darrail.com',
    hours: '09:00 – 18:00',
  },
  {
    id: 'rp2', group: 'regional', sortOrder: 1,
    personName: 'БАЙЫМБЕТОВ АРМАН САНАТАРОВИЧ',
    personRole: 'Директор регионального подразделения на ст. Павлодар',
    personPhoto: '',
    office: 'Республика Казахстан, г. Павлодар, улица Путейская, 2, 3 этаж',
    phone: '+7 7182 37 22 84 (вн.521)',
    email: 'Info-ekibastuz@darrail.com',
    hours: '09:00 – 18:00',
  },
  {
    id: 'rp3', group: 'regional', sortOrder: 2,
    personName: 'АСКАРОВ МАРАТ САБЫРОВИЧ',
    personRole: 'Директор регионального подразделения на ст. Нур-Султан',
    personPhoto: '',
    office: 'Республика Казахстан, г. Астана, улица Шынтас, 8, 3-этаж',
    phone: '+7 7172 93 43 53 (вн.570)',
    email: 'info@darrail.com',
    hours: '09:00 – 18:00',
  },
  {
    id: 'rs1', group: 'site', sortOrder: 0,
    personName: 'БЕКЕНОВ БЕСТЫБАЙ КАРАТАЕВИЧ',
    personRole: 'Начальник участка на ст. Екибастуз',
    personPhoto: '',
    office: 'Республика Казахстан, г. Екибастуз, улица Астана, 31, 3-этаж',
    phone: '+7 7187 22 72 35 (вн.520)',
    email: 'Info-ekibastuz@darrail.com',
    hours: '09:00 – 18:00',
  },
];

// ─── Modal ────────────────────────────────────────────────────────────────────

type FormState = Omit<ContactPerson, 'id' | 'sortOrder'>;

const EMPTY_FORM: FormState = {
  group: 'regional',
  personName: '',
  personRole: '',
  personPhoto: '',
  office: '',
  phone: '',
  email: '',
  hours: '09:00 – 18:00',
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  const cls =
    'w-full border border-[#DFDFDF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D64338] transition-colors bg-[#F9F8F6] text-[#383233]';
  return (
    <div>
      <label className="block text-xs font-bold text-[#383233] uppercase tracking-wide mb-1.5">
        {label} {required && <span className="text-[#D64338]">*</span>}
      </label>
      {textarea ? (
        <textarea
          rows={2}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls + ' resize-none'}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </div>
  );
}

function PersonModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: ContactPerson;
  onSave: (data: FormState) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormState>(
    initial
      ? { group: initial.group, personName: initial.personName, personRole: initial.personRole,
          personPhoto: initial.personPhoto, office: initial.office, phone: initial.phone,
          email: initial.email, hours: initial.hours }
      : { ...EMPTY_FORM }
  );

  const set = (key: keyof FormState, val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const isValid = form.personName && form.personRole && form.office && form.phone && form.email;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-[#DFDFDF] flex items-center justify-between sticky top-0 bg-white rounded-t-2xl">
          <h2 className="font-bold text-[#383233]">
            {initial ? 'Редактировать контакт' : 'Добавить контакт'}
          </h2>
          <button onClick={onClose} className="text-[#89837E] hover:text-[#383233] text-xl leading-none">×</button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Group */}
          <div>
            <label className="block text-xs font-bold text-[#383233] uppercase tracking-wide mb-1.5">
              Группа <span className="text-[#D64338]">*</span>
            </label>
            <select
              value={form.group}
              onChange={e => set('group', e.target.value)}
              className="w-full border border-[#DFDFDF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D64338] bg-[#F9F8F6] text-[#383233]"
            >
              {GROUP_ORDER.map(g => (
                <option key={g} value={g}>{GROUP_LABELS[g]}</option>
              ))}
            </select>
          </div>

          <Field label="ФИО" value={form.personName} onChange={v => set('personName', v)}
            placeholder="ИВАНОВ ИВАН ИВАНОВИЧ" required />
          <Field label="Должность" value={form.personRole} onChange={v => set('personRole', v)}
            placeholder="Генеральный директор" required />

          {/* Photo */}
          <div>
            <label className="block text-xs font-bold text-[#383233] uppercase tracking-wide mb-1.5">Фото (путь или URL)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.personPhoto}
                onChange={e => set('personPhoto', e.target.value)}
                placeholder="/images/team/name.jpg"
                className="flex-1 border border-[#DFDFDF] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D64338] bg-[#F9F8F6] text-[#383233] font-mono"
              />
              <button className="px-3 py-2 bg-[#F2EBE3] text-[#383233] rounded-lg text-xs font-medium hover:bg-[#DFDFDF] whitespace-nowrap">
                Выбрать
              </button>
            </div>
          </div>

          <Field label="Адрес офиса" value={form.office} onChange={v => set('office', v)}
            placeholder="г. Астана, пр. Кошкарбаева, 1/5, 6-этаж" required textarea />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Телефон" value={form.phone} onChange={v => set('phone', v)}
              placeholder="+7 7172 39 99 88 (вн.510)" required />
            <Field label="Email" value={form.email} onChange={v => set('email', v)}
              placeholder="info@darrail.com" required />
          </div>
          <Field label="График работы" value={form.hours} onChange={v => set('hours', v)}
            placeholder="09:00 – 18:00" />
        </div>

        <div className="px-6 py-4 border-t border-[#DFDFDF] flex justify-end gap-3 sticky bottom-0 bg-white rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 text-sm text-[#89837E] hover:text-[#383233]">
            Отмена
          </button>
          <button
            disabled={!isValid}
            onClick={() => onSave(form)}
            className="px-5 py-2 text-sm bg-[#D64338] text-white rounded-lg hover:bg-[#b8362d] disabled:opacity-40 font-medium"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Person card in list ──────────────────────────────────────────────────────

function PersonRow({
  person,
  onEdit,
  onDelete,
}: {
  person: ContactPerson;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white border border-[#DFDFDF] rounded-xl px-5 py-4 flex gap-4 group hover:border-[#D64338]/30 transition-colors">
      {/* Photo */}
      <div className="w-16 h-20 rounded-lg overflow-hidden bg-[#F2EBE3] flex items-center justify-center shrink-0">
        {person.personPhoto ? (
          <img src={person.personPhoto} alt={person.personName} className="w-full h-full object-cover object-top" />
        ) : (
          <User className="w-7 h-7 text-[#89837E]" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[#383233] text-sm leading-tight">{person.personName}</p>
        <p className="text-[#D64338] text-xs mt-0.5 mb-3">{person.personRole}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-xs text-[#383233]/60">
          <span className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3 h-3 shrink-0 text-[#D64338]" />{person.office}
          </span>
          <span className="flex items-center gap-1.5">
            <Phone className="w-3 h-3 shrink-0 text-[#D64338]" />{person.phone}
          </span>
          <span className="flex items-center gap-1.5">
            <Mail className="w-3 h-3 shrink-0 text-[#D64338]" />{person.email}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 shrink-0 text-[#D64338]" />{person.hours}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={onEdit}
          className="p-2 rounded-lg hover:bg-[#F2EBE3] text-[#89837E] hover:text-[#383233] transition-colors"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-lg hover:bg-red-50 text-[#89837E] hover:text-[#D64338] transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function OfficesPage() {
  const [contacts, setContacts] = useState<ContactPerson[]>(SEED);
  const [modal, setModal] = useState<{ open: boolean; editing?: ContactPerson }>({ open: false });

  const handleSave = (data: FormState) => {
    if (modal.editing) {
      setContacts(prev =>
        prev.map(c => c.id === modal.editing!.id ? { ...modal.editing!, ...data } : c)
      );
    } else {
      const newPerson: ContactPerson = {
        id: `c_${Date.now()}`,
        sortOrder: contacts.filter(c => c.group === data.group).length,
        ...data,
      };
      setContacts(prev => [...prev, newPerson]);
    }
    setModal({ open: false });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Удалить контакт?')) {
      setContacts(prev => prev.filter(c => c.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6]">
      {/* Top bar */}
      <div className="bg-white border-b border-[#DFDFDF] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="font-bold text-[#383233] text-lg">Офисы и контакты</h1>
          <p className="text-[#89837E] text-sm mt-0.5">Руководство и подразделения компании</p>
        </div>
        <button
          onClick={() => setModal({ open: true })}
          className="flex items-center gap-2 px-4 py-2 bg-[#D64338] text-white text-sm rounded-lg hover:bg-[#b8362d] font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Добавить контакт
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {contacts.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-[#DFDFDF]" />
            <p className="text-[#89837E]">Контакты не добавлены</p>
          </div>
        ) : (
          GROUP_ORDER.map(group => {
            const groupContacts = contacts.filter(c => c.group === group);
            if (groupContacts.length === 0) return null;
            return (
              <div key={group}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-6 h-0.5 bg-[#D64338]" />
                  <h2 className="font-bold text-[#383233] text-sm uppercase tracking-wide">
                    {GROUP_LABELS[group]}
                  </h2>
                  <span className="text-xs text-[#89837E] bg-[#F2EBE3] px-2 py-0.5 rounded-full">
                    {groupContacts.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {groupContacts.map(person => (
                    <PersonRow
                      key={person.id}
                      person={person}
                      onEdit={() => setModal({ open: true, editing: person })}
                      onDelete={() => handleDelete(person.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {modal.open && (
        <PersonModal
          initial={modal.editing}
          onSave={handleSave}
          onClose={() => setModal({ open: false })}
        />
      )}
    </div>
  );
}
