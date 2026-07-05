import { Link, useParams } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  Target, Handshake, BookOpen, Zap,
  Scale, Shield, Megaphone, Heart,
  Ear, BarChart3, RefreshCw, Landmark,
  Hospital, Monitor, Stethoscope, Pill,
  Trophy, Star, Award, Flag,
  Construction, Sprout, Home, TrendingUp,
} from 'lucide-react';
import { ScrollReveal } from '@/components/ScrollReveal';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import './ProjectDetailPage.css';

const projectData: Record<string, {
  title: string;
  subtitle: string;
  desc: string;
  image: string;
  stats: { num: string; label: string }[];
  values: { icon: LucideIcon; title: string; text: string }[];
  gallery: string[];
  team: { name: string; role: string; bio: string; photo: string }[];
}> = {
  'jas-orta': {
    title: 'Жас Орта',
    subtitle: 'Молодёжное крыло НПК',
    desc: '«Жас Орта» — это платформа для активной молодёжи Казахстана, объединяющая молодых лидеров, волонтёров и патриотов. Проект направлен на развитие молодёжного потенциала, поддержку студенческих инициатив и подготовку нового поколения политических лидеров.',
    image: '/images/projects/proj-jas-orta.png',
    stats: [
      { num: '5000+', label: 'активных участников' },
      { num: '20', label: 'региональных отделений' },
      { num: '150+', label: 'мероприятий в год' },
      { num: '2019', label: 'год основания' },
    ],
    values: [
      { icon: Target, title: 'Лидерство', text: 'Развитие лидерских качеств среди молодёжи через практическую деятельность.' },
      { icon: Handshake, title: 'Солидарность', text: 'Объединение молодых людей вокруг идей социальной справедливости.' },
      { icon: BookOpen, title: 'Образование', text: 'Политическая просветительская работа среди студентов и школьников.' },
      { icon: Zap, title: 'Действие', text: 'Реальные проекты, которые меняют жизнь молодых людей в регионах.' },
    ],
    gallery: ['/images/projects/proj-jas-orta.png', '/images/projects/proj-npk1.jpg', '/images/projects/proj-npk4.jpg', '/images/about/about-hero.jpg'],
    team: [
      { name: 'Айдос Нурланов', role: 'Координатор проекта', bio: 'Организатор молодёжных движений с 10-летним опытом.', photo: '/images/candidate-1.jpg' },
      { name: 'Дана Ермуханова', role: 'Руководитель направления', bio: 'Специалист по работе с молодёжью и студенческими организациями.', photo: '/images/candidate-2.jpg' },
      { name: 'Ерлан Нурбаев', role: 'Региональный представитель', bio: 'Координирует работу филиалов по всему Казахстану.', photo: '/images/candidate-3.jpg' },
    ],
  },
  'halyq-kompas': {
    title: 'HALYQ KOMPAS',
    subtitle: 'Народный компас',
    desc: '«Halyq Kompas» — социальная платформа, которая помогает гражданам ориентироваться в сложных жизненных ситуациях. Проект предоставляет юридическую помощь, социальную поддержку и консультации по вопросам трудовых прав, пенсий и социальных выплат.',
    image: '/images/projects/proj-kompas.jpg',
    stats: [
      { num: '10000+', label: 'консультаций' },
      { num: '50+', label: 'юристов в сети' },
      { num: '17', label: 'областей охвачено' },
      { num: '95%', label: 'успешных дел' },
    ],
    values: [
      { icon: Scale, title: 'Правосудие', text: 'Бесплатная юридическая помощь для социально-уязвимых слоёв населения.' },
      { icon: Shield, title: 'Защита', text: 'Защита трудовых прав граждан на всех уровнях.' },
      { icon: Megaphone, title: 'Голос', text: 'Помощь в обращениях к государственным органам.' },
      { icon: Heart, title: 'Забота', text: 'Социальная поддержка для тех, кто в ней больше всего нуждается.' },
    ],
    gallery: ['/images/projects/proj-kompas.jpg', '/images/about/about-parliament.jpg', '/images/about/about-people.jpg', '/images/about/about-astana.jpg'],
    team: [
      { name: 'Азамат Сатубалдин', role: 'Главный редактор', bio: 'Юрист с 15-летним стажем, эксперт по трудовому праву.', photo: '/images/candidate-1.jpg' },
      { name: 'Айгуль Танабаева', role: 'Руководитель направления', bio: 'Специалист по социальной защите населения.', photo: '/images/candidate-4.jpg' },
      { name: 'Дана Ермуханова', role: 'Координатор', bio: 'Организует работу юристов по всем регионам.', photo: '/images/candidate-2.jpg' },
    ],
  },
  'halyk-uni': {
    title: 'Халық үні',
    subtitle: 'Голос народа',
    desc: '«Халық үні» — это проект прямой связи между партией и народом. Граждане могут высказать своё мнение, поделиться проблемами и предложениями. Все обращения анализируются и становятся основой для партийных инициатив и законопроектов.',
    image: '/images/projects/proj-halyk-uni.png',
    stats: [
      { num: '25000+', label: 'обращений' },
      { num: '300+', label: 'инициатив реализовано' },
      { num: '20', label: 'филиалов связи' },
      { num: '2020', label: 'год запуска' },
    ],
    values: [
      { icon: Ear, title: 'Внимание', text: 'Каждое обращение гражданина услышано и учтено.' },
      { icon: BarChart3, title: 'Аналитика', text: 'Системный анализ общественного мнения по всей стране.' },
      { icon: RefreshCw, title: 'Обратная связь', text: 'Прозрачная отчётность о результатах работы.' },
      { icon: Landmark, title: 'Влияние', text: 'Народные предложения становятся законами.' },
    ],
    gallery: ['/images/projects/proj-halyk-uni.png', '/images/about/about-hero.jpg', '/images/about/about-parliament.jpg', '/images/projects/proj-npk4.jpg'],
    team: [
      { name: 'Ерлан Нурбаев', role: 'Руководитель проекта', bio: 'Политолог, эксперт по избирательным технологиям.', photo: '/images/candidate-3.jpg' },
      { name: 'Айжан Скакова', role: 'Аналитик', bio: 'Специалист по сбору и анализу общественного мнения.', photo: '/images/candidate-2.jpg' },
      { name: 'Айбек Паяев', role: 'Координатор регионов', bio: 'Связывает центральный аппарат с региональными филиалами.', photo: '/images/candidate-1.jpg' },
    ],
  },
  'medfusion': {
    title: 'Medfusion',
    subtitle: 'Здравоохранение',
    desc: '«Medfusion» — проект модернизации системы здравоохранения Казахстана. Платформа объединяет врачей, пациентов и государственные органы для создания доступной и качественной медицины. Основные направления: цифровизация, профилактика, поддержка медицинских работников.',
    image: '/images/projects/proj-medfusion.jpg',
    stats: [
      { num: '200+', label: 'клиник-партнёров' },
      { num: '5000+', label: 'врачей в сети' },
      { num: '100000+', label: 'пациентов' },
      { num: '15', label: 'цифровых сервисов' },
    ],
    values: [
      { icon: Hospital, title: 'Доступность', text: 'Медицинская помощь должна быть доступна каждому гражданину.' },
      { icon: Monitor, title: 'Цифровизация', text: 'Современные технологии для улучшения качества медицины.' },
      { icon: Stethoscope, title: 'Поддержка', text: 'Помощь и защита прав медицинских работников.' },
      { icon: Pill, title: 'Профилактика', text: 'Профилактические программы для населения.' },
    ],
    gallery: ['/images/projects/proj-medfusion.jpg', '/images/about/about-people.jpg', '/images/about/about-astana.jpg', '/images/about/about-parliament.jpg'],
    team: [
      { name: 'Ирина Смирнова', role: 'Медицинский директор', bio: 'Врач-эпидемиолог, депутат Мажилиса РК.', photo: '/images/candidate-2.jpg' },
      { name: 'Александр Милютин', role: 'IT-директор', bio: 'Разработчик медицинских информационных систем.', photo: '/images/candidate-1.jpg' },
      { name: 'Файзолла Каменов', role: 'Координатор', bio: 'Специалист по цифровизации здравоохранения.', photo: '/images/candidate-3.jpg' },
    ],
  },
  'nagrady': {
    title: 'Награды НПК',
    subtitle: 'Премии партии',
    desc: 'Премии и награды Народной партии Казахстана — это признание заслуг граждан, которые внесли значительный вклад в развитие социальной сферы, правозащитную деятельность и укрепление демократии. Проект включает несколько номинаций и ежегодную церемонию награждения.',
    image: '/images/projects/proj-nagrady.jpg',
    stats: [
      { num: '12', label: 'номинаций' },
      { num: '200+', label: 'лауреатов' },
      { num: '7', label: 'лет премии' },
      { num: '20', label: 'регионов' },
    ],
    values: [
      { icon: Trophy, title: 'Признание', text: 'Отмечаем тех, кто меняет страну к лучшему.' },
      { icon: Star, title: 'Вдохновение', text: 'Лауреаты становятся примером для миллионов.' },
      { icon: Award, title: 'Традиция', text: 'Ежегодная церемония — главное событие года.' },
      { icon: Flag, title: 'Патриотизм', text: 'Укрепляем чувство гордости за Казахстан.' },
    ],
    gallery: ['/images/projects/proj-nagrady.jpg', '/images/projects/proj-npk1.jpg', '/images/projects/proj-npk4.jpg', '/images/about/about-hero.jpg'],
    team: [
      { name: 'Жамбыл Ахметбеков', role: 'Председатель комитета', bio: 'Опытный политик, один из основателей партии.', photo: '/images/candidate-1.jpg' },
      { name: 'Газиз Кулахметов', role: 'Секретарь', bio: 'Организует церемонию награждения.', photo: '/images/candidate-3.jpg' },
      { name: 'Ерлан Смайлов', role: 'Координатор', bio: 'Работает с номинациями и кандидатами.', photo: '/images/candidate-4.jpg' },
    ],
  },
  'partiynye-initsiativy': {
    title: 'Партийные инициативы',
    subtitle: 'Программы развития',
    desc: 'Комплекс программ развития регионов Казахстана. Проект включает инфраструктурные программы, социальные проекты, экологические инициативы и поддержку местного самоуправления. Каждая программа разрабатывается с учётом потребностей конкретного региона.',
    image: '/images/projects/proj-npk1.jpg',
    stats: [
      { num: '45+', label: 'программ' },
      { num: '17', label: 'областей' },
      { num: '100+', label: 'проектов' },
      { num: '2021', label: 'год запуска' },
    ],
    values: [
      { icon: Construction, title: 'Инфраструктура', text: 'Строительство и реконструкция объектов по всей стране.' },
      { icon: Sprout, title: 'Экология', text: 'Экологические программы для чистого будущего.' },
      { icon: Home, title: 'Местное развитие', text: 'Поддержка инициатив на уровне городов и сёл.' },
      { icon: TrendingUp, title: 'Результат', text: 'Измеряемый эффект от каждой программы.' },
    ],
    gallery: ['/images/projects/proj-npk1.jpg', '/images/projects/proj-npk4.jpg', '/images/about/about-astana.jpg', '/images/about/about-parliament.jpg'],
    team: [
      { name: 'Сергей Решетников', role: 'Директор программ', bio: 'Экономист, разработчик региональных программ.', photo: '/images/candidate-3.jpg' },
      { name: 'Айбек Паяев', role: 'Координатор', bio: 'Связывает филиалы с центральным аппаратом.', photo: '/images/candidate-1.jpg' },
      { name: 'Айжан Скакова', role: 'Аналитик', bio: 'Оценивает эффективность программ развития.', photo: '/images/candidate-2.jpg' },
    ],
  },
};

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const p = projectData[slug || ''];

  if (!p) {
    return (
      <div className="npd" style={{ padding: '200px 40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 48, fontWeight: 800 }}>404</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 16 }}>Проект не найден</p>
        <Link to="/proekty" className="npd-cta__btn" style={{ marginTop: 32 }}>
          ← Все проекты
        </Link>
      </div>
    );
  }

  return (
    <div className="npd">
      {/* BREADCRUMBS */}
      <div className="npd-crumbs">
        <Breadcrumb>
          <BreadcrumbList style={{ color: 'rgba(255,255,255,.6)' }}>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Главная</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator style={{ color: 'rgba(255,255,255,.3)' }} />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/o-partii">О партии</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator style={{ color: 'rgba(255,255,255,.3)' }} />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/proekty">Проекты</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator style={{ color: 'rgba(255,255,255,.3)' }} />
            <BreadcrumbItem>
              <BreadcrumbPage style={{ color: 'rgba(255,255,255,.9)' }}>{p.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Back */}
      <div className="npd-back">
        <Link to="/proekty" className="npd-back__link">← Все проекты</Link>
      </div>

      {/* Hero */}
      <section className="npd-hero">
        <div>
          <span className="npd-hero__eyebrow">{p.subtitle}</span>
          <h1 className="npd-hero__title">{p.title}</h1>
        </div>
        <p className="npd-hero__desc">{p.desc}</p>
      </section>

      {/* Stats */}
      <section className="npd-stats">
        <ScrollReveal>
          <div className="npd-stats__header">
            <h2 className="npd-stats__title">Цифры, которые говорят сами за себя</h2>
          </div>
        </ScrollReveal>
        <div className="npd-stats__grid">
          {p.stats.map((s, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div className="npd-stat">
                <div className="npd-stat__num">{s.num}</div>
                <div className="npd-stat__label">{s.label}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="npd-values">
        <ScrollReveal>
          <div className="npd-values__header">
            <span className="npd-values__eyebrow">Ценности</span>
            <h2 className="npd-values__title">На чём строится проект</h2>
          </div>
        </ScrollReveal>
        <div className="npd-values__layout">
          <div className="npd-values__grid">
            {p.values.map((v, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="npd-value">
                  <div className="npd-value__icon"><v.icon size={20} strokeWidth={1.75} /></div>
                  <h4 className="npd-value__title">{v.title}</h4>
                  <p className="npd-value__text">{v.text}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal delay={0.2}>
            <div className="npd-values__img">
              <img src={p.image} alt={p.title} />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Gallery */}
      <section className="npd-gallery">
        <ScrollReveal>
          <h2 className="npd-gallery__title">Галерея</h2>
        </ScrollReveal>
        <div className="npd-gallery__grid">
          {p.gallery.map((src, i) => (
            <ScrollReveal key={i} delay={i * 0.08}>
              <div className="npd-gallery__item">
                <img src={src} alt="" loading="lazy" />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="npd-team">
        <ScrollReveal>
          <div className="npd-team__header">
            <span className="npd-team__eyebrow">Команда</span>
            <h2 className="npd-team__title">Люди за проектом</h2>
            <p className="npd-team__text">
              Профессиональная команда, которая ежедневно работает над реализацией проекта.
            </p>
          </div>
        </ScrollReveal>
        <div className="npd-team__grid">
          {p.team.map((m, i) => (
            <ScrollReveal key={i} delay={i * 0.1}>
              <div className="npd-member">
                <div className="npd-member__photo">
                  <img src={m.photo} alt={m.name} loading="lazy" />
                </div>
                <div className="npd-member__info">
                  <h4 className="npd-member__name">{m.name}</h4>
                  <p className="npd-member__role">{m.role}</p>
                  <p className="npd-member__bio">{m.bio}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="npd-cta">
        <ScrollReveal>
          <div className="npd-cta__inner">
            <h2 className="npd-cta__title">Поддержите проект</h2>
            <p className="npd-cta__text">
              Присоединяйтесь к инициативе — вместе мы сделаем больше.
            </p>
            <Link to="/vstupit" className="npd-cta__btn">Вступить в партию →</Link>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
