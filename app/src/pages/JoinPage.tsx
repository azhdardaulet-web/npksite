import { useState } from 'react';
import { UserPlus, Heart, Eye, CheckCircle } from 'lucide-react';
import { SectionHeader } from '@/components/SectionHeader';
import { ScrollReveal } from '@/components/ScrollReveal';
import { PrimaryButton } from '@/components/PrimaryButton';
import { submitJoinRequest, ApiError } from '@/lib/api';

const KZ_PHONE_RE = /^\+7\s?7\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/;

const roles = [
  {
    id: 'member',
    icon: UserPlus,
    title: 'Стать членом партии',
    description: 'Полноценное участие в жизни партии. Голосование на съездах, выбор кандидатов, участие в партийных мероприятиях.',
  },
  {
    id: 'volunteer',
    icon: Heart,
    title: 'Стать волонтёром',
    description: 'Помогайте в предвыборной кампании. Распространение программы, агитационная работа, помощь на избирательных участках.',
  },
  {
    id: 'observer',
    icon: Eye,
    title: 'Наблюдатель на выборах',
    description: 'Следите за честностью выборов. Защитите свой голос и голос народа. Обучение и аккредитация наблюдателей.',
  },
];

export function JoinPage() {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', city: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!KZ_PHONE_RE.test(formData.phone.trim())) {
      setError('Формат телефона: +7 7XX XXX XX XX');
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      await submitJoinRequest({
        role: selectedRole as 'member' | 'volunteer' | 'observer',
        fullName: formData.name,
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        city: formData.city,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось отправить заявку. Попробуйте ещё раз.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-[104px] pb-16">
      <div className="max-w-[800px] mx-auto px-4 md:px-10">
        <SectionHeader light="Вступить в" bold="партию" centered />

        {submitted ? (
          <ScrollReveal>
            <div className="bg-cinder rounded-card p-8 md:p-12 border border-white/[0.08] text-center">
              <CheckCircle size={64} className="text-red mx-auto mb-4" />
              <h3 className="text-heading font-bold text-white mb-2">Заявка принята!</h3>
              <p className="text-body text-silver">Спасибо за интерес. Мы свяжемся с вами в ближайшее время.</p>
            </div>
          </ScrollReveal>
        ) : (
          <>
            {step === 1 && (
              <ScrollReveal>
                <div className="bg-cinder rounded-card p-6 md:p-8 border border-white/[0.08]">
                  <h3 className="text-heading-sm font-bold text-white mb-6 text-center">Выберите роль</h3>
                  <div className="space-y-4">
                    {roles.map((role) => {
                      const Icon = role.icon;
                      return (
                        <button
                          key={role.id}
                          onClick={() => setSelectedRole(role.id)}
                          className={`w-full flex items-start gap-4 p-5 rounded-card border transition-all duration-200 text-left ${
                            selectedRole === role.id
                              ? 'border-red bg-red/[0.08]'
                              : 'border-white/[0.08] hover:border-white/20 bg-ash'
                          }`}
                        >
                          <Icon size={28} strokeWidth={1.5} className="text-red shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-body-lg font-bold text-white mb-1">{role.title}</h4>
                            <p className="text-body text-fog">{role.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <PrimaryButton
                    fullWidth
                    className="mt-6"
                    onClick={() => selectedRole && setStep(2)}
                  >
                    Продолжить
                  </PrimaryButton>
                </div>
              </ScrollReveal>
            )}

            {step === 2 && (
              <ScrollReveal>
                <div className="bg-cinder rounded-card p-6 md:p-8 border border-white/[0.08]">
                  <h3 className="text-heading-sm font-bold text-white mb-6">Заполните данные</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="ФИО" required
                      value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-ash border border-white/10 rounded-input px-4 py-3.5 text-body text-white placeholder:text-steel focus:border-red focus:shadow-focus outline-none transition-all" />
                    <input type="tel" placeholder="Телефон" required
                      value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-ash border border-white/10 rounded-input px-4 py-3.5 text-body text-white placeholder:text-steel focus:border-red focus:shadow-focus outline-none transition-all" />
                    <input type="email" placeholder="Email (необязательно)"
                      value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-ash border border-white/10 rounded-input px-4 py-3.5 text-body text-white placeholder:text-steel focus:border-red focus:shadow-focus outline-none transition-all" />
                    <input type="text" placeholder="Город" required
                      value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-ash border border-white/10 rounded-input px-4 py-3.5 text-body text-white placeholder:text-steel focus:border-red focus:shadow-focus outline-none transition-all" />
                    {error && <p className="text-body text-red">{error}</p>}
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setStep(1)}
                        className="flex-1 py-3.5 border border-white/20 rounded-pill text-body font-medium text-white hover:bg-white/[0.06] transition-all">
                        Назад
                      </button>
                      <PrimaryButton type="submit" className="flex-1" disabled={submitting}>
                        {submitting ? 'Отправка…' : 'Отправить заявку'}
                      </PrimaryButton>
                    </div>
                  </form>
                </div>
              </ScrollReveal>
            )}
          </>
        )}
      </div>
    </div>
  );
}
