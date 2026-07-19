import { Link } from 'react-router-dom';
import { Youtube, Instagram, Facebook, Send } from 'lucide-react';

const navLinks = [
  { label: 'О партии', href: '/o-partii' },
  { label: 'Фракция', href: '/frakciya' },
  { label: 'Программа', href: '/programma' },
  { label: 'Общественная приёмная', href: '/priemnaya' },
  { label: 'Медиа', href: '/media' },
  { label: 'Контакты', href: '/kontakty' },
];

// Ссылки — те же, что в DesktopHeader.tsx (components/DesktopHeader.tsx, массив socials).
const IconTikTok = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.86a8.22 8.22 0 0 0 4.8 1.54V6.93a4.85 4.85 0 0 1-1.03-.24z"/>
  </svg>
);

const socialIcons = [
  { name: 'YouTube', href: 'https://www.youtube.com/channel/UCYq_KOlsxp8H2r3GIq6hWtA', icon: <Youtube size={18} strokeWidth={1.75} /> },
  { name: 'Instagram', href: 'https://www.instagram.com/halyk_partiyasy/', icon: <Instagram size={18} strokeWidth={1.75} /> },
  { name: 'TikTok', href: 'https://www.tiktok.com/@halyk_partiyasy', icon: <IconTikTok /> },
  { name: 'Telegram', href: 'https://t.me/halykparty', icon: <Send size={18} strokeWidth={1.75} /> },
  { name: 'Facebook', href: 'https://www.facebook.com/halykpartiyasy', icon: <Facebook size={18} strokeWidth={1.75} /> },
];

export function Footer() {
  return (
    <footer className="bg-surface border-t border-line">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        {/* Top */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Logo */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-red rounded-none flex items-center justify-center">
                <span className="text-accent-brand-text font-bold text-sm">НП</span>
              </div>
              <span className="text-text-base font-bold text-sm">НПК</span>
            </div>
            <p className="text-body text-text-muted">Народная Партия Казахстана</p>
          </div>

          {/* Col 2: Nav */}
          <div>
            <h4 className="text-label font-medium text-text-base mb-4">Навигация</h4>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-body text-text-muted hover:text-text-base transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Contacts */}
          <div>
            <h4 className="text-label font-medium text-text-base mb-4">Контакты</h4>
            <div className="space-y-2 text-body text-text-muted">
              <p>010000, Астана, ул. Желтоксан, 16</p>
              <a href="mailto:info@halykpartiyasy.kz" className="inline-block hover:text-text-base transition-colors">
                info@halykpartiyasy.kz
              </a>
            </div>
          </div>

          {/* Col 4: Social */}
          <div>
            <h4 className="text-label font-medium text-text-base mb-4">Соцсети</h4>
            <div className="flex items-center gap-3">
              {socialIcons.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="w-10 h-10 rounded-none bg-surface-2 flex items-center justify-center text-text-muted hover:text-text-base transition-all duration-150 hover:bg-line"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-line py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-label text-text-muted">
            &copy; 2026 Народная партия Казахстана. Все права защищены.
          </p>
          <div className="flex gap-4 text-label text-text-muted">
            <button className="hover:text-text-base transition-colors">Политика конфиденциальности</button>
            <span>·</span>
            <button className="hover:text-text-base transition-colors">Условия использования</button>
            <span>·</span>
            <button className="hover:text-text-base transition-colors">Настройки cookies</button>
          </div>
        </div>
      </div>
      {/* Mobile spacer: clears fixed bottom nav (68px + safe area) */}
      <div className="md:hidden" style={{height:'calc(68px + env(safe-area-inset-bottom, 0px))'}} />
    </footer>
  );
}
