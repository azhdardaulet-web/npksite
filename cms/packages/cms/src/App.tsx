import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import SettingsPage from '@/pages/SettingsPage';
import UsersPage from '@/pages/UsersPage';
import JoinRequestsPage from '@/pages/join-requests/JoinRequestsPage';
import AppealsPage from '@/pages/appeals/AppealsPage';
import CandidatesPage from '@/pages/content/CandidatesPage';
import HistoryEventsPage from '@/pages/content/HistoryEventsPage';
import ProgramBlocksPage from '@/pages/content/ProgramBlocksPage';
import MediaProjectsPage from '@/pages/content/MediaProjectsPage';
import MediaPublicationsPage from '@/pages/content/MediaPublicationsPage';
import TestimonialsPage from '@/pages/content/TestimonialsPage';
import MenuItemsPage from '@/pages/content/MenuItemsPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/zayavki" element={<PrivateRoute><JoinRequestsPage /></PrivateRoute>} />
        <Route path="/obrashcheniya" element={<PrivateRoute><AppealsPage /></PrivateRoute>} />
        <Route path="/media" element={<PrivateRoute><MediaPage /></PrivateRoute>} />
        <Route path="/news" element={<PrivateRoute><NewsList /></PrivateRoute>} />
        <Route path="/news/import" element={<PrivateRoute><WordImporter /></PrivateRoute>} />
        <Route path="/news/new" element={<PrivateRoute><NewsEditor /></PrivateRoute>} />
        <Route path="/news/:id/edit" element={<PrivateRoute><NewsEditor /></PrivateRoute>} />
        <Route path="/team" element={<PrivateRoute><TeamPage /></PrivateRoute>} />
        <Route path="/filialy" element={<PrivateRoute><BranchesPage /></PrivateRoute>} />
        <Route path="/pages" element={<PrivateRoute><PageEditor /></PrivateRoute>} />
        <Route path="/pages/:slug" element={<PrivateRoute><PageEditor /></PrivateRoute>} />
        <Route path="/candidates" element={<PrivateRoute><CandidatesPage /></PrivateRoute>} />
        <Route path="/history" element={<PrivateRoute><HistoryEventsPage /></PrivateRoute>} />
        <Route path="/program" element={<PrivateRoute><ProgramBlocksPage /></PrivateRoute>} />
        <Route path="/media-projects" element={<PrivateRoute><MediaProjectsPage /></PrivateRoute>} />
        <Route path="/smi" element={<PrivateRoute><MediaPublicationsPage /></PrivateRoute>} />
        <Route path="/testimonials" element={<PrivateRoute><TestimonialsPage /></PrivateRoute>} />
        <Route path="/menu" element={<PrivateRoute><MenuItemsPage /></PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute><UsersPage /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </HashRouter>
  );
}
