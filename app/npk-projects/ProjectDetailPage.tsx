import { Link, useParams } from 'react-router-dom';
import { ScrollReveal } from '@/components/ScrollReveal';
import './ProjectDetailPage.css';

const projectData: Record<string, {
  title: string;
  subtitle: string;
  desc: string;
  image: string;
  stats: { num: string; label: string }[];
  values: { icon: string; title: string; text: string }[];
  gallery: string[];
  team: { name: string; role: string; bio: string; photo: string }[];
}> = {
  'jas-orta': {
    title: 'Жас Орта',
    subtitle: 'Молодёжное крыло НПК',
    desc: '«Жас Орта» — это платформа для активной молодёжи Казахстана, объединяющая молодых лидеров, волонтёров и патриотов. Проект направлен на развитие молодёжного потенциала, поддержку студенческих инициатив и подготовку нового поколения политических лидеров.',
    image: '/images/proj-jas-orta.png',
    stats: [
      { num: '5000+', label: 'активных участников' },
      { num: '20', label: 'региональных отделений' },
      { num: '150+', label: 'мероприятий в год' },
      { num: '2019', label: 'год основания' },
    ],
    values: [
      { icon: '🎯', title: 'Лидерство', text: 'Развитие лидерских качеств среди молодёжи через практическую деятельность.' },
      { icon: '🤝', title: 'Солидарность', text: 'Объединение молодых людей вокруг идей социальной справедливости.' },
      { icon: '📚', title: 'Образование', text: 'Политическая просветительская работа среди студентов и школьников.' },
      { icon: '⚡', title: 'Действие', text: 'Реальные проекты, которые меняют жизнь молодых людей в регионах.' },
    ],
    gallery: ['/images/proj-jas-orta.png', '/images/proj-npk1.jpg', '/images/proj-npk4.jpg', '/images/about-hero.jpg'],
    team: [
      { name: 'Айдос Нурланов', role: 'Координатор проекта', bio: 'Организатор молодёжных движений с 10-летним опытом.', photo: '/images/team-1.jpg' },
      { name: 'Дана Ермуханова', role: 'Руководитель направления', bio: 'Специалист по работе с молодёжью и студенческими организациями.', photo: '/images/team-2.jpg' },
      { name: 'Ерлан Нурбаев', role: 'Региональный представитель', bio: 'Координирует работу филиалов по всему Казахстану.', photo: '/images/team-3.jpg' },
    ],
  },
  'halyq-kompas': {
    title: 'HALYQ KOMPAS',
    subtitle: 'Народный компас',
    desc: '«Halyq Kompas» — социальная платформа, которая помогает гражданам ориентироваться в сложных жизненных ситуациях. Проект предоставляет юридическую помощь, социальную поддержку и консультации по вопросам трудовых прав, пенсий и социальных выплат.',
    image: '/images/proj-kompas.jpg',
    stats: [
      { num: '10000+', label: 'консультаций' },
      { num: '50+', label: 'юристов в сети' },
      { num: '17', label: 'областей охвачено' },
      { num: '95%', label: 'успешных дел' },
    ],
    values: [
      { icon: '⚖️', title: 'Правосудие', text: 'Бесплатная юридическая помощь для социально-уязвимых слоёв населения.' },
      { icon: '🛡️', title: 'Защита', text: 'Защита трудовых прав граждан на всех уровнях.' },
      { icon: '📢', title: 'Голос', text: 'Помощь в обращениях к государственным органам.' },
      { icon: '❤️', title: 'Забота', text: 'Социальная поддержка для тех, кто в ней больше всего нуждается.' },
    ],
    gallery: ['/images/proj-kompas.jpg', '/images/about-parliament.jpg', '/images/about-people.jpg', '/images/about-astana.jpg'],
    team: [
      { name: 'Азамат Сатубалдин', role: 'Главный редактор', bio: 'Юрист с 15-летним стажем, эксперт по трудовому праву.', photo: '/images/team-1.jpg' },
      { name: 'Айгуль Танабаева', role: 'Руководитель направления', bio: 'Специалист по социальной защите населения.', photo: '/images/team-4.jpg' },
      { name: 'Дана Ермуханова', role: 'Координатор', bio: 'Организует работу юристов по всем регионам.', photo: '/images/team-2.jpg' },
    ],
  },
  'halyk-uni': {
    title: 'Халық үні',
    subtitle: 'Голос народа',
    desc: '«Халық үні» — это проект прямой связи между партией и народом. Граждане могут высказать своё мнение, поделиться проблемами и предложениями. Все обращения анализируются и становятся основой для партийных инициатив и законопроектов.',
    image: '/images/proj-halyk-uni.png',
    stats: [
      { num: '25000+', label: 'обращений' },
      { num: '300+', label: 'инициатив реализовано' },
      { num: '20', label: 'филиалов связи' },
      { num: '2020', label: 'год запуска' },
    ],
    values: [
      { icon: '👂', title: 'Внимание', text: 'Каждое обращение гражданина услышано и учтено.' },
      { icon: '📊', title: 'Аналитика', text: 'Системный анализ общественного мнения по всей стране.' },
      { icon: '🔄', title: 'Обратная связь', text: 'Прозрачная отчётность о результатах работы.' },
      { icon: '🏛️', title: 'Влияние', text: 'Народные предложения становятся законами.' },
    ],
    gallery: ['/images/proj-halyk-uni.png', '/images/about-hero.jpg', '/images/about-parliament.jpg', '/images/proj-npk4.jpg'],
    team: [
      { name: 'Ерлан Нурбаев', role: 'Руководитель проекта', bio: 'Политолог, эксперт по избирательным технологиям.', photo: '/images/team-3.jpg' },
      { name: 'Айжан Скакова', role: 'Аналитик', bio: 'Специалист по сбору и анализу общественного мнения.', photo: '/images/team-2.jpg' },
      { name: 'Айбек Паяев', role: 'Координатор регионов', bio: 'Связывает центральный аппарат с региональными филиалами.', photo: '/images/team-1.jpg' },
    ],
  },
  'medfusion': {
    title: 'Medfusion',
    subtitle: 'Здравоохранение',
    desc: '«Medfusion» — проект модернизации системы здравоохранения Казахстана. Платформа объединяет врачей, пациентов и государственные органы для создания доступной и качественной медицины. Основные направления: цифровизация, профилактика, поддержка медицинских работников.',
    image: '/images/proj-medfusion.jpg',
    stats: [
      { num: '200+', label: 'клиник-партнёров' },
      { num: '5000+', label: 'врачей в сети' },
      { num: '100000+', label: 'пациентов' },
      { num: '15', label: 'цифровых сервисов' },
    ],
    values: [
      { icon: '🏥', title: 'Доступность', text: 'Медицинская помощь должна быть доступна каждому гражданину.' },
      { icon: '💻', title: 'Цифровизация', text: 'Современные технологии для улучшения качества медицины.' },
      { icon: '👩‍⚕️', title: 'Поддержка', text: 'Помощь и защита прав медицинских работников.' },
      { icon: '💊', title: 'Профилактика', text: 'Профилактические программы для населения.', },
    ],
    gallery: ['/images/proj-medfusion.jpg', '/images/about-people.jpg', '/images/about-astana.jpg', '/images/about-parliament.jpg'],
    team: [
      { name: 'Ирина Смирнова', role: 'Медицинский директор', bio: 'Врач-эпидемиолог, депутат Мажилиса РК.', photo: '/images/team-2.jpg' },
      { name: 'Александр Милютин', role: 'IT-директор', bio: 'Разработчик медицинских информационных систем.', photo: '/images/team-1.jpg' },
      { name: 'Файзолла Каменов', role: 'Координатор', bio: 'Специалист по цифровизации здравоохранения.', photo: '/images/team-3.jpg' },
    ],
  },
  'nagrady': {
    title: 'Награды НПК',
    subtitle: 'Премии партии',
    desc: 'Премии и награды Народной партии Казахстана — это признание заслуг граждан, которые внесли значительный вклад в развитие социальной сферы, правозащитную деятельность и укрепление демократии. Проект включает несколько номинаций и ежегодную церемонию награждения.',
    image: '/images/proj-nagrady.jpg',
    stats: [
      { num: '12', label: 'номинаций' },
      { num: '200+', label: 'лауреатов' },
      { num: '7', label: 'лет премии' },
      { num: '20', label: 'регионов' },
    ],
    values: [
      { icon: '🏆', title: 'Признание', text: 'Отмечаем тех, кто меняет страну к лучшему.' },
      { icon: '⭐', title: 'Вдохновение', text: 'Лауреаты становятся примером для миллионов.' },
      { icon: '🎖️', title: 'Традиция', text: 'Ежегодная церемония — главное событие года.' },
      { icon: '🇰🇿', title: 'Патриотизм', text: 'Укрепляем чувство гордости за Казахстан.' },
    ],
    gallery: ['/images/proj-nagrady.jpg', '/images/proj-npk1.jpg', '/images/proj-npk4.jpg', '/images/about-hero.jpg'],
    team: [
      { name: 'Жамбыл Ахметбеков', role: 'Председатель комитета', bio: 'Опытный политик, один из основателей партии.', photo: '/images/team-1.jpg' },
      { name: 'Газиз Кулахметов', role: 'Секретарь', bio: 'Организует церемонию награждения.', photo: '/images/team-3.jpg' },
      { name: 'Ерлан Смайлов', role: 'Координатор', bio: 'Работает с номинациями и кандидатами.', photo: '/images/team-4.jpg' },
    ],
  },
  'partiynye-initsiativy': {
    title: 'Партийные инициативы',
    subtitle: 'Программы развития',
    desc: 'Комплекс программ развития регионов Казахстана. Проект включает инфраструктурные программы, социальные проекты, экологические инициативы и поддержку местного самоуправления. Каждая программа разрабатывается с учётом потребностей конкретного региона.',
    image: '/images/proj-npk1.jpg',
    stats: [
      { num: '45+', label: 'программ' },
      { num: '17', label: 'областей' },
      { num: '100+', label: 'проектов' },
      { num: '2021', label: 'год запуска' },
    ],
    values: [
      { icon: '🏗️', title: 'Инфраструктура', text: 'Строительство и реконструкция объектов по всей стране.' },
      { icon: '🌱', title: 'Экология', text: 'Экологические программы для чистого будущего.' },
      { icon: '🏘️', title: 'Местное развитие', text: 'Поддержка инициатив на уровне городов и сёл.' },
      { icon: '📈', title: 'Результат', text: 'Измеряемый эффект от каждой программы.' },
    ],
    gallery: ['/images/proj-npk1.jpg', '/images/proj-npk4.jpg', '/images/about-astana.jpg', '/images/about-parliament.jpg'],
    team: [
      { name: 'Сергей Решетников', role: 'Директор программ', bio: 'Экономист, разработчик региональных программ.', photo: '/images/team-3.jpg' },
      { name: 'Айбек Паяев', role: 'Координатор', bio: 'Связывает филиалы с центральным аппаратом.', photo: '/images/team-1.jpg' },
      { name: 'Айжан Скакова', role: 'Аналитик', bio: 'Оценивает эффективность программ развития.', photo: '/images/team-2.jpg' },
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
                  <div className="npd-value__icon">{v.icon}</div>
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
