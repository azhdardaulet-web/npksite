import { ArrowUpRight, Facebook, Instagram, Mail, MapPin, Send, Youtube } from 'lucide-react';
import { ScrollReveal } from '@/components/ScrollReveal';

const TikTokIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.86a8.22 8.22 0 0 0 4.8 1.54V6.93a4.85 4.85 0 0 1-1.03-.24z" />
  </svg>
);

const socialLinks = [
  { name: 'Instagram', href: 'https://www.instagram.com/halyk_partiyasy/', icon: <Instagram size={22} /> },
  { name: 'Telegram', href: 'https://t.me/halykparty', icon: <Send size={22} /> },
  { name: 'YouTube', href: 'https://www.youtube.com/channel/UCYq_KOlsxp8H2r3GIq6hWtA', icon: <Youtube size={22} /> },
  { name: 'TikTok', href: 'https://www.tiktok.com/@halyk_partiyasy', icon: <TikTokIcon /> },
  { name: 'Facebook', href: 'https://www.facebook.com/halykpartiyasy', icon: <Facebook size={22} /> },
];

export function ContactsPage() {
  return (
    <div className="pb-16 md:pb-24">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        <ScrollReveal>
          <header className="max-w-[820px] pt-4 pb-10 md:pb-14">
            <div className="w-12 h-[3px] bg-accent-brand mb-7" />
            <p className="text-label font-bold tracking-[0.16em] uppercase text-accent-brand mb-4">Народная партия Казахстана</p>
            <h1 className="font-formular text-[42px] sm:text-[56px] md:text-[72px] font-bold leading-[0.98] tracking-tight text-text-base">
              Контакты партии
            </h1>
            <p className="text-body-lg md:text-[20px] leading-relaxed text-text-muted mt-7 max-w-[660px]">
              Центральный аппарат партии и официальные каналы связи.
            </p>
          </header>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_0.85fr] border-y border-line">
          <ScrollReveal className="h-full">
            <section className="h-full py-9 md:py-12 lg:pr-12">
              <div className="flex items-start gap-5 md:gap-7">
                <MapPin size={30} strokeWidth={1.7} className="text-accent-brand shrink-0 mt-1" />
                <div>
                  <p className="text-label font-bold tracking-[0.14em] uppercase text-text-muted">Центральный аппарат</p>
                  <h2 className="font-formular text-[32px] md:text-[44px] font-bold leading-tight text-text-base mt-4">Астана</h2>
                  <address className="not-italic text-body-lg md:text-[20px] leading-relaxed text-text-muted mt-3">
                    Республика Казахстан, 010000<br />
                    улица Желтоксан, дом 16
                  </address>
                </div>
              </div>

              <div className="mt-10 pt-9 border-t border-line flex items-start gap-5 md:gap-7">
                <Mail size={30} strokeWidth={1.7} className="text-accent-brand shrink-0 mt-1" />
                <div>
                  <p className="text-label font-bold tracking-[0.14em] uppercase text-text-muted">Электронная почта</p>
                  <a
                    href="mailto:info@halykpartiyasy.kz"
                    className="inline-flex items-center gap-3 font-formular text-[23px] sm:text-[28px] md:text-[34px] font-bold text-text-base hover:text-accent-brand transition-colors mt-4 break-all"
                  >
                    info@halykpartiyasy.kz <ArrowUpRight size={22} className="shrink-0" />
                  </a>
                </div>
              </div>
            </section>
          </ScrollReveal>

          <ScrollReveal delay={0.1} className="h-full">
            <aside className="h-full border-t lg:border-t-0 lg:border-l border-line py-9 md:py-12 lg:pl-12">
              <p className="text-label font-bold tracking-[0.14em] uppercase text-accent-brand">Официальные страницы</p>
              <h2 className="font-formular text-[30px] md:text-[38px] font-bold leading-tight text-text-base mt-4 mb-7">
                Мы в социальных сетях
              </h2>

              <div className="border-t border-line">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-4 py-4 border-b border-line text-text-base hover:text-accent-brand transition-colors"
                  >
                    <span className="flex items-center gap-4">
                      <span className="w-10 h-10 bg-surface-2 flex items-center justify-center group-hover:bg-accent-brand group-hover:text-white transition-colors">
                        {social.icon}
                      </span>
                      <span className="text-body-lg font-bold">{social.name}</span>
                    </span>
                    <ArrowUpRight size={19} className="text-text-muted group-hover:text-accent-brand transition-colors" />
                  </a>
                ))}
              </div>
            </aside>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
