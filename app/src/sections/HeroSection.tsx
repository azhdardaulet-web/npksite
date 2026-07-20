import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PrimaryButton } from '@/components/PrimaryButton';
import { OutlinedButton } from '@/components/OutlinedButton';
import { useHomeBlocks } from '@/hooks/useHomeBlocks';
import { useT } from '@/i18n/useT';
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

  const t = useT();
  const { getBlock } = useHomeBlocks();
  const cms = getBlock<HomeHeroBlock>('home_hero');
  const titleLines = (cms?.titleRu?.trim() || t('home.hero.title')).split('\n');
  const subtitle = cms?.subtitleRu?.trim() || t('home.hero.subtitle');
  const cta1Label = cms?.cta1LabelRu?.trim() || t('home.hero.join');
  const cta1Href = cms?.cta1Href?.trim() || '/vstupit';
  const cta2Label = cms?.cta2LabelRu?.trim() || t('home.hero.program');
  const cta2Href = cms?.cta2Href?.trim() || '/programma';
  // WHY: широкое кадрирование (mobileherosec) используется и на десктопе тоже —
  // узкий вариант (desktopherosec) при object-cover в высокой колонке обрезал
  // людей по верху/краям, широкий вписывается без обрезки.
  const desktopImageUrl = cms?.imageUrl?.trim() || '/images/hero-banner-mobile.png';
  const mobileImageUrl = cms?.imageUrl?.trim() || '/images/hero-banner-mobile.png';

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
    <section ref={sectionRef} className="relative bg-bg overflow-hidden md:pt-[110px]">
      {/* ── Сплит 40/60: текст слева, фото справа. Колонки растянуты на одну
             высоту (items-stretch): фото заполняет всю высоту секции целиком
             (object-cover), высоту секции задаёт текстовая колонка. ── */}
      <div className="flex flex-col md:flex-row md:items-stretch">
        {/* ── Text column ── */}
        <div className="relative z-10 w-full md:w-2/5 flex flex-col justify-center px-6 md:pl-12 md:pr-8 lg:pl-16 lg:pr-10 xl:pl-20 xl:pr-12 pt-[48px] pb-[76px] md:pt-[76px] md:pb-[76px]">
          <div className="max-w-[520px]">
            {/* Accent line */}
            <div ref={accentLineRef} className="h-[3px] bg-red mb-6" style={{ width: 0 }} />

            {/* Headline: последняя строка — акцентная красная в светлой теме,
                в тёмной остаётся основным цветом текста (как в макетах) */}
            <h1 className="hero-reveal font-formular text-[28px] sm:text-[34px] md:text-[36px] lg:text-[42px] xl:text-[46px] font-bold text-text-base leading-[1.1] tracking-tight mb-6">
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

        {/* ── Photo column: 60% ширины, фото заполняет всю высоту секции ── */}
        <div className="hero-right hidden md:block md:w-3/5 relative overflow-hidden">
          <img
            src={desktopImageUrl}
            alt="Народная партия Казахстана"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>

      {/* ── Mobile: картинка отдельным блоком под текстом, во всю ширину, целиком ── */}
      <div className="hero-right md:hidden w-full">
        <img
          src={mobileImageUrl}
          alt="Народная партия Казахстана"
          className="w-full h-auto"
        />
      </div>
    </section>
  );
}
