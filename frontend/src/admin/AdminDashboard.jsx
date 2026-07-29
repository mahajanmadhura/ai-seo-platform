import React from 'react';
import { useLocation } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import AdminDashboardView from './pages/AdminDashboardView';
import AdminRevenueView from './pages/AdminRevenueView';
import AdminUsersView from './pages/AdminUsersView';
import AdminWebsitesView from './pages/AdminWebsitesView';
import AdminAuditsView from './pages/AdminAuditsView';
import AdminAiAnalyticsView from './pages/AdminAiAnalyticsView';
import AdminSystemHealthView from './pages/AdminSystemHealthView';
import AdminReportsCenterView from './pages/AdminReportsCenterView';

export default function AdminDashboard() {
  const location = useLocation();

  const renderContent = () => {
    switch (location.pathname) {
      case '/admin':
      case '/admin/dashboard':
        return <AdminDashboardView />;
      case '/admin/revenue':
        return <AdminRevenueView />;
      case '/admin/reports':
        return <AdminReportsCenterView />;
      case '/admin/users':
        return <AdminUsersView />;
      case '/admin/websites':
        return <AdminWebsitesView />;
      case '/admin/audits':
        return <AdminAuditsView />;
      case '/admin/ai':
        return <AdminAiAnalyticsView />;
      case '/admin/system':
        return <AdminSystemHealthView />;
      default:
        return <AdminDashboardView />;
    }
  };

  return (
    <AdminLayout>
      {renderContent()}
    </AdminLayout>
  );
}
