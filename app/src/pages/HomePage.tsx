import { HeroSection } from '@/sections/HeroSection';
import { TickerSection } from '@/sections/TickerSection';
import { TrustCountersSection } from '@/sections/TrustCountersSection';
import { StatsVideoSection } from '@/sections/StatsVideoSection';
import { CandidatesSection } from '@/sections/CandidatesSection';
import { ProgramSection } from '@/sections/ProgramSection';
import { ReceptionSection } from '@/sections/ReceptionSection';
import { NewsSection, NarodnoeMediaSection } from '@/sections/NewsSection';
import { BranchMapSection } from '@/sections/BranchMapSection';
import { JoinSection } from '@/sections/JoinSection';
import { ContactSection } from '@/sections/ContactSection';

export function HomePage() {
  return (
    <>
      <HeroSection />
      <TickerSection />
      <TrustCountersSection />
      <StatsVideoSection />
      <NewsSection />
      <section className="bg-[#0a0a0a] border-t border-white/[0.07] pb-16 md:pb-24">
        <div className="max-w-[1280px] mx-auto px-4 md:px-10">
          <NarodnoeMediaSection />
        </div>
      </section>
      <ReceptionSection />
      <CandidatesSection />
      <ProgramSection />
      <BranchMapSection />
      <JoinSection />
      <ContactSection />
    </>
  );
}
