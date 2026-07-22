import { lazy, Suspense } from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
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
import { BranchDetailPage } from '@/pages/BranchDetailPage';
import { NewsPage } from '@/pages/NewsPage';
import { LeadershipPage } from '@/pages/LeadershipPage';
import { LeadershipDetailPage } from '@/pages/LeadershipDetailPage';
import { FactionPage } from '@/pages/FactionPage';
import { PressKitPage } from '@/pages/PressKitPage';
import { SearchPage } from '@/pages/SearchPage';
import { ShopPage } from '@/pages/ShopPage';
import { NewsArticlePage } from '@/pages/NewsArticlePage';
import { SmiPage } from '@/pages/SmiPage';
import { NarodnoeMediaPage } from '@/pages/NarodnoeMediaPage';
import { MediaTeamDetailPage } from '@/pages/MediaTeamDetailPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { UstavPage } from '@/pages/UstavPage';
import { ProjectsPage } from '@/pages/ProjectsPage';
import { ProjectDetailPage } from '@/pages/ProjectDetailPage';
import { FactionRequestsPage } from '@/pages/FactionRequestsPage';
import { FactionRequestDetailPage } from '@/pages/FactionRequestDetailPage';
import { VerifyPage } from '@/pages/VerifyPage';
import { VisiblePageRoute } from '@/components/VisiblePageRoute';

const DevPartyCardPreviewPage = import.meta.env.DEV
  ? lazy(async () => {
      const module = await import('@/pages/PartyCardPreviewPage');
      return { default: module.PartyCardPreviewPage };
    })
  : null;

function App() {
  return (
    <Routes>
      {DevPartyCardPreviewPage ? (
        <Route
          path="/dev/partbilet"
          element={<Suspense fallback={null}><DevPartyCardPreviewPage /></Suspense>}
        />
      ) : null}
      <Route element={<PageLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/o-partii" element={<VisiblePageRoute slug="about"><AboutPage /></VisiblePageRoute>} />
        <Route path="/o-partii/:sub" element={<VisiblePageRoute slug="about"><AboutPage /></VisiblePageRoute>} />
        <Route path="/o-partii/istoriya" element={<VisiblePageRoute slug="history"><HistoryPage /></VisiblePageRoute>} />
        <Route path="/o-partii/ustav" element={<VisiblePageRoute slug="ustav"><UstavPage /></VisiblePageRoute>} />
        <Route path="/ustav" element={<VisiblePageRoute slug="ustav"><UstavPage /></VisiblePageRoute>} />
        <Route path="/proekty" element={<VisiblePageRoute slug="projects"><ProjectsPage /></VisiblePageRoute>} />
        <Route path="/proekty/:slug" element={<VisiblePageRoute slug="projects"><ProjectDetailPage /></VisiblePageRoute>} />
        <Route path="/programma" element={<VisiblePageRoute slug="program"><ProgramPage /></VisiblePageRoute>} />
        <Route path="/kandidaty" element={<VisiblePageRoute slug="candidates"><CandidatesPage /></VisiblePageRoute>} />
        <Route path="/media" element={<VisiblePageRoute slug="media"><MediaPage /></VisiblePageRoute>} />
        <Route path="/priemnaya" element={<VisiblePageRoute slug="priemnaya"><ReceptionPage /></VisiblePageRoute>} />
        <Route path="/kontakty" element={<VisiblePageRoute slug="contacts"><ContactsPage /></VisiblePageRoute>} />
        <Route path="/vstupit" element={<VisiblePageRoute slug="join"><JoinPage /></VisiblePageRoute>} />
        <Route path="/filialy" element={<VisiblePageRoute slug="branches"><BranchesPage /></VisiblePageRoute>} />
        <Route path="/filialy/:slug" element={<VisiblePageRoute slug="branches"><BranchDetailPage /></VisiblePageRoute>} />
        <Route path="/novosti" element={<VisiblePageRoute slug="news"><NewsPage /></VisiblePageRoute>} />
        <Route path="/rukovodstvo" element={<VisiblePageRoute slug="leadership"><LeadershipPage /></VisiblePageRoute>} />
        <Route path="/rukovodstvo/:slug" element={<VisiblePageRoute slug="leadership"><LeadershipDetailPage /></VisiblePageRoute>} />
        <Route path="/frakciya" element={<VisiblePageRoute slug="faction"><FactionPage /></VisiblePageRoute>} />
        <Route path="/frakciya/sostav/*" element={<Navigate to="/frakciya" replace />} />
        <Route path="/frakciya/zaprosy" element={<VisiblePageRoute slug="faction"><FactionRequestsPage /></VisiblePageRoute>} />
        <Route path="/frakciya/zaprosy/:slug" element={<VisiblePageRoute slug="faction"><FactionRequestDetailPage /></VisiblePageRoute>} />
        <Route path="/mediakits" element={<VisiblePageRoute slug="press-kit"><PressKitPage /></VisiblePageRoute>} />
        <Route path="/search" element={<VisiblePageRoute slug="search"><SearchPage /></VisiblePageRoute>} />
        <Route path="/magazin" element={<VisiblePageRoute slug="shop"><ShopPage /></VisiblePageRoute>} />
        <Route path="/novosti/:slug" element={<VisiblePageRoute slug="news"><NewsArticlePage /></VisiblePageRoute>} />
        <Route path="/smi-o-nas" element={<VisiblePageRoute slug="smi"><SmiPage /></VisiblePageRoute>} />
        <Route path="/narodnoe-media" element={<VisiblePageRoute slug="press-center"><NarodnoeMediaPage /></VisiblePageRoute>} />
        <Route path="/narodnoe-media/:slug" element={<VisiblePageRoute slug="press-center"><MediaTeamDetailPage /></VisiblePageRoute>} />
        <Route path="/verify/:id" element={<VerifyPage />} />
      </Route>
    </Routes>
  );
}

export default App;
