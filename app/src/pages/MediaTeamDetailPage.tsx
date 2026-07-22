import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { getMediaTeamMember, mediaTeam } from '@/lib/mediaTeam';
import './NarodnoeMediaPage.css';

export function MediaTeamDetailPage() {
  const { slug = '' } = useParams();
  const { language } = useLanguage();
  const isKz = language === 'kz';
  const member = getMediaTeamMember(slug);

  if (!member) return <Navigate to="/narodnoe-media" replace />;

  const index = mediaTeam.findIndex((item) => item.slug === member.slug);
  const next = mediaTeam[(index + 1) % mediaTeam.length] ?? mediaTeam[0];
  const name = isKz ? member.nameKz : member.nameRu;
  const role = isKz ? member.roleKz : member.roleRu;
  const bio = isKz ? member.bioKz : member.bioRu;

  return (
    <article className="npm-profile">
      <div className="npm-profile__inner">
        <Link className="npm-profile__back" to="/narodnoe-media">
          <ArrowLeft size={16} /> {isKz ? 'Халық медиасының тұлғалары' : 'Лица народного медиа'}
        </Link>

        <div className="npm-profile__hero">
          <div className="npm-profile__photo">
            <img src={member.image} alt={name} decoding="async" style={{ objectPosition: member.imagePosition }} />
          </div>
          <div className="npm-profile__content">
            <span>{role}</span>
            <h1>{name}</h1>
            <div className="npm-profile__bio">
              {bio.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </div>
        </div>

        <Link className="npm-profile__next" to={`/narodnoe-media/${next.slug}`}>
          <span>{isKz ? 'Келесі тұлға' : 'Следующий профиль'}</span>
          <strong>{isKz ? next.nameKz : next.nameRu}</strong>
          <ArrowRight size={22} />
        </Link>
      </div>
    </article>
  );
}
