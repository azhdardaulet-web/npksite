import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Video, CheckCircle, Hash, MessageCircle, ArrowRight, Send } from 'lucide-react';
import { ScrollReveal } from '@/components/ScrollReveal';
import { CountUp } from '@/components/CountUp';
import { testimonials as fallbackTestimonials } from '@/lib/data';
import {
  fetchAppealsResolvedCount, fetchSettings, fetchTestimonials,
  type PublicTestimonial,
} from '@/lib/api';
import { usePageBlocks } from '@/hooks/usePageBlocks';

// Компактная секция «Общественная приёмная» на главной — те же данные
// (Page(slug=priemnaya), счётчик из БД, site_settings), что и на /priemnaya,
// но без самой формы: сюда — только карточки шагов/статистики и кадр
// видеоприёма, кнопка «Отправить обращение» ведёт на полноценную страницу.

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

const FALLBACK_TESTIMONIALS: PublicTestimonial[] = fallbackTestimonials.map((t) => ({ id: String(t.id), quote: t.quote, author: t.author }));

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

export function ReceptionSection() {
  const { getBlock } = usePageBlocks('priemnaya');
  const cms = getBlock<ReceptionHeaderBlock>('reception_header');
  const stepsItems = getBlock<ReceptionStepsBlock>('reception_steps')?.items;
  const steps = stepsItems?.length ? stepsItems : FALLBACK_STEPS;
  const STEPS = steps.map((s, i) => ({ icon: STEP_ICONS[i % STEP_ICONS.length], step: s.titleRu, label: s.textRu }));

  const heading  = cms?.headingRu?.trim()  || 'Общественная приёмная';
  const subtitle = cms?.subtitleRu?.trim() || 'Направьте обращение в Народную партию Казахстана — письменно или на видеоприёме';
  const waNumber = '+77002202020';
  const waNote   = cms?.whatsappNoteRu?.trim() || 'ответ обычно в течение дня';
  const waHref   = `https://wa.me/${waNumber.replace(/[^\d]/g, '')}`;
  const stat1Lab = cms?.counterLabelRu?.trim()  || 'обращений решено';
  const stat2Lab = cms?.stat2LabelRu?.trim() || 'средний срок ответа';
  const stat3Lab = cms?.stat3LabelRu?.trim() || 'филиалов принимают';
  const mockupCap = cms?.mockupCaptionRu?.trim() || 'Ссылка на видеовстречу придёт на почту и по SMS после согласования времени.';

  const [resolvedCount, setResolvedCount] = useState<number | null>(null);
  const [settings, setSettings] = useState<Record<string, string>>({});
  useEffect(() => { fetchAppealsResolvedCount().then(d => setResolvedCount(d.count)).catch(() => {}); }, []);
  useEffect(() => { fetchSettings().then(setSettings).catch(() => {}); }, []);
  const stat1Val = resolvedCount ?? 847;
  const stat2Val = settings.reception_avg_response_time?.trim() || '5 дней';
  const stat3Val = settings.reception_branches_accepting?.trim() || '20';
  const mockupSrc = settings.video_preview_image?.trim() || cms?.mockupImageUrl?.trim() || '/images/reception-mockup.png';

  const [testimonials, setTestimonials] = useState<PublicTestimonial[]>(FALLBACK_TESTIMONIALS);
  useEffect(() => { fetchTestimonials().then(d => { if (d.length > 0) setTestimonials(d); }).catch(() => {}); }, []);

  const counterRef = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);
  useEffect(() => {
    const el = counterRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setTriggered(true); obs.disconnect(); } }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const [showWa, setShowWa] = useState(false);

  return (
    <section className="py-[var(--section-gap)] overflow-hidden" style={{ background: 'var(--bg)' }}>
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        <ScrollReveal>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--accent-brand)] mb-3">Приёмная</p>
          <h2 className="font-formular text-3xl md:text-4xl font-bold text-[var(--text)] mb-3 leading-tight">{heading}</h2>
          <p className="text-base text-[var(--text-muted)] mb-8 max-w-xl leading-relaxed">{subtitle}</p>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* LEFT — шаги, статистика, CTA */}
          <ScrollReveal direction="left" className="h-full">
            <div ref={counterRef} className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                {STEPS.map(({ icon: Icon, step, label }, i) => (
                  <div key={i} className="rounded-none border border-[var(--line)] p-3.5" style={{ background: 'var(--surface)' }}>
                    <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide mb-1">{step}</p>
                    <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
                      <Icon size={16} className="text-[var(--accent-brand)] shrink-0" />
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="rounded-none border border-[var(--line)] p-4" style={{ background: 'var(--surface)' }}>
                  <CountUp target={stat1Val} triggered={triggered} className="text-2xl font-bold text-[var(--accent-brand)] mr-1.5" />
                  <span className="text-sm text-[var(--text-muted)]">{stat1Lab}</span>
                </div>
                <div className="rounded-none border border-[var(--line)] p-4" style={{ background: 'var(--surface)' }}>
                  <span className="text-2xl font-bold text-[var(--text)] mr-1.5">{stat2Val}</span>
                  <span className="text-sm text-[var(--text-muted)]">{stat2Lab}</span>
                </div>
                <div className="rounded-none border border-[var(--line)] p-4" style={{ background: 'var(--surface)' }}>
                  <span className="text-2xl font-bold text-[var(--text)] mr-1.5">{stat3Val}</span>
                  <span className="text-sm text-[var(--text-muted)]">{stat3Lab}</span>
                </div>
              </div>

              <Link
                to="/priemnaya"
                className="w-full flex items-center justify-center gap-2 bg-red hover:bg-red-dark text-white font-medium text-[15px] rounded-pill px-7 py-3.5 min-h-[48px] shadow-cta transition-colors duration-200 active:scale-[0.97]"
              >
                <Send size={16} />
                Отправить обращение
              </Link>

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
            </div>
          </ScrollReveal>

          {/* RIGHT — мокап видеоприёма, высота подстраивается под левую колонку */}
          <ScrollReveal direction="right" delay={0.1} className="h-full">
            <div className="h-full flex flex-col rounded-2xl border border-[var(--line)] overflow-hidden" style={{ background: 'var(--surface)' }}>
              <div className="p-5 border-b border-[var(--line)] shrink-0">
                <div className="flex items-center gap-2 mb-1">
                  <Video size={15} className="text-[var(--text-muted)]" />
                  <span className="text-sm font-medium text-[var(--text)]">Как проходит видеоприём</span>
                </div>
                <p className="text-xs text-[var(--text-muted)]">{mockupCap}</p>
              </div>
              <div className="relative flex-1 min-h-[220px]">
                <img
                  src={mockupSrc}
                  alt="Мокап видеоприёмной НПК"
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Отзывы — статичный ряд, без анимации (для полной ленты см. /priemnaya) */}
      {testimonials.length > 0 && (
        <div className="mt-14 border-t border-[var(--line)] pt-8">
          <div className="max-w-[1280px] mx-auto px-4 md:px-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {testimonials.slice(0, 3).map((t) => (
                <blockquote key={t.id} className="rounded-xl border border-[var(--line)] p-5" style={{ background: 'var(--surface)' }}>
                  <p className="text-sm text-[var(--text)] mb-3 leading-relaxed">«{t.quote}»</p>
                  <footer className="text-xs font-medium text-[var(--text-muted)]">{t.author}</footer>
                </blockquote>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
