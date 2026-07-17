import { Link } from 'react-router-dom';

const navLinks = [
  { label: 'О партии', href: '/o-partii' },
  { label: 'Фракция', href: '/frakciya' },
  { label: 'Программа', href: '/programma' },
  { label: 'Общественная приёмная', href: '/priemnaya' },
  { label: 'Медиа', href: '/media' },
  { label: 'Контакты', href: '/kontakty' },
];

const socialIcons = [
  { name: 'YouTube', color: '#FF0000' },
  { name: 'Instagram', color: '#E4405F' },
  { name: 'TikTok', color: 'var(--text)' },
  { name: 'Telegram', color: '#0088cc' },
  { name: 'Facebook', color: '#1877F2' },
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
              <p>Астана, ул. Желтоксан, 16</p>
              <p>Алматы, пр. Абая, 42</p>
              <p>+7 700 088 19 17</p>
              <p>info@halykpartiyasy.kz</p>
            </div>
          </div>

          {/* Col 4: Social */}
          <div>
            <h4 className="text-label font-medium text-text-base mb-4">Соцсети</h4>
            <div className="flex items-center gap-3">
              {socialIcons.map((icon) => (
                <button
                  key={icon.name}
                  aria-label={icon.name}
                  className="w-10 h-10 rounded-none bg-surface-2 flex items-center justify-center text-text-muted hover:text-text-base transition-all duration-150 hover:bg-line"
                >
                  <span className="text-xs font-medium" style={{ color: icon.color }}>
                    {icon.name[0]}
                  </span>
                </button>
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
