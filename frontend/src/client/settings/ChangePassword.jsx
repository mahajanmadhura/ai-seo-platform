import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { changePassword } from '../../services/auth';
import DashboardLayout from '../../components/DashboardLayout';
import { Lock, Loader2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addToast } = useToast();
  const navigate = useNavigate();

  const pwHasLength = newPassword.length >= 8;
  const pwHasSymbol = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);
  const hasConfirmPassword = confirmPassword !== '';
  const pwMatch = newPassword === confirmPassword && hasConfirmPassword;

  const getMatchDotColor = () => {
    if (!hasConfirmPassword) return 'bg-muted-text/30';
    return pwMatch ? 'bg-[#36E682]' : 'bg-red-500/50';
  };

  const getMatchTextColor = () => {
    if (!hasConfirmPassword) return 'text-muted-text';
    return pwMatch ? 'text-deep-green' : 'text-red-700';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!pwHasLength || !pwHasSymbol || !pwMatch) {
      setError('New password does not meet requirements.');
      setLoading(false);
      return;
    }

    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res?.success) {
        addToast('Password updated successfully.', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        navigate('/settings');
      } else {
        setError(res?.message || 'Password update failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Security Details" backLink="/settings">
      <main className="max-w-xl mx-auto py-6 text-left">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-color/60 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#E5F3EC] rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-6 relative z-10">
            <div>
              <h2 className="text-xl font-black text-deep-green tracking-tight font-sans">Security Details</h2>
              <p className="text-xs text-muted-text mt-1 font-semibold leading-relaxed">
                Update your workspace account credentials.
              </p>
            </div>

            {error && (
              <div className="bg-red-500/5 border border-red-500/15 text-red-700 p-4 rounded-xl text-xs font-bold text-center leading-relaxed">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-deep-green uppercase tracking-widest pl-1 font-sans">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="auth-input auth-input-icon text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-deep-green uppercase tracking-widest pl-1 font-sans">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="auth-input auth-input-icon text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-deep-green uppercase tracking-widest pl-1 font-sans">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="auth-input auth-input-icon text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="p-4 bg-[#E5F3EC]/50 border border-deep-green/10 rounded-2xl space-y-2">
                <div className="flex items-center gap-2.5 text-[11px] font-bold">
                  <span className={`w-2.5 h-2.5 rounded-full ${pwHasLength ? 'bg-[#36E682]' : 'bg-muted-text/30'}`} />
                  <span className={pwHasLength ? 'text-deep-green font-black' : 'text-muted-text'}>
                    Minimum 8 characters
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-[11px] font-bold">
                  <span className={`w-2.5 h-2.5 rounded-full ${pwHasSymbol ? 'bg-[#36E682]' : 'bg-muted-text/30'}`} />
                  <span className={pwHasSymbol ? 'text-deep-green font-black' : 'text-muted-text'}>
                    At least one symbol or number
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-[11px] font-bold">
                  <span className={`w-2.5 h-2.5 rounded-full ${getMatchDotColor()}`} />
                  <span className={`${getMatchTextColor()} font-black`}>
                    Passwords match
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading || !pwHasLength || !pwHasSymbol || !pwMatch}
                  className="flex-grow bg-deep-green text-white py-3.5 rounded-xl font-black hover:bg-[#36E682] hover:text-[#053D34] transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" /> Saving...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </button>
                <Link
                  to="/settings"
                  className="bg-deep-green/5 hover:bg-deep-green/10 text-deep-green border border-deep-green/10 text-center py-3.5 px-6 rounded-xl font-black transition-all text-xs flex items-center justify-center cursor-pointer uppercase tracking-wider"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
