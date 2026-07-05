import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import MediaPage from '@/pages/MediaPage';
import NewsList from '@/pages/news/NewsList';
import NewsEditor from '@/pages/news/NewsEditor';
import CategoriesPage from '@/pages/news/CategoriesPage';
import WordImporter from '@/pages/news/WordImporter';
import PurchaseList from '@/pages/procurement/PurchaseList';
import SupplierForms from '@/pages/procurement/SupplierForms';
import DocumentsPage from '@/pages/procurement/DocumentsPage';
import ResumesPage from '@/pages/hr/ResumesPage';
import VacanciesPage from '@/pages/hr/VacanciesPage';
import PartnersPage from '@/pages/partners/PartnersPage';
import ClientsPage from '@/pages/clients/ClientsPage';
import TeamPage from '@/pages/team/TeamPage';
import OfficesPage from '@/pages/offices/OfficesPage';
import SurveysPage from '@/pages/surveys/SurveysPage';
import PageEditor from '@/pages/pages/PageEditor';
import SettingsPage from '@/pages/SettingsPage';
import UsersPage from '@/pages/UsersPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/media" element={<PrivateRoute><MediaPage /></PrivateRoute>} />
        <Route path="/news" element={<PrivateRoute><NewsList /></PrivateRoute>} />
        <Route path="/news/import" element={<PrivateRoute><WordImporter /></PrivateRoute>} />
        <Route path="/news/new" element={<PrivateRoute><NewsEditor /></PrivateRoute>} />
        <Route path="/news/categories" element={<PrivateRoute><CategoriesPage /></PrivateRoute>} />
        <Route path="/news/:id/edit" element={<PrivateRoute><NewsEditor /></PrivateRoute>} />
        <Route path="/purchases" element={<PrivateRoute><PurchaseList /></PrivateRoute>} />
        <Route path="/supplier-forms" element={<PrivateRoute><SupplierForms /></PrivateRoute>} />
        <Route path="/documents" element={<PrivateRoute><DocumentsPage /></PrivateRoute>} />
        <Route path="/resumes" element={<PrivateRoute><ResumesPage /></PrivateRoute>} />
        <Route path="/vacancies" element={<PrivateRoute><VacanciesPage /></PrivateRoute>} />
        <Route path="/partners" element={<PrivateRoute><PartnersPage /></PrivateRoute>} />
        <Route path="/clients" element={<PrivateRoute><ClientsPage /></PrivateRoute>} />
        <Route path="/team" element={<PrivateRoute><TeamPage /></PrivateRoute>} />
        <Route path="/offices" element={<PrivateRoute><OfficesPage /></PrivateRoute>} />
        <Route path="/pages" element={<PrivateRoute><PageEditor /></PrivateRoute>} />
        <Route path="/pages/:slug" element={<PrivateRoute><PageEditor /></PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute><UsersPage /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
        <Route path="/surveys" element={<PrivateRoute><SurveysPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </HashRouter>
  );
}
