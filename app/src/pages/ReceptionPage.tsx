import { useState, useEffect, useRef } from 'react';
import { MessageCircle } from 'lucide-react';
import { SectionHeader } from '@/components/SectionHeader';
import { ScrollReveal } from '@/components/ScrollReveal';
import { PrimaryButton } from '@/components/PrimaryButton';
import { CountUp } from '@/components/CountUp';
import { testimonials as fallbackTestimonials } from '@/lib/data';
import { fetchAppealTopics, fetchTestimonials, submitAppeal, ApiError, type AppealTopic, type PublicTestimonial } from '@/lib/api';

const FALLBACK_TOPICS = ['Общий вопрос', 'Социальная помощь', 'ЖКХ и инфраструктура', 'Образование', 'Медицина', 'Труд и занятость', 'Другое'];
const FALLBACK_TESTIMONIALS: PublicTestimonial[] = fallbackTestimonials.map((t) => ({ id: String(t.id), quote: t.quote, author: t.author }));
const KZ_PHONE_RE = /^\+7\s?7\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/;

export function ReceptionPage() {
  const [formData, setFormData] = useState({ name: '', phone: '', topic: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appealNumber, setAppealNumber] = useState<string | null>(null);
  const [triggered, setTriggered] = useState(false);
  const [topics, setTopics] = useState<AppealTopic[]>([]);
  const [testimonials, setTestimonials] = useState<PublicTestimonial[]>(FALLBACK_TESTIMONIALS);
  const counterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = counterRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTriggered(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchAppealTopics().then(setTopics).catch(() => {});
  }, []);

  useEffect(() => {
    fetchTestimonials().then((data) => { if (data.length > 0) setTestimonials(data); }).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!KZ_PHONE_RE.test(formData.phone.trim())) {
      setError('Формат телефона: +7 7XX XXX XX XX');
      return;
    }
    if (!formData.topic) {
      setError('Выберите тему обращения');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const result = await submitAppeal({
        fullName: formData.name,
        phone: formData.phone.trim(),
        topicId: formData.topic,
        message: formData.message,
      });
      setAppealNumber(result.appealNumber);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось отправить обращение. Попробуйте ещё раз.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-[104px] pb-16">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        <SectionHeader light="Народная" bold="приёмная" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ScrollReveal>
            <div className="bg-cinder rounded-panel p-6 md:p-8">
              <h3 className="text-heading font-bold text-white mb-6">Отправить обращение</h3>
              {submitted ? (
                <div className="bg-red/10 border border-red/25 rounded-card p-6 text-center">
                  <p className="text-body-lg text-white font-medium">Спасибо! Ваше обращение принято.</p>
                  {appealNumber && <p className="text-body text-white mt-2">Номер обращения: <strong>{appealNumber}</strong></p>}
                  <p className="text-body text-fog mt-2">Мы свяжемся с вами в ближайшее время.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input type="text" placeholder="Имя" required value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-ash border border-white/10 rounded-input px-4 py-3.5 text-body text-white placeholder:text-steel focus:border-red focus:shadow-focus outline-none transition-all" />
                  <input type="tel" placeholder="Телефон" required value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-ash border border-white/10 rounded-input px-4 py-3.5 text-body text-white placeholder:text-steel focus:border-red focus:shadow-focus outline-none transition-all" />
                  <select value={formData.topic} onChange={e => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full bg-ash border border-white/10 rounded-input px-4 py-3.5 text-body text-white focus:border-red focus:shadow-focus outline-none transition-all appearance-none">
                    <option value="" className="bg-cinder text-fog">Выберите тему</option>
                    {(topics.length > 0 ? topics.map(t => ({ id: t.id, label: t.nameRu })) : FALLBACK_TOPICS.map(t => ({ id: t, label: t })))
                      .map(t => <option key={t.id} value={t.id} className="bg-cinder">{t.label}</option>)}
                  </select>
                  <textarea placeholder="Ваше сообщение" required rows={4} value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-ash border border-white/10 rounded-input px-4 py-3.5 text-body text-white placeholder:text-steel focus:border-red focus:shadow-focus outline-none transition-all resize-y min-h-[120px]" />
                  {error && <p className="text-body text-red">{error}</p>}
                  <PrimaryButton type="submit" fullWidth disabled={submitting}>
                    {submitting ? 'Отправка…' : 'Отправить обращение'}
                  </PrimaryButton>
                </form>
              )}
            </div>
          </ScrollReveal>

          <div className="space-y-5">
            <ScrollReveal delay={0.1}>
              <a href="https://wa.me/77000881917" target="_blank" rel="noopener noreferrer"
                className="block bg-[rgba(37,211,102,0.08)] border border-[rgba(37,211,102,0.2)] rounded-[16px] p-5 md:p-6 transition-all hover:bg-[rgba(37,211,102,0.14)]">
                <div className="flex items-center gap-3 mb-2">
                  <MessageCircle size={24} className="text-[#25d166]" />
                  <span className="text-[20px] font-bold text-white">+7 700 088 19 17</span>
                </div>
                <p className="text-body text-steel">Написать напрямую</p>
              </a>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div ref={counterRef} className="bg-red/[0.08] border border-red/25 rounded-[16px] p-5 md:p-6">
                <CountUp target={847} triggered={triggered} className="text-[40px] font-bold text-red" />
                <p className="text-body text-fog mt-1">обращений решено</p>
              </div>
            </ScrollReveal>

            {testimonials.map((t, i) => (
              <ScrollReveal key={t.id} delay={0.3 + i * 0.1}>
                <div className="bg-cinder rounded-[16px] p-4 border border-white/[0.06]">
                  <p className="text-body text-silver mb-2">&ldquo;{t.quote}&rdquo;</p>
                  <p className="text-label text-steel font-medium">— {t.author}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
