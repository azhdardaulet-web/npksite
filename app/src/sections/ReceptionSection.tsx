import { useState, useEffect, useRef } from 'react';
import { MessageCircle } from 'lucide-react';
import { PrimaryButton } from '@/components/PrimaryButton';
import { CountUp } from '@/components/CountUp';
import { testimonials } from '@/lib/data';
import { ScrollReveal } from '@/components/ScrollReveal';
import { TextReveal } from '@/components/TextReveal';

const topics = ['Общий вопрос', 'Социальная помощь', 'ЖКХ и инфраструктура', 'Образование', 'Медицина', 'Труд и занятость', 'Другое'];

export function ReceptionSection() {
  const [formData, setFormData] = useState({ name: '', phone: '', topic: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [triggered, setTriggered] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section className="bg-coal py-20 md:py-28">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        <div className="mb-12">
          <p className="text-label text-red font-medium mb-3 uppercase tracking-wider">Приёмная</p>
          <TextReveal tag="h2" className="font-formular text-heading-md md:text-heading-lg text-white">
            Онлайн приёмная
          </TextReveal>
          <p className="text-body-lg font-light text-fog mt-3">Ваш голос услышан. Ваша проблема не останется без ответа.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: Form */}
          <ScrollReveal direction="left">
            <div className="bg-cinder rounded-panel p-6 md:p-8 border border-white/[0.06]">
              <h3 className="text-heading font-bold text-white mb-6">Отправить обращение</h3>
              {submitted ? (
                <div className="bg-red/10 border border-red/25 rounded-card p-6 text-center">
                  <p className="text-body-lg text-white font-medium">Спасибо! Ваше обращение принято.</p>
                  <p className="text-body text-fog mt-2">Мы свяжемся с вами в ближайшее время.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input type="text" placeholder="Ваше имя" required value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-ash border border-white/10 rounded-input px-4 py-3.5 text-body text-white placeholder:text-steel focus:border-red focus:shadow-focus outline-none transition-all" />
                  <input type="tel" placeholder="Ваш номер телефона" required value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-ash border border-white/10 rounded-input px-4 py-3.5 text-body text-white placeholder:text-steel focus:border-red focus:shadow-focus outline-none transition-all" />
                  <select value={formData.topic} onChange={e => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full bg-ash border border-white/10 rounded-input px-4 py-3.5 text-body text-white focus:border-red focus:shadow-focus outline-none transition-all appearance-none">
                    <option value="" className="bg-cinder">Выберите тему</option>
                    {topics.map(t => <option key={t} value={t} className="bg-cinder">{t}</option>)}
                  </select>
                  <textarea placeholder="Опишите вашу ситуацию" required rows={4} value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-ash border border-white/10 rounded-input px-4 py-3.5 text-body text-white placeholder:text-steel focus:border-red focus:shadow-focus outline-none transition-all resize-y min-h-[120px]" />
                  <label className="flex items-start gap-3 text-body text-fog cursor-pointer">
                    <input type="checkbox" required className="mt-0.5 accent-red shrink-0" />
                    Согласен с политикой конфиденциальности
                  </label>
                  <PrimaryButton type="submit" fullWidth>Отправить обращение</PrimaryButton>
                </form>
              )}
            </div>
          </ScrollReveal>

          {/* RIGHT: Info */}
          <div className="space-y-5">
            <ScrollReveal direction="right" delay={0.1}>
              <a href="https://wa.me/77000881917" target="_blank" rel="noopener noreferrer"
                className="block bg-[rgba(37,211,102,0.08)] border border-[rgba(37,211,102,0.2)] rounded-[16px] p-5 md:p-6 transition-all hover:bg-[rgba(37,211,102,0.14)]">
                <div className="flex items-center gap-3 mb-2">
                  <MessageCircle size={24} className="text-[#25d166]" />
                  <span className="text-[20px] font-bold text-white">+7 700 088 19 17</span>
                </div>
                <p className="text-body text-steel">Написать напрямую</p>
              </a>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.2}>
              <div ref={counterRef} className="bg-red/[0.08] border border-red/25 rounded-[16px] p-5 md:p-6">
                <CountUp target={847} triggered={triggered} className="text-[40px] font-bold text-red" />
                <p className="text-body text-fog mt-1">обращений решено</p>
              </div>
            </ScrollReveal>

            {testimonials.map((t, i) => (
              <ScrollReveal key={t.id} direction="right" delay={0.3 + i * 0.1}>
                <div className="bg-cinder rounded-[16px] p-4 border border-white/[0.06]">
                  <p className="text-body text-silver mb-2">&ldquo;{t.quote}&rdquo;</p>
                  <p className="text-label text-steel font-medium">— {t.author}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
