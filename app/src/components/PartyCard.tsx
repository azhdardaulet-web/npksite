import { Calendar, IdCard, User } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import kzLogo from '../../../content/Logo/kz logo.svg';
import ruLogo from '../../../content/Logo/ru logo.svg';
import './PartyCard.css';

export type PartyCardLanguage = 'kz' | 'ru';

export interface PartyCardProps {
  lang?: PartyCardLanguage;
  memberNumber?: string;
  fullName?: string;
  joinDate?: string;
  qrValue?: string;
}

const DEFAULTS: Record<PartyCardLanguage, Required<Omit<PartyCardProps, 'lang' | 'qrValue'>>> = {
  kz: {
    fullName: 'Атыбаров Есімжан Тектібайұлы',
    memberNumber: '01634646',
    joinDate: '01.01.2026',
  },
  ru: {
    fullName: 'Атыбаров Есимжан Тектибаевич',
    memberNumber: '01634646',
    joinDate: '01.01.2026',
  },
};

const COPY = {
  kz: {
    title: 'Партиялық билет',
    number: 'Мүшелік нөмірі',
    name: 'Аты-жөні',
    date: 'Партияға қабылданған күні:',
    qr: 'Түпнұсқалығын тексеру үшін QR кодты сканерлеңіз',
  },
  ru: {
    title: 'Партийный билет',
    number: 'Номер члена партии',
    name: 'ФИО',
    date: 'Дата вступления в партию:',
    qr: 'Отсканируйте QR-код для проверки подлинности',
  },
} as const;

interface PartyCardRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}

function PartyCardRow({ icon, label, value, valueClassName = '' }: PartyCardRowProps) {
  return (
    <div className="party-card__row">
      <span className="party-card__icon" aria-hidden="true">{icon}</span>
      <div className="party-card__row-copy">
        <span className="party-card__label">{label}</span>
        <span className={`party-card__value ${valueClassName}`}>{value}</span>
      </div>
    </div>
  );
}

export function PartyCard({
  lang = 'kz',
  memberNumber,
  fullName,
  joinDate,
  qrValue = 'https://halykpartiyasy.kz/verify/demo-member',
}: PartyCardProps) {
  const defaults = DEFAULTS[lang];
  const copy = COPY[lang];
  const resolvedNumber = memberNumber ?? defaults.memberNumber;
  const resolvedName = fullName ?? defaults.fullName;
  const resolvedDate = joinDate ?? defaults.joinDate;

  return (
    <article className="party-card" lang={lang === 'kz' ? 'kk' : 'ru'}>
      <header className="party-card__header">
        <img
          src={lang === 'kz' ? kzLogo : ruLogo}
          alt={lang === 'kz' ? 'Қазақстан Халық партиясы' : 'Народная партия Казахстана'}
          className="party-card__logo"
        />
      </header>

      <h2 className="party-card__title">{copy.title}</h2>

      <div className="party-card__content">
        <div className="party-card__details">
          <PartyCardRow
            icon={<IdCard />}
            label={copy.number}
            value={<><span className="party-card__number-sign">№</span> {resolvedNumber}</>}
            valueClassName="party-card__value--accent party-card__value--number"
          />
          <PartyCardRow
            icon={<User />}
            label={copy.name}
            value={resolvedName}
            valueClassName="party-card__value--name"
          />
          <PartyCardRow
            icon={<Calendar />}
            label={copy.date}
            value={resolvedDate}
            valueClassName="party-card__value--accent"
          />
        </div>

        <div className="party-card__qr-block">
          <div className="party-card__qr">
            <QRCodeSVG
              value={qrValue}
              size={160}
              level="M"
              marginSize={0}
              bgColor="#ffffff"
              fgColor="#111111"
              title={copy.qr}
            />
          </div>
          <p>{copy.qr}</p>
        </div>
      </div>
    </article>
  );
}
