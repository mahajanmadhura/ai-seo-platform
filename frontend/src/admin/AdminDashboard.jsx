import React from 'react';
import AdminLayout from './AdminLayout';

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-neutral-450 border border-neutral-100 rounded-2xl bg-white shadow-sm min-h-[360px] font-sans">
        <p className="text-xs font-black uppercase tracking-widest text-neutral-400">
          Empty Administration Workspace
        </p>
        <p className="text-[11px] text-neutral-450 font-semibold mt-2 max-w-sm text-center leading-relaxed">
          System layout initialized. Under active development. Core admin module routes are mapped and secured.
        </p>
      </div>
    </AdminLayout>
  );
}
