import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { updateProfile } from '../../../services/auth';
import { User, Mail, Loader2 } from 'lucide-react';

export default function ProfileSettings() {
  const { user, refreshUserProfile } = useAuth();
  const { addToast } = useToast();

  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    try {
      const res = await updateProfile(firstName, lastName);
      if (res?.success) {
        addToast('Profile updated successfully.', 'success');
        await refreshUserProfile();
      } else {
        setProfileError(res?.message || 'Profile update failed.');
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Error updating profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-color/60 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#E5F3EC] rounded-full blur-3xl pointer-events-none"></div>
      <div className="space-y-6 relative z-10">
        <div className="border-b border-border-color/40 pb-4">
          <h3 className="text-base font-black text-deep-green">Profile Identification</h3>
          <p className="text-[10px] text-muted-text font-semibold">Your public metadata on the platform.</p>
        </div>

        {profileError && (
          <div className="bg-red-500/5 border border-red-500/15 text-red-700 p-4 rounded-xl text-xs font-bold text-center">
            {profileError}
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-5">
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

          <button
            type="submit"
            disabled={profileLoading}
            className="w-full bg-deep-green text-white py-3.5 rounded-xl font-black hover:bg-[#36E682] hover:text-[#053D34] transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md uppercase tracking-wider"
          >
            {profileLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" /> Saving...
              </>
            ) : (
              'Save Profile Details'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
