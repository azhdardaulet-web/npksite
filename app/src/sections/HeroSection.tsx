import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PrimaryButton } from '@/components/PrimaryButton';
import { OutlinedButton } from '@/components/OutlinedButton';
import { VerticalWordLoop } from '@/components/VerticalWordLoop';
import { useHomeBlocks } from '@/hooks/useHomeBlocks';
import gsap from 'gsap';

interface HomeHeroBlock {
  titleRu?: string;
  wordsRu?: string[];
  subtitleRu?: string;
  cta1LabelRu?: string; cta1Href?: string;
  cta2LabelRu?: string; cta2Href?: string;
  videoUrl?: string;
}

export function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const accentLineRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const { getBlock } = useHomeBlocks();
  const cms = getBlock<HomeHeroBlock>('home_hero');
  const titleLines = (cms?.titleRu?.trim() || 'Казахстан справедливых\nвозможностей начинается').split('\n');
  const words = cms?.wordsRu?.filter(Boolean).length ? cms.wordsRu.filter(Boolean) : ['С ВЫБОРА', 'С НПК', 'СЕГОДНЯ'];
  const subtitle = cms?.subtitleRu?.trim() || 'Народная партия — партия людей труда. Мы за справедливый шанс для каждого гражданина Казахстана.';
  const cta1Label = cms?.cta1LabelRu?.trim() || 'Вступить в партию';
  const cta1Href = cms?.cta1Href?.trim() || '/vstupit';
  const cta2Label = cms?.cta2LabelRu?.trim() || 'Программа партии';
  const cta2Href = cms?.cta2Href?.trim() || '/programma';
  const videoUrl = cms?.videoUrl?.trim() || '/herosectionanimation.webm';

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
      // WHY: Hierarchy — line → headline → loop → subtitle → CTAs reads as narrative
      tl.from(
        '.hero-reveal',
        { y: 60, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' },
        '-=0.2'
      );

      // WHAT: Video panel slides in from right
      // WHY: Split entrance reinforces the left/right spatial story
      tl.from('.hero-right', { opacity: 0, x: 80, duration: 1.1, ease: 'expo.out' }, '-=0.7');

      if (!reduced) {
        // WHAT: Red glow behind headline pulses slowly
        // WHY: Keeps the hero alive after load — static heroes feel like screenshots
        gsap.to(glowRef.current, {
          opacity: 0.18,
          scale: 1.12,
          duration: 4,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: 1.5,
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative grid grid-cols-1 lg:grid-cols-2 bg-coal"
    >
      {/* Grain overlay */}
      <div className="hero-grain pointer-events-none absolute inset-0 z-20 opacity-[0.03]" aria-hidden="true" />

      {/* LEFT — content */}
      {/* Left column centers content; lg:pt-[108px] clears the fixed header */}
      <div className="flex flex-col justify-center px-6 md:px-12 lg:px-16 xl:px-20 pt-[120px] pb-12 lg:pt-[108px] lg:pb-16 relative z-10">
        {/* Red glow behind headline */}
        <div
          ref={glowRef}
          className="absolute -left-20 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(219,31,38,0.55) 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        {/* Accent line */}
        <div ref={accentLineRef} className="h-[3px] bg-red mb-6" style={{ width: 0 }} />

        {/* Headline — static lines */}
        <h1 className="hero-reveal font-formular text-[32px] sm:text-[42px] md:text-[52px] lg:text-[48px] xl:text-[58px] font-bold text-white leading-[1.08] tracking-tight uppercase mb-1">
          {titleLines.map((line, i) => (
            <span key={i}>{line}{i < titleLines.length - 1 && <br />}</span>
          ))}
        </h1>

        {/* Animated word loop on the last line */}
        <div className="hero-reveal mb-8">
          <VerticalWordLoop
            words={words}
            interval={2600}
            className="text-[32px] sm:text-[42px] md:text-[52px] lg:text-[48px] xl:text-[58px] font-bold leading-[1.08] uppercase"
          />
        </div>

        {/* Subtitle */}
        <p className="hero-reveal text-[16px] md:text-[18px] font-light text-fog mb-10 max-w-[480px] leading-relaxed">
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

      {/* RIGHT — video panel
          WHAT: Natural aspect ratio (w-full h-auto), column self-starts so it doesn't stretch
          WHY:  4:3 video — no object-cover means zero edge cropping, full content visible */}
      <div className="hero-right lg:self-start lg:pt-[104px]">
        <video
          key={videoUrl}
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-auto block"
        />
      </div>
    </section>
  );
}
