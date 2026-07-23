import { useState, useEffect, useRef } from 'react';
import { FileText, Video, CheckCircle, Hash, ArrowRight, MessageCircle, MapPin, Phone, Mail, Navigation, Paperclip, Download, X, ChevronDown } from 'lucide-react';
import { ScrollReveal } from '@/components/ScrollReveal';
import { CountUp } from '@/components/CountUp';
import { PrimaryButton } from '@/components/PrimaryButton';
import { testimonials as fallbackTestimonials } from '@/lib/data';
import {
  fetchAppealTopics, fetchTestimonials, submitAppeal, ApiError,
  fetchAppealsResolvedCount, fetchSettings, fetchBranches, fetchDocuments, uploadAppealAttachment,
  type AppealTopic, type PublicTestimonial, type PublicBranch, type PublicDocument, type AppealAttachment,
} from '@/lib/api';
import { usePageBlocks } from '@/hooks/usePageBlocks';
import { useLanguage } from '@/i18n/LanguageContext';

// Полная секция «Общественная приёмная» — используется и как отдельная страница
// (ReceptionPage, /priemnaya), и как секция на главной (ReceptionSection),
// чтобы вид не отличался от макета. Источник данных общий — Page(slug=priemnaya).

const FALLBACK_TOPICS = ['Общий вопрос', 'Социальная помощь', 'ЖКХ и инфраструктура', 'Образование', 'Медицина', 'Труд и занятость', 'Другое'];
const FALLBACK_TESTIMONIALS: PublicTestimonial[] = fallbackTestimonials.map((t) => ({ id: String(t.id), quote: t.quote, author: t.author }));
const FALLBACK_SAMPLES: PublicDocument[] = [
  {
    id: 'appeal-sample-ru',
    type: 'appeal_sample',
    title: 'Образец письменного обращения',
    description: null,
    fileName: 'obrazec-obrashcheniya.docx',
    fileUrl: '/documents/obrazec-obrashcheniya.docx',
    fileSize: 0,
    year: null,
    publishedAt: null,
  },
  {
    id: 'appeal-sample-kz',
    type: 'appeal_sample',
    title: 'Жазбаша өтініш үлгісі',
    description: null,
    fileName: 'otinish-ulgisi.docx',
    fileUrl: '/documents/otinish-ulgisi.docx',
    fileSize: 0,
    year: null,
    publishedAt: null,
  },
];
const KZ_PHONE_RE = /^\+7\s?7\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/;

const WA_TEMPLATES = [
  { label: 'Хочу вступить в партию', text: 'Здравствуйте, хочу вступить в Народную партию Казахстана. Подскажите, как это сделать.' },
  { label: 'Нужна юридическая помощь', text: 'Здравствуйте, мне нужна юридическая помощь. Прошу проконсультировать.' },
  { label: 'Сообщить о проблеме', text: 'Здравствуйте, хочу сообщить о проблеме в нашем районе.' },
  { label: 'Предложить инициативу', text: 'Здравствуйте, у меня есть инициатива, которую хотел бы предложить партии.' },
];

const STEP_ICONS = [FileText, Hash, Video, CheckCircle];

const FALLBACK_STEPS = [
  { titleRu: 'Шаг 1', textRu: 'Заполните форму' },
  { titleRu: 'Шаг 2', textRu: 'Обращение регистрируется, вы получаете номер' },
  { titleRu: 'Шаг 3', textRu: 'Ответ или назначение видеоприёма' },
  { titleRu: 'Шаг 4', textRu: 'Решение вопроса' },
];

interface ReceptionHeaderBlock {
  headingRu?: string;
  subtitleRu?: string;
  whatsappNumber?: string;
  whatsappNoteRu?: string;
  counterLabelRu?: string;
  stat2LabelRu?: string;
  stat3LabelRu?: string;
  mockupImageUrl?: string;
  mockupCaptionRu?: string;
}

interface ReceptionStepsBlock {
  items?: { titleRu: string; textRu: string }[];
}

