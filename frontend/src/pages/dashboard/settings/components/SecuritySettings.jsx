import React, { useState } from 'react';
import { useToast } from '../../../../context/ToastContext';
import { changePassword } from '../../../../services/auth';
import { Lock, Loader2 } from 'lucide-react';

export default function SecuritySettings() {
  const { addToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwLoading(true);
    setPwError('');

    const pwHasLength = newPassword.length >= 8;
    const pwHasSymbol = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);
    const pwMatch = newPassword === confirmPassword;

    if (!pwHasLength || !pwHasSymbol || !pwMatch) {
      setPwError('New password requirements not met.');
      setPwLoading(false);
      return;
    }

    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res?.success) {
        addToast('Password changed successfully.', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPwError(res?.message || 'Password update failed.');
      }
    } catch (err) {
      setPwError(err.response?.data?.message || 'Error changing password.');
    } finally {
      setPwLoading(false);
    }
  };

  const pwHasLength = newPassword.length >= 8;
  const pwHasSymbol = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);
  const pwMatch = newPassword === confirmPassword && confirmPassword !== '';

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-color/60 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#E5F3EC] rounded-full blur-3xl pointer-events-none"></div>
      <div className="space-y-6 relative z-10">
        <div className="border-b border-border-color/40 pb-4">
          <h3 className="text-base font-black text-deep-green">Security & Credentials</h3>
          <p className="text-[10px] text-muted-text font-semibold">Update your account password details.</p>
        </div>

        {pwError && (
          <div className="bg-red-500/5 border border-red-500/15 text-red-700 p-4 rounded-xl text-xs font-bold text-center">
            {pwError}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-deep-green uppercase tracking-widest pl-1">
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
            <label className="text-[10px] font-bold text-deep-green uppercase tracking-widest pl-1">
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
            <label className="text-[10px] font-bold text-deep-green uppercase tracking-widest pl-1">
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
              <span className={`w-2.5 h-2.5 rounded-full ${pwMatch ? 'bg-[#36E682]' : 'bg-red-500/50'}`} />
              <span className={`${pwMatch ? 'text-deep-green' : 'text-red-700'} font-black`}>
                Passwords match
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={pwLoading || !pwHasLength || !pwHasSymbol || !pwMatch}
            className="w-full bg-deep-green text-white py-3.5 rounded-xl font-black hover:bg-[#36E682] hover:text-[#053D34] transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
          >
            {pwLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" /> Saving...
              </>
            ) : (
              'Change Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
