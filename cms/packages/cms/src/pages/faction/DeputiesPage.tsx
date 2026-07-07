import TeamPage from '@/pages/team/TeamPage';

// Депутаты фракции — та же модель TeamMember, что и «Команда»/«Руководство»,
// только group=FACTION. Показывается на сайте на /frakciya/sostav.
export default function DeputiesPage() {
  return <TeamPage group="FACTION" title="Депутаты фракции" />;
}
