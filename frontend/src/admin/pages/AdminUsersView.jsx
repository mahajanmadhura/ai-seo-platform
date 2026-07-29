import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  CreditCard,
  User,
  Globe,
  FileText,
  Cpu,
  Clock,
  DollarSign,
  Activity,
  Users as UsersIcon,
  CheckCircle2,
  Search,
  Filter,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import adminApi from '../services/adminApi';
import { useToast } from '../../context/ToastContext';
import AdminHeader from '../components/ui/AdminHeader';
import AdminTable from '../components/ui/AdminTable';
import AdminPagination from '../components/ui/AdminPagination';
import AdminModal from '../components/ui/AdminModal';
import AdminDrawer from '../components/ui/AdminDrawer';
import AdminStatusBadge from '../components/ui/AdminStatusBadge';
import AdminErrorState from '../components/ui/AdminErrorState';
import AdminSkeleton from '../components/ui/AdminSkeleton';

export default function AdminUsersView() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Customer Profile Drawer & Modals state
  const [selectedUser, setSelectedUser] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);

  const [roleStaff, setRoleStaff] = useState(false);
  const [roleSuperuser, setRoleSuperuser] = useState(false);
  const [creditAmount, setCreditAmount] = useState(50);
  const [creditReason, setCreditReason] = useState('Manual admin adjustment');
  const [submitting, setSubmitting] = useState(false);

  const { addToast } = useToast();

  const loadUsers = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getUsers(page);
      setUsers(res.data || []);
      setPagination(res.pagination || null);
      setCurrentPage(page);
      setLastRefreshed(new Date());
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch user directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(currentPage);
  }, []);

  const openCustomerProfile = async (user) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
    setAnalyticsLoading(true);
    try {
      const res = await adminApi.getUserDetailAnalytics(user.id);
      setUserAnalytics(res.data || null);
    } catch (err) {
      addToast('Failed to load profile details', 'error');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const openRoleModal = (user, e) => {
    e.stopPropagation();
    setSelectedUser(user);
    setRoleStaff(Boolean(user.is_staff));
    setRoleSuperuser(Boolean(user.is_superuser));
    setIsRoleModalOpen(true);
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      await adminApi.updateUserRole(selectedUser.id, {
        is_staff: roleStaff,
        is_superuser: roleSuperuser
      });
      addToast(`Permissions updated for ${selectedUser.email}`, 'success');
      setIsRoleModalOpen(false);
      loadUsers(currentPage);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update user role', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openCreditModal = (user, e) => {
    e.stopPropagation();
    setSelectedUser(user);
    setCreditAmount(50);
    setCreditReason('Manual admin adjustment');
    setIsCreditModalOpen(true);
  };

  const handleAdjustCredits = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      await adminApi.adjustUserCredits(selectedUser.id, {
        amount: Number(creditAmount),
        reason: creditReason
      });
      addToast(`Credits adjusted for ${selectedUser.email}`, 'success');
      setIsCreditModalOpen(false);
      loadUsers(currentPage);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to adjust credits', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter Users by Search Query & Role Filter Tab
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const fullName = `${u.first_name || ''} ${u.last_name || ''}`.toLowerCase();
    const matchesSearch = u.email?.toLowerCase().includes(q) || fullName.includes(q);

    if (!matchesSearch) return false;
    if (roleFilter === 'STAFF') return u.is_staff && !u.is_superuser;
    if (roleFilter === 'SUPERUSER') return u.is_superuser;
    if (roleFilter === 'CUSTOMER') return !u.is_staff && !u.is_superuser;
    return true;
  });

  // Calculate Aggregates
  const totalCreditsAcrossPage = users.reduce((acc, u) => acc + (u.available_credits || 0), 0);
  const activeCount = users.filter((u) => u.is_active).length;
  const staffCount = users.filter((u) => u.is_staff || u.is_superuser).length;

  const columns = [
    { header: 'User' },
    { header: 'Email' },
    { header: 'Role' },
    { header: 'Credits' },
    { header: 'Status' },
    { header: 'Actions' },
  ];

  if (error) {
    return <AdminErrorState message={error} onRetry={() => loadUsers(currentPage)} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-5 text-left pb-16 font-sans overflow-x-hidden"
    >
      {/* Standardized Header */}
      <AdminHeader
        title="Users"
        lastUpdated={lastRefreshed}
        onRefresh={() => loadUsers(currentPage)}
        loading={loading}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search..."
      />

      {/* KPI Overview Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Total Users</span>
          <span className="text-2xl font-black text-zinc-950 font-mono block leading-none">
            {users.length}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Active Accounts</span>
          <span className="text-2xl font-black text-zinc-950 font-mono block leading-none">
            {activeCount}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Staff Members</span>
          <span className="text-2xl font-black text-zinc-950 font-mono block leading-none">
            {staffCount}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Allocated Credits</span>
          <span className="text-2xl font-black text-zinc-950 font-mono block leading-none">
            {totalCreditsAcrossPage.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Full-Width Table Card (No Right Side Widget, No Slider, Single-Line Text) */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-2xs overflow-hidden w-full">
        
        {/* Table Action Bar */}
        <div className="p-3 border-b border-zinc-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200">
            {['ALL', 'CUSTOMER', 'STAFF', 'SUPERUSER'].map((rf) => (
              <button
                key={rf}
                onClick={() => setRoleFilter(rf)}
                className={`px-3 py-1.5 rounded text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  roleFilter === rf
                    ? 'bg-zinc-950 text-white font-black'
                    : 'text-zinc-600 hover:text-zinc-950'
                }`}
              >
                {rf === 'ALL' ? 'All Roles' : rf === 'SUPERUSER' ? 'Super Admin' : rf === 'CUSTOMER' ? 'Customer' : rf === 'STAFF' ? 'Staff' : rf}
              </button>
            ))}
          </div>

          <span className="text-xs text-zinc-500 font-semibold whitespace-nowrap">{filteredUsers.length} Users</span>
        </div>

        <AdminTable
          columns={columns}
          data={filteredUsers}
          isLoading={loading}
          emptyTitle="No users"
          emptyDescription=""
          renderRow={(user) => {
            const nameStr = user.first_name || user.last_name ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'User Account';
            const initial = nameStr.charAt(0).toUpperCase() || 'U';

            return (
              <>
                {/* User Name & Avatar */}
                <td
                  onClick={() => openCustomerProfile(user)}
                  className="px-5 py-3.5 font-bold text-zinc-950 cursor-pointer hover:underline whitespace-nowrap"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {initial}
                    </div>
                    <span className="truncate whitespace-nowrap">{nameStr}</span>
                  </div>
                </td>

                {/* Email */}
                <td className="px-5 py-3.5 text-zinc-500 font-mono text-xs whitespace-nowrap">{user.email}</td>

                {/* Role Badge - Single Line Always */}
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold whitespace-nowrap ${
                    user.is_superuser ? 'bg-zinc-950 text-white' :
                    user.is_staff ? 'bg-zinc-100 text-zinc-900 border border-zinc-200' : 'bg-zinc-50 text-zinc-600 border border-zinc-200'
                  }`}>
                    <Shield className="w-3 h-3 shrink-0" />
                    <span className="whitespace-nowrap">{user.is_superuser ? 'Super Admin' : user.is_staff ? 'Staff' : 'Customer'}</span>
                  </span>
                </td>

                {/* Credits */}
                <td className="px-5 py-3.5 font-bold font-mono text-zinc-950 whitespace-nowrap">
                  {user.available_credits ?? 0}
                </td>

                {/* Status */}
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <AdminStatusBadge status={user.is_active ? 'ACTIVE' : 'INACTIVE'} />
                </td>

                {/* Actions */}
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <button
                      onClick={() => openCustomerProfile(user)}
                      className="px-2.5 py-1 text-[11px] font-bold text-zinc-950 bg-zinc-100 hover:bg-zinc-200 rounded transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Profile
                    </button>
                    <button
                      onClick={(e) => openRoleModal(user, e)}
                      className="px-2.5 py-1 text-[11px] font-bold text-zinc-700 border border-zinc-200 hover:bg-zinc-50 rounded transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Role
                    </button>
                    <button
                      onClick={(e) => openCreditModal(user, e)}
                      className="px-2.5 py-1 text-[11px] font-bold text-zinc-950 bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 rounded transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Credits
                    </button>
                  </div>
                </td>
              </>
            );
          }}
        />

        <AdminPagination
          pagination={pagination}
          currentPage={currentPage}
          onPageChange={loadUsers}
        />
      </div>

      {/* Customer Profile Drawer */}
      <AdminDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={`User Profile — ${selectedUser?.email}`}
      >
        {analyticsLoading ? (
          <AdminSkeleton rows={6} columns={2} />
        ) : userAnalytics ? (
          <div className="space-y-6 text-xs font-semibold text-zinc-900">
            {/* User Account Overview */}
            <div className="p-4 bg-zinc-950 text-white rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black tracking-tight">
                  {userAnalytics.user_info.first_name || userAnalytics.user_info.last_name
                    ? `${userAnalytics.user_info.first_name || ''} ${userAnalytics.user_info.last_name || ''}`
                    : 'Customer Account'}
                </h3>
                <AdminStatusBadge status={userAnalytics.user_info.is_active ? 'ACTIVE' : 'INACTIVE'} />
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">{userAnalytics.user_info.email}</p>
            </div>

            {/* Credit Balance Overview */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 pb-1.5">
                Credit Balance
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 bg-zinc-50 rounded border border-zinc-200">
                  <span className="text-[9px] font-bold uppercase text-zinc-400 block">Purchased</span>
                  <span className="text-base font-black text-zinc-950 font-mono">{userAnalytics.credits_purchased}</span>
                </div>
                <div className="p-2.5 bg-zinc-50 rounded border border-zinc-200">
                  <span className="text-[9px] font-bold uppercase text-zinc-400 block">Consumed</span>
                  <span className="text-base font-black text-zinc-950 font-mono">{userAnalytics.credits_consumed}</span>
                </div>
                <div className="p-2.5 bg-zinc-50 rounded border border-zinc-200">
                  <span className="text-[9px] font-bold uppercase text-zinc-400 block">Remaining</span>
                  <span className="text-base font-black text-zinc-950 font-mono">{userAnalytics.remaining_credits}</span>
                </div>
              </div>
            </div>

            {/* Audit Summary */}
            <div className="space-y-2 border-t border-zinc-100 pt-4">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Audit Summary</h4>
              <div className="flex justify-between py-1.5 border-b border-zinc-100">
                <span className="text-zinc-500">Registered Websites</span>
                <span className="font-bold text-zinc-950">{userAnalytics.total_websites} Domains</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-100">
                <span className="text-zinc-500">Total Audits Run</span>
                <span className="font-bold text-zinc-950">{userAnalytics.total_audits} Audits</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-100">
                <span className="text-zinc-500">Completed Audits</span>
                <span className="font-bold text-zinc-950">{userAnalytics.completed_audits}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-100">
                <span className="text-zinc-500">Average SEO Score</span>
                <span className="font-black text-zinc-950">{userAnalytics.average_seo_score} / 100</span>
              </div>
            </div>

            {/* Usage Summary */}
            <div className="space-y-2 border-t border-zinc-100 pt-4">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Usage Summary</h4>
              <div className="flex justify-between py-1.5 border-b border-zinc-100">
                <span className="text-zinc-500">AI Activity</span>
                <span className="font-mono font-bold text-zinc-950">{userAnalytics.groq_tokens_used.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-100">
                <span className="text-zinc-500">Processing Cost</span>
                <span className="font-bold text-zinc-950">${userAnalytics.estimated_ai_cost} USD</span>
              </div>
            </div>
          </div>
        ) : null}
      </AdminDrawer>

      {/* Role Update Modal */}
      <AdminModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title={`Role Permissions — ${selectedUser?.email}`}
      >
        <form onSubmit={handleUpdateRole} className="space-y-4 text-left font-sans">
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={roleStaff}
                onChange={(e) => setRoleStaff(e.target.checked)}
                className="w-4 h-4 text-zinc-950 rounded border-zinc-300 focus:ring-zinc-950 cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-zinc-950 block">Is Staff (Staff Admin)</span>
                <span className="text-[11px] text-zinc-500">Access to admin directory and management views</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={roleSuperuser}
                onChange={(e) => setRoleSuperuser(e.target.checked)}
                className="w-4 h-4 text-zinc-950 rounded border-zinc-300 focus:ring-zinc-950 cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-zinc-950 block">Is Superuser (System Administrator)</span>
                <span className="text-[11px] text-zinc-500">Full system permissions including system status and error logs</span>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => setIsRoleModalOpen(false)}
              className="px-4 py-2 border border-zinc-200 text-xs font-bold text-zinc-600 rounded-lg hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-zinc-950 text-white text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Saving...' : 'Save Permissions'}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Credit Adjustment Modal */}
      <AdminModal
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
        title={`Adjust Credits — ${selectedUser?.email}`}
      >
        <form onSubmit={handleAdjustCredits} className="space-y-4 text-left font-sans">
          <div>
            <label className="text-xs font-bold text-zinc-950 block mb-1">
              Credit Amount
            </label>
            <input
              type="number"
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
              placeholder="e.g. 50"
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-950"
              required
            />
            <span className="text-[11px] text-zinc-500 mt-1 block">
              Enter positive number to grant (+50), negative to deduct (-10).
            </span>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-950 block mb-1">
              Reason
            </label>
            <input
              type="text"
              value={creditReason}
              onChange={(e) => setCreditReason(e.target.value)}
              placeholder="e.g. Promotional grant"
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-zinc-950"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => setIsCreditModalOpen(false)}
              className="px-4 py-2 border border-zinc-200 text-xs font-bold text-zinc-600 rounded-lg hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-zinc-950 text-white text-xs font-bold rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Confirming...' : 'Confirm Credit Adjustment'}
            </button>
          </div>
        </form>
      </AdminModal>
    </motion.div>
  );
}
