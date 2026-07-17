import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ScrollReveal } from '@/components/ScrollReveal';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import './ProjectsPage.css';

const projects = [
  {
    slug: 'jas-orta',
    title: 'Жас Орта',
    desc: 'Молодёжное крыло НПК',
    image: '/images/projects/proj-jas-orta.png',
    badge: 'active',
    size: 'lg',
  },
  {
    slug: 'halyq-kompas',
    title: 'HALYQ KOMPAS',
    desc: 'Народный компас — социальная платформа',
    image: '/images/projects/proj-kompas.jpg',
    badge: 'active',
    size: 'tall',
  },
  {
    slug: 'halyk-uni',
    title: 'Халық үні',
    desc: 'Голос народа',
    image: '/images/projects/proj-halyk-uni.png',
    badge: 'legend',
    size: 'normal',
  },
  {
    slug: 'medfusion',
    title: 'Medfusion',
    desc: 'Здравоохранение и медицина',
    image: '/images/projects/proj-medfusion.jpg',
    badge: 'active',
    size: 'wide',
  },
  {
    slug: 'nagrady',
    title: 'Награды НПК',
    desc: 'Премии и награды партии',
    image: '/images/projects/proj-nagrady.jpg',
    badge: 'legend',
    size: 'normal',
  },
  {
    slug: 'partiynye-initsiativy',
    title: 'Партийные инициативы',
    desc: 'Программы развития регионов',
    image: '/images/projects/proj-npk1.jpg',
    badge: 'active',
    size: 'lg',
  },
];

const filters = [
  { key: 'all', label: 'Все' },
  { key: 'active', label: 'Активные' },
  { key: 'legend', label: 'Легендарные' },
];

export function ProjectsPage() {
  const [activeFilter, setActiveFilter] = useState('all');

  const filtered = activeFilter === 'all'
    ? projects
    : projects.filter((p) => p.badge === activeFilter);

  return (
    <div className="npp">
      {/* BREADCRUMBS */}
      <div className="npp-crumbs">
        <Breadcrumb>
          <BreadcrumbList style={{ color: 'var(--text-muted)' }}>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Главная</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator style={{ color: 'var(--text-muted)' }} />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/o-partii">О партии</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator style={{ color: 'var(--text-muted)' }} />
            <BreadcrumbItem>
              <BreadcrumbPage style={{ color: 'var(--text)' }}>Проекты</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <section className="npp-hero">
        <div className="npp-hero__label">Проекты НПК</div>
        <h1 className="npp-hero__title">
          Проекты, которые<br />
          <span style={{ color: '#db1f26' }}>меняют страну</span>
        </h1>
        <p className="npp-hero__text">
          Народная партия Казахстана реализует десятки социальных, образовательных
          и политических проектов по всей стране. Каждый — шаг к справедливому Казахстану.
        </p>
        <div className="npp-filters">
          {filters.map((f) => (
            <button
              key={f.key}
              className={`npp-filter ${activeFilter === f.key ? 'npp-filter--active' : ''}`}
              onClick={() => setActiveFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      <section className="npp-grid">
        {filtered.map((p, i) => (
          <ScrollReveal
            key={p.slug}
            delay={i * 0.08}
            className={`npp-cell npp-cell--${p.size}`}
          >
            <Link to={`/proekty/${p.slug}`} className="npp-card">
              <div className="npp-card__img">
                <img src={p.image} alt={p.title} loading="lazy" />
                <div className="npp-card__overlay" />
                <span className={`npp-card__badge npp-card__badge--${p.badge}`}>
                  {p.badge === 'active' ? 'Активный' : 'Легендарный'}
                </span>
                <span className="npp-card__arrow">→</span>
              </div>
              <div className="npp-card__info">
                <h3 className="npp-card__title">{p.title}</h3>
                <p className="npp-card__desc">{p.desc}</p>
              </div>
              <span className="npp-card__ghost">{p.title[0]}</span>
            </Link>
          </ScrollReveal>
        ))}
      </section>
    </div>
  );
}
