import { Routes, Route } from 'react-router-dom';
import { PageLayout } from '@/components/PageLayout';
import { HomePage } from '@/pages/HomePage';
import { AboutPage } from '@/pages/AboutPage';
import { ProgramPage } from '@/pages/ProgramPage';
import { CandidatesPage } from '@/pages/CandidatesPage';
import { MediaPage } from '@/pages/MediaPage';
import { ReceptionPage } from '@/pages/ReceptionPage';
import { ContactsPage } from '@/pages/ContactsPage';
import { JoinPage } from '@/pages/JoinPage';
import { BranchesPage } from '@/pages/BranchesPage';
import { NewsPage } from '@/pages/NewsPage';
import { LeadershipPage } from '@/pages/LeadershipPage';
import { FactionPage } from '@/pages/FactionPage';
import { PressKitPage } from '@/pages/PressKitPage';
import { SearchPage } from '@/pages/SearchPage';
import { ShopPage } from '@/pages/ShopPage';
import { NewsArticlePage } from '@/pages/NewsArticlePage';
import { SmiPage } from '@/pages/SmiPage';
import { NarodnoeMediaPage } from '@/pages/NarodnoeMediaPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { ProjectDetailPage } from '@/pages/ProjectDetailPage';
import { FactionCompositionPage } from '@/pages/FactionCompositionPage';
import { FactionRequestsPage } from '@/pages/FactionRequestsPage';
import { VerifyPage } from '@/pages/VerifyPage';

function App() {
  return (
    <Routes>
      <Route element={<PageLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/o-partii" element={<AboutPage />} />
        <Route path="/o-partii/:sub" element={<AboutPage />} />
        <Route path="/o-partii/istoriya" element={<HistoryPage />} />
        <Route path="/proekty" element={<ProjectsPage />} />
        <Route path="/proekty/:slug" element={<ProjectDetailPage />} />
        <Route path="/programma" element={<ProgramPage />} />
        <Route path="/kandidaty" element={<CandidatesPage />} />
        <Route path="/media" element={<MediaPage />} />
        <Route path="/priemnaya" element={<ReceptionPage />} />
        <Route path="/kontakty" element={<ContactsPage />} />
        <Route path="/vstupit" element={<JoinPage />} />
        <Route path="/filialy" element={<BranchesPage />} />
        <Route path="/novosti" element={<NewsPage />} />
        <Route path="/rukovodstvo" element={<LeadershipPage />} />
        <Route path="/frakciya" element={<FactionPage />} />
        <Route path="/frakciya/sostav" element={<FactionCompositionPage />} />
        <Route path="/frakciya/zaprosy" element={<FactionRequestsPage />} />
        <Route path="/mediakits" element={<PressKitPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/magazin" element={<ShopPage />} />
        <Route path="/novosti/:slug" element={<NewsArticlePage />} />
        <Route path="/smi-o-nas" element={<SmiPage />} />
        <Route path="/narodnoe-media" element={<NarodnoeMediaPage />} />
        <Route path="/verify/:id" element={<VerifyPage />} />
      </Route>
    </Routes>
  );
}

export default App;
