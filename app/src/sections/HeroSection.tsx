import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PrimaryButton } from '@/components/PrimaryButton';
import { OutlinedButton } from '@/components/OutlinedButton';
import { useHomeBlocks } from '@/hooks/useHomeBlocks';
import gsap from 'gsap';

interface HomeHeroBlock {
  titleRu?: string;
  subtitleRu?: string;
  cta1LabelRu?: string; cta1Href?: string;
  cta2LabelRu?: string; cta2Href?: string;
  imageUrl?: string;
}

export function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const accentLineRef = useRef<HTMLDivElement>(null);

  const { getBlock } = useHomeBlocks();
  const cms = getBlock<HomeHeroBlock>('home_hero');
  const titleLines = (cms?.titleRu?.trim() || 'Официальный сайт\nНародной партии\nКазахстана').split('\n');
  const subtitle = cms?.subtitleRu?.trim() || 'Новости, программа партии, депутатская деятельность, общественная приёмная, филиалы, документы и контакты.';
  const cta1Label = cms?.cta1LabelRu?.trim() || 'Вступить в партию';
  const cta1Href = cms?.cta1Href?.trim() || '/vstupit';
  const cta2Label = cms?.cta2LabelRu?.trim() || 'Программа партии';
  const cta2Href = cms?.cta2Href?.trim() || '/programma';
  const imageUrl = cms?.imageUrl?.trim() || '/images/hero-banner.png';

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.15 });

      // WHAT: Accent line draws from 0 to full width before headline arrives
      // WHY: Creates anticipation — the red line "opens" space for the headline
      tl.fromTo(
        accentLineRef.current,
        { width: 0 },
        { width: 48, duration: 0.55, ease: 'expo.out' }
      );

      // WHAT: Left content staggered entrance
      // WHY: Hierarchy — line → headline → subtitle → CTAs reads as narrative
      tl.from(
        '.hero-reveal',
        { y: 60, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' },
        '-=0.2'
      );

      // WHAT: Banner image slides in from right
      // WHY: Split entrance reinforces the left/right spatial story
      tl.from('.hero-right', { opacity: 0, x: 80, duration: 1.1, ease: 'expo.out' }, '-=0.7');
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-bg overflow-hidden">
      {/* ── Desktop/tablet: изображение якорится к правому краю на всю высоту
             секции; его левая часть уходит под градиент цвета фона, поэтому
             при сужении экрана кадрируется пустая зона, а не люди. ── */}
      <div className="hero-right absolute inset-y-0 right-0 hidden md:block w-full pointer-events-none" aria-hidden="true">
        <img
          src={imageUrl}
          alt=""
          className="absolute right-0 top-0 h-full w-auto max-w-none"
        />
        {/* Градиент в цвет фона поверх левого края картинки: в светлой теме
            сливается с белым краем PNG, в тёмной — гасит его в тёмный фон.
            На md–lg картинка занимает почти всю ширину, поэтому градиент
            сильнее; на xl композиция как в макете — градиент легче. */}
        <div
          className="absolute inset-0 [background:linear-gradient(90deg,var(--bg)_42%,rgb(var(--bg-rgb)/0.82)_58%,rgb(var(--bg-rgb)/0)_80%)] lg:[background:linear-gradient(90deg,var(--bg)_34%,rgb(var(--bg-rgb)/0.8)_50%,rgb(var(--bg-rgb)/0)_72%)] xl:[background:linear-gradient(90deg,var(--bg)_26%,rgb(var(--bg-rgb)/0.8)_42%,rgb(var(--bg-rgb)/0)_64%)]"
        />
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 lg:px-16 xl:px-20 pt-[120px] pb-10 md:pt-[140px] md:pb-16 lg:pt-[160px] lg:pb-20 min-h-0 md:min-h-[520px] lg:min-h-[580px] xl:min-h-[640px] flex flex-col justify-center">
        <div className="max-w-[640px]">
          {/* Accent line */}
          <div ref={accentLineRef} className="h-[3px] bg-red mb-6" style={{ width: 0 }} />

          {/* Headline: последняя строка — акцентная красная в светлой теме,
              в тёмной остаётся основным цветом текста (как в макетах) */}
          <h1 className="hero-reveal font-formular text-[34px] sm:text-[44px] md:text-[48px] lg:text-[56px] xl:text-[64px] font-bold text-text-base leading-[1.08] tracking-tight mb-6">
            {titleLines.map((line, i) => (
              <span
                key={i}
                className={i === titleLines.length - 1 && titleLines.length > 1 ? 'text-accent-brand dark:text-text-base' : undefined}
              >
                {line}
                {i < titleLines.length - 1 && <br />}
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          <p className="hero-reveal text-[16px] md:text-[18px] font-light text-text-muted mb-10 max-w-[480px] leading-relaxed">
            {subtitle}
          </p>

          {/* CTAs */}
          <div className="hero-reveal flex flex-col sm:flex-row gap-3">
            <Link to={cta1Href}>
              <PrimaryButton className="sm:w-auto">{cta1Label}</PrimaryButton>
            </Link>
            <Link to={cta2Href}>
              <OutlinedButton className="sm:w-auto">{cta2Label}</OutlinedButton>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Mobile: картинка отдельным блоком; кадрируем только пустую
             белую зону слева (якорь к правому краю), люди не обрезаются ── */}
      <div className="hero-right md:hidden relative w-full aspect-[16/9] overflow-hidden">
        <img
          src={imageUrl}
          alt="Народная партия Казахстана"
          className="absolute right-0 top-0 h-full w-auto max-w-none"
        />
      </div>
    </section>
  );
}
