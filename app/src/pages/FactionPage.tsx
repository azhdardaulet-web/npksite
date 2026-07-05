import { SectionHeader } from '@/components/SectionHeader';
import { ScrollReveal } from '@/components/ScrollReveal';

export function FactionPage() {
  return (
    <div className="pt-[104px] pb-16">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10">
        <SectionHeader light="Парламентская" bold="фракция" />
        <ScrollReveal>
          <div className="bg-cinder rounded-card p-6 md:p-10 border border-white/[0.08]">
            <h3 className="text-heading font-bold text-white mb-4">Фракция НПК в Мажилисе</h3>
            <div className="space-y-4 text-body text-silver">
              <p>Фракция Народной Партии Казахстана в Мажилисе Парламента Республики Казахстан представляет интересы избирателей и отстаивает принципы социальной справедливости.</p>
              <p>Депутаты фракции работают в ключевых комитетах парламента, включая комитеты по социальным вопросам, бюджету и финансам, а также по экономической реформе.</p>
              <p>За последний год фракция инициировала более 30 законопроектов, направленных на улучшение социальной защиты граждан, поддержку бизнеса и развитие регионов.</p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
