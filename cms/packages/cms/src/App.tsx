import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthBootstrap } from '@/hooks/useAuthBootstrap';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import MediaPage from '@/pages/MediaPage';
import NewsList from '@/pages/news/NewsList';
import NewsEditor from '@/pages/news/NewsEditor';
import WordImporter from '@/pages/news/WordImporter';
import TeamPage from '@/pages/team/TeamPage';
import BranchesPage from '@/pages/offices/BranchesPage';
import PageEditor from '@/pages/pages/PageEditor';
import PagesLayout from '@/pages/pages/PagesLayout';
import SettingsPage from '@/pages/SettingsPage';
import JoinRequestsPage from '@/pages/join-requests/JoinRequestsPage';
import AppealsPage from '@/pages/appeals/AppealsPage';
import CandidatesPage from '@/pages/content/CandidatesPage';
import HistoryEventsPage from '@/pages/content/HistoryEventsPage';
import ProgramBlocksPage from '@/pages/content/ProgramBlocksPage';
import MediaProjectsPage from '@/pages/content/MediaProjectsPage';
import MediaPublicationsPage from '@/pages/content/MediaPublicationsPage';
import TestimonialsPage from '@/pages/content/TestimonialsPage';
import MenuItemsPage from '@/pages/content/MenuItemsPage';
import ShopSubscribersPage from '@/pages/shop/ShopSubscribersPage';
import DeputiesPage from '@/pages/faction/DeputiesPage';
import DeputyRequestsPage from '@/pages/faction/DeputyRequestsPage';
import PlaceholderPage from '@/pages/PlaceholderPage';
import DocumentsPage from '@/pages/documents/DocumentsPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  return <Layout>{children}</Layout>;
}

export default function App() {
  useAuthBootstrap();

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/zayavki" element={<PrivateRoute><JoinRequestsPage /></PrivateRoute>} />
        <Route path="/obrashcheniya" element={<PrivateRoute><AppealsPage /></PrivateRoute>} />
        <Route path="/magazin" element={<PrivateRoute><ShopSubscribersPage /></PrivateRoute>} />
        <Route path="/media" element={<PrivateRoute><MediaPage /></PrivateRoute>} />
        <Route path="/news" element={<PrivateRoute><NewsList /></PrivateRoute>} />
        <Route path="/news/import" element={<PrivateRoute><WordImporter /></PrivateRoute>} />
        <Route path="/news/new" element={<PrivateRoute><NewsEditor /></PrivateRoute>} />
        <Route path="/news/:id/edit" element={<PrivateRoute><NewsEditor /></PrivateRoute>} />
        <Route path="/podcast" element={<PrivateRoute><PlaceholderPage title="Народный подкаст" /></PrivateRoute>} />
        <Route path="/galereya" element={<PrivateRoute><PlaceholderPage title="Галерея" /></PrivateRoute>} />
        <Route path="/frakciya/zaprosy" element={<PrivateRoute><DeputyRequestsPage /></PrivateRoute>} />
        <Route path="/frakciya/deputaty" element={<PrivateRoute><DeputiesPage /></PrivateRoute>} />

        {/* Управление страницами — мини-панель «Страницы сайта» остаётся видимой
            при переходе между редактором блоков и вложенными CRUD-экранами */}
        <Route element={<PrivateRoute><PagesLayout /></PrivateRoute>}>
          <Route path="/pages" element={<PageEditor />} />
          <Route path="/pages/:slug" element={<PageEditor />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/filialy" element={<BranchesPage />} />
          <Route path="/candidates" element={<CandidatesPage />} />
          <Route path="/history" element={<HistoryEventsPage />} />
          <Route path="/documents/ustav" element={<DocumentsPage />} />
          <Route path="/program" element={<ProgramBlocksPage />} />
          <Route path="/media-projects" element={<MediaProjectsPage />} />
          <Route path="/smi" element={<MediaPublicationsPage />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/menu" element={<MenuItemsPage />} />
        </Route>
        <Route path="/podderzhka" element={<PrivateRoute><PlaceholderPage title="Поддержка" note="Раздел поддержки — контакты разработчика и документация появятся здесь." /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </HashRouter>
  );
}
