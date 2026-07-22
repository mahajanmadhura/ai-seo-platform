import React from 'react';
import { useLocation } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import AdminDashboardView from './components/AdminDashboardView';
import AdminUsersView from './components/AdminUsersView';
import AdminAuditLogsView from './components/AdminAuditLogsView';

export default function AdminDashboard() {
  const location = useLocation();

  const renderContent = () => {
    switch (location.pathname) {
      case '/admin':
      case '/admin/dashboard':
        return <AdminDashboardView />;
      case '/admin/users':
        return <AdminUsersView />;
      case '/admin/audit-logs':
        return <AdminAuditLogsView />;
      default:
        return (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-neutral-450 border border-neutral-100 rounded-2xl bg-white shadow-sm min-h-[360px] font-sans">
            <p className="text-xs font-black uppercase tracking-widest text-neutral-400">
              Page Under Construction
            </p>
            <p className="text-[11px] text-neutral-450 font-semibold mt-2 max-w-sm text-center leading-relaxed">
              This administration portal module is mapped and secured, but is currently under development.
            </p>
          </div>
        );
    }
  };

  return (
    <AdminLayout>
      {renderContent()}
    </AdminLayout>
  );
}