export function ReceptionFull() {
  const { language } = useLanguage();
  const isKz = language === 'kz';
  const { getBlock } = usePageBlocks('priemnaya');
  const cms = getBlock<ReceptionHeaderBlock>('reception_header');
  const stepsItems = getBlock<ReceptionStepsBlock>('reception_steps')?.items;
  const steps = stepsItems?.length ? stepsItems : FALLBACK_STEPS;
  const HOW_STEPS = steps.map((s, i) => ({ icon: STEP_ICONS[i % STEP_ICONS.length], step: s.titleRu, label: s.textRu }));

  const heading   = cms?.headingRu?.trim()  || 'Общественная приёмная';
  const subtitle  = cms?.subtitleRu?.trim() || 'Направьте обращение в Народную партию Казахстана — письменно или на видеоприёме';
  const waNumber  = '+77002202020';
  const waNote    = cms?.whatsappNoteRu?.trim() || 'ответ обычно в течение дня';
  const waHref    = `https://wa.me/${waNumber.replace(/[^\d]/g, '')}`;
  const stat1Lab  = cms?.counterLabelRu?.trim()  || 'обращений решено';
  const stat2Lab  = cms?.stat2LabelRu?.trim() || 'средний срок ответа';
  const stat3Lab  = cms?.stat3LabelRu?.trim() || 'филиалов принимают';
  const rawMockupCap = cms?.mockupCaptionRu?.trim();
  const mockupCap = isKz && (!rawMockupCap || rawMockupCap.startsWith('Ссылка на видеовстречу'))
    ? 'Бейнеқабылдау уақыты келісілгеннен кейін кездесу сілтемесі электрондық пошта мен SMS арқылы жіберіледі.'
    : (rawMockupCap || 'Ссылка на видеовстречу придёт на почту и по SMS после согласования времени.');

  // Статистика: «обращений решено» — из БД (кэш на бэкенде 1 час), остальные
  // два значения и кадр видеоприёма — из site_settings (CMS → Настройки).
  const [resolvedCount, setResolvedCount] = useState<number | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  useEffect(() => { fetchAppealsResolvedCount().then(d => setResolvedCount(d.count)).catch(() => {}); }, []);
  useEffect(() => { fetchSettings().then(setSettings).catch(() => {}); }, []);
  const stat1Val = resolvedCount ?? 847;
  const rawResponseTime = settings.reception_avg_response_time?.trim();
  const stat2Val = isKz
    ? (rawResponseTime === '5 дней' || !rawResponseTime ? '5 күн' : rawResponseTime)
    : (rawResponseTime || '5 дней');
  const stat3Val = settings.reception_branches_accepting?.trim() || '20';
  const mockupSrc = settings.video_preview_image?.trim() || cms?.mockupImageUrl?.trim() || '/images/reception-mockup.png';

  // Form state
  const [mode, setMode] = useState<'letter' | 'video'>('letter');
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', topic: '', message: '', consent: false });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appealNumber, setAppealNumber] = useState<string | null>(null);
  const [topics, setTopics] = useState<AppealTopic[]>([]);
  const [testimonials, setTestimonials] = useState<PublicTestimonial[]>(FALLBACK_TESTIMONIALS);

  // Выбор филиала — по умолчанию Астана, карточка обновляется при выборе города
  const [branches, setBranches] = useState<PublicBranch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  useEffect(() => {
    fetchBranches().then(list => {
      setBranches(list);
      setSelectedBranchId(prev => prev || list.find(b => b.cityRu === 'Астана')?.id || list[0]?.id || '');
    }).catch(() => {});
  }, []);
  const selectedBranch = branches.find(b => b.id === selectedBranchId);
  const routeHref = selectedBranch
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedBranch.addressRu)}`
    : '#';
  const mapEmbedSrc = selectedBranch
    ? `https://www.google.com/maps?q=${encodeURIComponent(selectedBranch.addressRu)}&output=embed`
    : '';

  // Заявление + доп. документы к письменному обращению, образцы обращения
  const fallbackSamples = FALLBACK_SAMPLES.filter((sample) => sample.id.endsWith(language));
  const [samples, setSamples] = useState<PublicDocument[]>(fallbackSamples);
  useEffect(() => {
    fetchDocuments('appeal_sample', language)
      .then((documents) => setSamples(documents.length ? documents : fallbackSamples))
      .catch(() => setSamples(fallbackSamples));
  }, [language]);

  const [statementFile, setStatementFile] = useState<{ url: string; fileName: string; fileSize: number } | null>(null);
  const [statementUploading, setStatementUploading] = useState(false);
  const [additionalFiles, setAdditionalFiles] = useState<{ url: string; fileName: string; fileSize: number }[]>([]);
  const [additionalUploading, setAdditionalUploading] = useState(false);
  const [attachError, setAttachError] = useState<string | null>(null);

  const handleStatementSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setAttachError(null);
    setStatementUploading(true);
    try {
      setStatementFile(await uploadAppealAttachment(file));
    } catch (err) {
      setAttachError(err instanceof ApiError ? err.message : 'Не удалось загрузить файл');
    } finally {
      setStatementUploading(false);
    }
  };

  const handleAdditionalSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 3 - additionalFiles.length);
    e.target.value = '';
    if (files.length === 0) return;
    setAttachError(null);
    setAdditionalUploading(true);
    try {
      const uploaded = await Promise.all(files.map(f => uploadAppealAttachment(f)));
      setAdditionalFiles(prev => [...prev, ...uploaded].slice(0, 3));
    } catch (err) {
      setAttachError(err instanceof ApiError ? err.message : 'Не удалось загрузить файл');
    } finally {
      setAdditionalUploading(false);
    }
  };

  // Counter ref
  const counterRef = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);
  useEffect(() => {
    const el = counterRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setTriggered(true); obs.disconnect(); } }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // WhatsApp popup
  const [showWa, setShowWa] = useState(false);

  useEffect(() => { fetchAppealTopics().then(setTopics).catch(() => {}); }, []);
  useEffect(() => { fetchTestimonials().then(d => { if (d.length > 0) setTestimonials(d); }).catch(() => {}); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!KZ_PHONE_RE.test(formData.phone.trim())) { setError('Формат телефона: +7 7XX XXX XX XX'); return; }
    if (mode === 'video' && !formData.email.trim()) { setError('Укажите email — на него придёт ссылка на видеовстречу'); return; }
    if (!formData.topic) { setError('Выберите тему обращения'); return; }
    setError(null); setSubmitting(true);
    try {
      const attachments: AppealAttachment[] = [
        ...(statementFile ? [{ ...statementFile, kind: 'statement' as const }] : []),
        ...additionalFiles.map(f => ({ ...f, kind: 'additional' as const })),
      ];
      const result = await submitAppeal({
        fullName: formData.name, phone: formData.phone.trim(), email: formData.email.trim() || undefined,
        topicId: formData.topic, message: formData.message,
        attachments: attachments.length > 0 ? attachments : undefined,
        format: mode === 'video' ? 'VIDEO' : 'WRITTEN',
      });
      setAppealNumber(result.appealNumber);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось отправить обращение. Попробуйте ещё раз.');
    } finally { setSubmitting(false); }
  };

  const inputCls = 'w-full bg-[var(--surface-2,var(--surface))] border border-[var(--line)] rounded-none px-4 py-3.5 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-brand)] outline-none transition-all';

  return (
    <>
      {/* ── HEADER ──────────────────────────────────────────── */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-10 mb-10">
        <ScrollReveal>
          <span className="inline-block text-[11px] font-semibold uppercase tracking-widest text-[var(--accent-brand)] mb-3">Приёмная</span>
          <h1 className="font-formular text-4xl md:text-5xl font-bold text-[var(--text)] leading-tight mb-3">{heading}</h1>
          <p className="text-base text-[var(--text-muted)] max-w-xl">{subtitle}</p>
        </ScrollReveal>
      </div>

      {/* ── HOW IT WORKS — мини-карточки шагов ───────────────── */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-10 mb-2.5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {HOW_STEPS.map(({ icon: Icon, step, label }, i) => (
            <div key={i} className="rounded-none border border-[var(--line)] p-3.5" style={{ background: 'var(--surface)' }}>
              <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide mb-1">{step}</p>
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
                <Icon size={16} className="text-[var(--accent-brand)] shrink-0" />
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── STATS — мини-карточки статистики ─────────────────── */}
      <div ref={counterRef} className="max-w-[1280px] mx-auto px-4 md:px-10 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {/* Stat 1 — from DB */}
          <div className="rounded-none border border-[var(--line)] p-4" style={{ background: 'var(--surface)' }}>
            <CountUp target={stat1Val} triggered={triggered} className="text-2xl font-bold text-[var(--accent-brand)] mr-1.5" />
            <span className="text-sm text-[var(--text-muted)]">{stat1Lab}</span>
          </div>
          {/* Stat 2 — from site_settings */}
          <div className="rounded-none border border-[var(--line)] p-4" style={{ background: 'var(--surface)' }}>
            <span className="text-2xl font-bold text-[var(--text)] mr-1.5">{stat2Val}</span>
            <span className="text-sm text-[var(--text-muted)]">{stat2Lab}</span>
          </div>
          {/* Stat 3 — from site_settings */}
          <div className="rounded-none border border-[var(--line)] p-4" style={{ background: 'var(--surface)' }}>
            <span className="text-2xl font-bold text-[var(--text)] mr-1.5">{stat3Val}</span>
            <span className="text-sm text-[var(--text-muted)]">{stat3Lab}</span>
          </div>
        </div>
      </div>

      {/* ── 2-COLUMN: FORM + IMAGE ───────────────────────────── */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-10 mb-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">

          {/* LEFT — FORM */}
          <ScrollReveal direction="left">
            <div className="rounded-2xl border border-[var(--line)] p-6 md:p-8" style={{ background: 'var(--surface)' }}>

              {/* Toggle */}
              <div className="flex rounded-xl p-1 mb-6" style={{ background: 'var(--bg)' }}>
                <button
                  type="button"
                  onClick={() => setMode('letter')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${mode === 'letter' ? 'bg-[var(--accent-brand)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
                >
                  <FileText size={14} />
                  Письменное обращение
                </button>
                <button
                  type="button"
                  onClick={() => setMode('video')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${mode === 'video' ? 'bg-[var(--accent-brand)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
                >
                  <Video size={14} />
                  Видеоприём
                </button>
              </div>

              {submitted ? (
                <div className="rounded-xl p-6 text-center border" style={{ background: 'rgba(219,31,38,0.06)', borderColor: 'rgba(219,31,38,0.2)' }}>
                  <CheckCircle size={36} className="mx-auto mb-3 text-[var(--accent-brand)]" />
                  <p className="text-base font-semibold text-[var(--text)] mb-1">Обращение принято</p>
                  {appealNumber && <p className="text-sm text-[var(--text-muted)]">Номер обращения: <strong className="text-[var(--text)]">{appealNumber}</strong></p>}
                  <p className="text-sm text-[var(--text-muted)] mt-1">Мы свяжемся с вами в ближайшее время.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input type="text" placeholder="Ваше имя" required value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputCls} />
                  <input type="tel" placeholder="Ваш номер телефона" required value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })} className={inputCls} />
                  {mode === 'video' && (
                    <input type="email" placeholder="Email — на него придёт ссылка на видеовстречу" required value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })} className={inputCls} />
                  )}
                  <select value={formData.topic} onChange={e => setFormData({ ...formData, topic: e.target.value })} className={inputCls + ' appearance-none cursor-pointer'}>
                    <option value="">Тема обращения</option>
                    {(topics.length > 0
                      ? topics.map(t => ({ id: t.id, label: t.nameRu }))
                      : FALLBACK_TOPICS.map(t => ({ id: t, label: t }))
                    ).map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                  <textarea placeholder="Опишите вашу ситуацию" required rows={4} value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    className={inputCls + ' resize-y min-h-[110px]'} />

                  {mode === 'letter' ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <label className="block rounded-none border border-dashed border-[var(--line)] p-3.5 cursor-pointer hover:border-[var(--accent-brand)] transition-colors">
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleStatementSelect} />
                          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text)] mb-0.5">
                            <Paperclip size={15} className="text-[var(--accent-brand)] shrink-0" />
                            <span className="truncate">{statementUploading ? 'Загрузка…' : statementFile ? statementFile.fileName : 'Прикрепить заявление'}</span>
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)] ml-[23px]">
                            {statementFile ? `${Math.round(statementFile.fileSize / 1024)} КБ` : 'PDF, JPG · до 10 МБ'}
                          </div>
                        </label>
                        <label className={`block rounded-none border border-dashed border-[var(--line)] p-3.5 transition-colors ${additionalFiles.length >= 3 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[var(--accent-brand)]'}`}>
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png" multiple className="hidden" onChange={handleAdditionalSelect} disabled={additionalFiles.length >= 3} />
                          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text)] mb-0.5">
                            <FileText size={15} className="text-[var(--accent-brand)] shrink-0" />
                            Дополнительные документы
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)] ml-[23px]">
                            {additionalUploading ? 'Загрузка…' : additionalFiles.length > 0 ? `${additionalFiles.length}/3 файлов` : 'до 3 файлов'}
                          </div>
                        </label>
                      </div>

                      {additionalFiles.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {additionalFiles.map((f, i) => (
                            <span key={i} className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md text-[var(--text)]" style={{ background: 'var(--surface-2, var(--surface))' }}>
                              {f.fileName}
                              <button type="button" onClick={() => setAdditionalFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-[var(--text-muted)] hover:text-[var(--accent-brand)]">
                                <X size={11} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      {attachError && <p className="text-xs text-[var(--accent-brand)]">{attachError}</p>}

                      {samples.length > 0 && (
                        <div>
                          <p className="text-xs text-[var(--text-muted)] mb-2">Нужен готовый шаблон?</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {samples.map(s => (
                              <a
                                key={s.id}
                                href={s.fileUrl} download={s.fileName} rel="noopener noreferrer"
                                className="flex items-center gap-2.5 rounded-none p-2.5 border border-[var(--line)] hover:border-[var(--accent-brand)] transition-colors"
                                style={{ background: 'var(--surface-2, var(--surface))' }}
                              >
                                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(219,31,38,0.1)' }}>
                                  <Download size={16} className="text-[var(--accent-brand)]" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[13px] font-semibold text-[var(--text)] truncate">{s.title}</p>
                                  <p className="text-[11px] text-[var(--text-muted)] uppercase">{s.fileName.split('.').pop()}</p>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-none border border-[var(--line)] p-3 mb-1 text-xs text-[var(--text-muted)]" style={{ background: 'var(--surface-2)' }}>
                      Укажите удобное время и, если хотите, с кем именно — мы согласуем дату видеовстречи и пришлём ссылку на почту и по SMS.
                    </div>
                  )}

                  <label className="flex items-start gap-3 text-sm text-[var(--text-muted)] cursor-pointer select-none">
                    <input type="checkbox" required checked={formData.consent}
                      onChange={e => setFormData({ ...formData, consent: e.target.checked })}
                      className="mt-0.5 shrink-0 accent-red" />
                    Согласен с политикой конфиденциальности
                  </label>
                  {error && <p className="text-sm text-[var(--accent-brand)]">{error}</p>}

                  {/* Primary: submit */}
                  <PrimaryButton type="submit" fullWidth disabled={submitting}>
                    {submitting ? 'Отправка…' : mode === 'video' ? 'Записаться на видеоприём' : 'Отправить обращение'}
                  </PrimaryButton>

                  {/* Secondary: WhatsApp */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowWa(v => !v)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl border border-[var(--line)] text-sm font-medium text-[var(--text)] hover:border-[#25d166] hover:text-[#25d166] transition-all duration-200"
                      style={{ background: 'transparent' }}
                    >
                      <MessageCircle size={16} />
                      Написать в WhatsApp
                    </button>

                    {/* Templates dropdown */}
                    {showWa && (
                      <div className="absolute bottom-full left-0 right-0 mb-2 rounded-xl border border-[var(--line)] shadow-xl overflow-hidden z-20" style={{ background: 'var(--surface)' }}>
                        {WA_TEMPLATES.map((tpl, i) => (
                          <a
                            key={i}
                            href={`${waHref}?text=${encodeURIComponent(tpl.text)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-between px-4 py-3 text-sm text-[var(--text)] hover:bg-[var(--bg)] transition-colors border-b border-[var(--line)] last:border-0"
                            onClick={() => setShowWa(false)}
                          >
                            {tpl.label}
                            <ArrowRight size={14} className="text-[var(--text-muted)]" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-center text-xs text-[var(--text-muted)]">
                    <span className="font-medium text-[var(--text)]">{waNumber}</span>
                    {' · '}{waNote}
                  </p>
                </form>
              )}
            </div>
          </ScrollReveal>

          {/* RIGHT — IMAGE MOCKUP */}
          <ScrollReveal direction="right" delay={0.1}>
            <div className="rounded-2xl border border-[var(--line)] overflow-hidden" style={{ background: 'var(--surface)' }}>
              <div className="p-5 border-b border-[var(--line)]">
                <div className="flex items-center gap-2 mb-1">
                  <Video size={15} className="text-[var(--text-muted)]" />
                  <span className="text-sm font-medium text-[var(--text)]">Как проходит видеоприём</span>
                </div>
                <p className="text-xs text-[var(--text-muted)]">{mockupCap}</p>
              </div>
              <img
                src={mockupSrc}
                alt="Мокап видеоприёмной НПК"
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* ── TESTIMONIALS SLIDER — бесшовный бесконечный скролл, пауза при наведении ── */}
      {testimonials.length > 0 && (
        <div className="border-t border-[var(--line)]" style={{ background: 'var(--surface)' }}>
          <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-8">
            <p className="text-base font-bold text-[var(--text)] mb-4">Отзывы обратившихся</p>
            <div
              className="group overflow-hidden"
              style={{ WebkitMaskImage: 'linear-gradient(90deg,transparent,#000 3%,#000 97%,transparent)', maskImage: 'linear-gradient(90deg,transparent,#000 3%,#000 97%,transparent)' }}
            >
              <div className="flex gap-4 w-max animate-marquee-left group-hover:[animation-play-state:paused]">
                {[...testimonials, ...testimonials].map((t, i) => (
                  <blockquote key={`${t.id}-${i}`} className="min-w-[260px] max-w-[260px] rounded-xl border border-[var(--line)] p-5" style={{ background: 'var(--bg)' }}>
                    <p className="text-sm italic text-[var(--text)] mb-3 leading-relaxed">«{t.quote}»</p>
                    <footer className="text-xs text-[var(--text-muted)]">{t.author}</footer>
                  </blockquote>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ФИЛИАЛЫ — выбор города, карточка с адресом/контактами скрыта до выбора ── */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-10 py-8">
        <ScrollReveal>
          <div className="rounded-2xl border border-[var(--line)] p-6 md:p-8" style={{ background: 'var(--surface)' }}>
            <h3 className="text-lg font-bold text-[var(--text)] mb-1">Приёмные в регионах</h3>
            <p className="text-sm text-[var(--text-muted)] mb-5 max-w-xl">Приёмные филиалов работают во всех регионах — выберите свой, чтобы узнать адрес и время работы</p>

            <div className="relative max-w-[420px]">
              <select
                value={selectedBranchId}
                onChange={e => setSelectedBranchId(e.target.value)}
                className={inputCls + ' appearance-none cursor-pointer pr-10 w-full'}
              >
                <option value="">Выберите филиал или город</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.cityRu}</option>)}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            </div>

            {selectedBranch && (
              <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4 rounded-xl p-5 mt-4" style={{ background: 'var(--surface-2, var(--surface))' }}>
                <div>
                  <p className="text-sm font-bold text-[var(--text)] mb-2">{selectedBranch.cityRu}</p>
                  {selectedBranch.chairman && (
                    <p className="text-sm text-[var(--text-muted)] mb-1.5">Председатель: {selectedBranch.chairman}</p>
                  )}
                  <div className="flex items-start gap-2 text-sm text-[var(--text-muted)] mb-1.5">
                    <MapPin size={15} className="text-[var(--accent-brand)] mt-0.5 shrink-0" />
                    {selectedBranch.addressRu}
                  </div>
                  {selectedBranch.phone && (
                    <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-1.5">
                      <Phone size={15} className="text-[var(--accent-brand)] shrink-0" />
                      {selectedBranch.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-3">
                    <Mail size={15} className="text-[var(--accent-brand)] shrink-0" />
                    {selectedBranch.email}
                  </div>
                  <a
                    href={routeHref}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg border border-[var(--line)] text-[var(--text)] hover:border-[var(--accent-brand)] transition-colors"
                  >
                    <Navigation size={13} />
                    Построить маршрут
                  </a>
                </div>
                <iframe
                  title={`Карта: ${selectedBranch.cityRu}`}
                  src={mapEmbedSrc}
                  className="rounded-lg w-full min-h-[160px] border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </>
  );
}
