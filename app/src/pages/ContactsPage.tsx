import { MapPin, Phone, Mail } from 'lucide-react';
import { SectionHeader } from '@/components/SectionHeader';
import { ScrollReveal } from '@/components/ScrollReveal';

export function ContactsPage() {
  return (
    <div className="pt-[104px] pb-16">
      <div className="max-w-[800px] mx-auto px-4 md:px-10">
        <SectionHeader light="Наши" bold="контакты" centered />

        <div className="space-y-4">
          <ScrollReveal>
            <div className="bg-cinder rounded-card p-6 border border-white/[0.08] flex items-start gap-4">
              <MapPin size={24} className="text-red shrink-0 mt-0.5" />
              <div>
                <h4 className="text-body-lg font-bold text-white mb-1">Адрес</h4>
                <p className="text-body text-silver">010000, Астана, ул. Желтоксан, 16</p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="bg-cinder rounded-card p-6 border border-white/[0.08] flex items-start gap-4">
              <Phone size={24} className="text-red shrink-0 mt-0.5" />
              <div>
                <h4 className="text-body-lg font-bold text-white mb-1">Телефон</h4>
                <a href="tel:+77172250111" className="text-body text-silver hover:text-white transition-colors">+7 (7172) 25 01 11</a>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="bg-cinder rounded-card p-6 border border-white/[0.08] flex items-start gap-4">
              <Mail size={24} className="text-red shrink-0 mt-0.5" />
              <div>
                <h4 className="text-body-lg font-bold text-white mb-1">Email</h4>
                <a href="mailto:info@halykpartiyasy.kz" className="text-body text-silver hover:text-white transition-colors">info@halykpartiyasy.kz</a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
