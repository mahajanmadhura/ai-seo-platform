import React from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { User, CreditCard, Lock } from 'lucide-react';
import ProfileSettings from './settings/components/ProfileSettings';
import BillingCredits from './settings/components/BillingCredits';
import SecuritySettings from './settings/components/SecuritySettings';

export default function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';

  const tabs = [
    { id: 'profile', name: 'Profile Settings', icon: User },
    { id: 'billing', name: 'Billing & Credits', icon: CreditCard },
    { id: 'security', name: 'Security & Credentials', icon: Lock }
  ];

  return (
    <DashboardLayout title="Account Settings">
      <div className="space-y-6 text-left">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-deep-green tracking-tight font-sans">Account Settings</h2>
          <p className="text-xs text-muted-text mt-1 font-semibold max-w-2xl leading-relaxed">
            Manage your personal profile, buy credit bundles, trace invoices, and update security keys.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 items-start">
          <div className="md:col-span-1 flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-1.5 p-1 bg-[#E5F3EC]/40 rounded-2xl border border-border-color/60">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSearchParams({ tab: tab.id })}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs transition-all cursor-pointer text-left flex-shrink-0 flex-grow md:flex-grow-0 font-bold ${
                    active
                      ? 'bg-deep-green text-white shadow-sm'
                      : 'text-muted-text hover:text-deep-green hover:bg-[#E5F3EC]/55'
                  }`}
                >
                  <TabIcon className="w-4 h-4 flex-shrink-0" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          <div className="md:col-span-3 max-h-[calc(100vh-180px)] overflow-y-auto pr-1 custom-scrollbar">
            {activeTab === 'profile' && <ProfileSettings />}
            {activeTab === 'billing' && <BillingCredits />}
            {activeTab === 'security' && <SecuritySettings />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
