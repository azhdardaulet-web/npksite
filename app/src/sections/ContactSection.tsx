import { Mail, Phone, MapPin } from 'lucide-react';
import { TextReveal } from '@/components/TextReveal';
import { ScrollReveal } from '@/components/ScrollReveal';
import { useHomeBlocks } from '@/hooks/useHomeBlocks';

const ICONS = [Mail, Phone, MapPin];

const FALLBACK_CONTACTS = [
  { labelRu: 'Почта', value: 'info@halykpartiyasy.kz', href: 'mailto:info@halykpartiyasy.kz' },
  { labelRu: 'Телефон', value: '+77002202020', href: 'tel:+77002202020' },
  { labelRu: 'Офис', value: 'Астана, ул. Желтоксан, 16, Казахстан', href: 'https://maps.google.com/?q=Астана+Желтоксан+16' },
];

interface ContactItem { labelRu?: string; value?: string; href?: string; }
interface ContactsBlock { headingRu?: string; textRu?: string; items?: ContactItem[]; }

export function ContactSection() {
  const { getBlock } = useHomeBlocks();
  const cms = getBlock<ContactsBlock>('contacts_block');
  const heading = cms?.headingRu?.trim() || 'Свяжитесь с нами';
  const subtitle = cms?.textRu?.trim() || 'Напишите письмо, позвоните или посетите офис партии.';
  const contacts = (cms?.items?.length ? cms.items : FALLBACK_CONTACTS).map((c, i) => ({
    icon: ICONS[i] ?? Mail,
    label: c.labelRu || FALLBACK_CONTACTS[i]?.labelRu || '',
    value: c.value || '',
    href: c.href || '#',
  }));

  return (
    <section className="bg-bg py-[var(--section-gap)] overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left: text + contacts */}
          <div>
            <p className="text-label font-light text-text-muted mb-3">Контакты</p>
            <TextReveal
              tag="h2"
              className="font-formular text-heading-md md:text-heading-lg text-text-base mb-4"
            >
              {heading}
            </TextReveal>
            <p className="text-body-lg font-light text-text-muted mb-10 max-w-[480px]">
              {subtitle}
            </p>

            <div className="flex flex-col gap-8">
              {contacts.map((contact, i) => {
                const Icon = contact.icon;
                return (
                  <ScrollReveal key={contact.label} delay={i * 0.1}>
                    <div className="flex items-start gap-5">
                      <div className="w-12 h-12 rounded-full bg-surface-2 border border-line flex items-center justify-center shrink-0">
                        <Icon size={20} strokeWidth={1.5} className="text-text-base" />
                      </div>
                      <div>
                        <p className="text-[20px] font-bold text-text-base mb-1">{contact.label}</p>
                        <a
                          href={contact.href}
                          target={contact.href.startsWith('http') ? '_blank' : undefined}
                          rel={contact.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="text-body font-light text-text-muted hover:text-text-base transition-colors"
                        >
                          {contact.value}
                        </a>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>

          {/* Right: map */}
          <div className="relative aspect-[4/3] lg:aspect-auto lg:h-[480px] rounded-card overflow-hidden bg-surface-2">
            <iframe
              title="Офис Народной партии Казахстана"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2504.4!2d71.4282!3d51.1795!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x424585028a8c3893%3A0x9e0d3a2f4b16f7b!2z0YPQuy4g0JbQtdC70YLQvtC60YHQsNC9LCAxNiwg0JDRgdGC0LDQvdCwLCDQmtCw0LfQsNGF0YHRgtCw0L0!5e0!3m2!1sru!2skz!4v1700000000000!5m2!1sru!2skz"
              width="100%"
              height="100%"
              style={{ border: 0, display: 'block' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
