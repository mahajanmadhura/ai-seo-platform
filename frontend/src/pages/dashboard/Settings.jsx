import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { updateProfile } from '../../services/auth';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { User, Mail, Loader2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function Settings() {
  const { user, refreshUserProfile } = useAuth();
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await updateProfile(firstName, lastName);
      if (res?.success) {
        addToast('Profile details updated successfully.', 'success');
        await refreshUserProfile();
      } else {
        setError(res?.message || 'Profile update failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Profile Settings" backLink="/dashboard">
      <main className="max-w-xl mx-auto py-6 text-left">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-color/60 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#E5F3EC] rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-6 relative z-10">
            <div>
              <h2 className="text-xl font-black text-deep-green tracking-tight font-sans">Profile Settings</h2>
              <p className="text-xs text-muted-text mt-1 font-semibold leading-relaxed">
                Update your workspace identification details.
              </p>
            </div>

            {error && (
              <div className="bg-red-500/5 border border-red-500/15 text-red-700 p-4 rounded-xl text-xs font-bold text-center leading-relaxed">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-deep-green uppercase tracking-widest pl-1">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="auth-input auth-input-icon text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-deep-green uppercase tracking-widest pl-1">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="auth-input auth-input-icon text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5 bg-[#E5F3EC]/30 p-4 rounded-2xl border border-border-color/40">
                <label className="text-[10px] font-bold text-deep-green uppercase tracking-widest pl-1 opacity-70">
                  Email Address (Read-only)
                </label>
                <div className="relative mt-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="auth-input auth-input-icon cursor-not-allowed text-xs font-semibold bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-grow bg-deep-green text-white py-3.5 rounded-xl font-black hover:bg-[#36E682] hover:text-[#053D34] transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md uppercase tracking-wider"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" /> Saving...
                    </>
                  ) : (
                    'Update Profile Details'
                  )}
                </button>
                <Link
                  to="/change-password"
                  className="bg-deep-green/5 hover:bg-deep-green/10 text-deep-green border border-deep-green/10 text-center py-3.5 px-6 rounded-xl font-black transition-all text-xs flex items-center justify-center cursor-pointer uppercase tracking-wider"
                >
                  Change Password
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
