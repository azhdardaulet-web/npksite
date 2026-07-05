import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import MediaPage from '@/pages/MediaPage';
import NewsList from '@/pages/news/NewsList';
import NewsEditor from '@/pages/news/NewsEditor';
import CategoriesPage from '@/pages/news/CategoriesPage';
import WordImporter from '@/pages/news/WordImporter';
import TeamPage from '@/pages/team/TeamPage';
import OfficesPage from '@/pages/offices/OfficesPage';
import PageEditor from '@/pages/pages/PageEditor';
import SettingsPage from '@/pages/SettingsPage';
import UsersPage from '@/pages/UsersPage';
import JoinRequestsPage from '@/pages/join-requests/JoinRequestsPage';
import AppealsPage from '@/pages/appeals/AppealsPage';

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
        <Route path="/news/categories" element={<PrivateRoute><CategoriesPage /></PrivateRoute>} />
        <Route path="/news/:id/edit" element={<PrivateRoute><NewsEditor /></PrivateRoute>} />
        <Route path="/team" element={<PrivateRoute><TeamPage /></PrivateRoute>} />
        <Route path="/offices" element={<PrivateRoute><OfficesPage /></PrivateRoute>} />
        <Route path="/pages" element={<PrivateRoute><PageEditor /></PrivateRoute>} />
        <Route path="/pages/:slug" element={<PrivateRoute><PageEditor /></PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute><UsersPage /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </HashRouter>
  );
}
