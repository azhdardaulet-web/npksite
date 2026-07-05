import { HeroSection } from '@/sections/HeroSection';
import { TickerSection } from '@/sections/TickerSection';
import { TrustCountersSection } from '@/sections/TrustCountersSection';
import { StatsVideoSection } from '@/sections/StatsVideoSection';
import { CandidatesSection } from '@/sections/CandidatesSection';
import { ProgramSection } from '@/sections/ProgramSection';
import { ReceptionSection } from '@/sections/ReceptionSection';
import { NewsSection } from '@/sections/NewsSection';
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
      <ReceptionSection />
      <CandidatesSection />
      <ProgramSection />
      <BranchMapSection />
      <JoinSection />
      <ContactSection />
    </>
  );
}
