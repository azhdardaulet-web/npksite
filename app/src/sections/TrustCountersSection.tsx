import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CountUp } from '@/components/CountUp';
import { TextReveal } from '@/components/TextReveal';

gsap.registerPlugin(ScrollTrigger);

const counters = [
  { value: '30+', label: 'Лет на политической арене', target: 30, suffix: '+' },
  { value: '200тыс+', label: 'единомышленников', target: 200, suffix: 'тыс+' },
  { value: '20', label: 'Региональных отделений', target: 20, suffix: '' },
];

// Scattered collage positions — replicate Figma's Frame 27 layout
// Each photo is absolutely positioned; positions are % of container width/height
const collagePhotos = [
  { src: '/images/marquee-1.jpg', style: { left: '0%',   top: '5%',  width: '22%', height: '70%', objectPosition: 'top' } },
  { src: '/images/marquee-2.jpg', style: { left: '20%',  top: '0%',  width: '32%', height: '85%', objectPosition: 'center' } },
  { src: '/images/marquee-3.jpg', style: { left: '50%',  top: '10%', width: '18%', height: '65%', objectPosition: 'top' } },
  { src: '/images/marquee-4.jpg', style: { left: '66%',  top: '0%',  width: '20%', height: '75%', objectPosition: 'center' } },
  { src: '/images/marquee-5.jpg', style: { left: '84%',  top: '8%',  width: '16%', height: '60%', objectPosition: 'top' } },
  { src: '/images/candidate-1.jpg', style: { left: '5%',  top: '35%', width: '28%', height: '65%', objectPosition: 'center' } },
  { src: '/images/candidate-2.jpg', style: { left: '55%', top: '30%', width: '24%', height: '70%', objectPosition: 'top' } },
  { src: '/images/candidate-3.jpg', style: { left: '78%', top: '25%', width: '22%', height: '75%', objectPosition: 'center' } },
];

export function TrustCountersSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const sloganRef = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    // CountUp trigger
    const countTrigger = ScrollTrigger.create({
      trigger: el,
      start: 'top 65%',
      once: true,
      onEnter: () => setTriggered(true),
    });

    // Slogan reveal on scroll
    if (sloganRef.current) {
      gsap.fromTo(
        sloganRef.current.querySelectorAll('.slogan-line'),
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sloganRef.current,
            start: 'top 75%',
            once: true,
          },
        }
      );
    }

    return () => countTrigger.kill();
  }, []);

  return (
    <section ref={sectionRef} className="bg-black overflow-hidden">
      {/* ── Stats block ── */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-10 pt-20 md:pt-28 pb-16 md:pb-20">
        {/* Header row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 mb-14 md:mb-16">
          <TextReveal
            tag="h2"
            className="text-[32px] md:text-[40px] lg:text-[48px] font-bold text-white leading-[1.1]"
          >
            Народная партия в цифрах и фактах
          </TextReveal>
          <div className="flex items-end">
            <p className="text-[18px] md:text-[20px] font-light text-fog leading-relaxed">
              Три десятилетия служения. Сотни тысяч голосов. Двадцать регионов. Тринадцать кандидатов, готовых вернуть власть народу.
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 md:gap-8">
          {counters.map((c, i) => (
            <div key={c.label} className="border-l border-white/20 pl-5 md:pl-8">
              <div className="flex items-baseline gap-1 mb-1 flex-wrap">
                <CountUp
                  target={c.target}
                  triggered={triggered}
                  duration={2000 + i * 150}
                  className="text-[44px] sm:text-[56px] md:text-[72px] lg:text-[80px] font-bold text-white leading-none"
                />
                {c.suffix && (
                  <span className="text-[24px] sm:text-[32px] md:text-[40px] font-bold text-white leading-none">
                    {c.suffix}
                  </span>
                )}
              </div>
              <p className="text-[14px] md:text-[20px] lg:text-[26px] font-bold text-white/70 leading-tight">
                {c.label}
              </p>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
