import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { resetPassword } from '../../services/auth';
import AuthLayout from './components/AuthLayout';
import { Lock, Loader2, Eye, EyeOff } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const pwHasLength = password.length >= 8;
  const pwHasSymbol = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  const hasConfirmPassword = confirmPassword !== '';
  const pwMatch = password === confirmPassword && hasConfirmPassword;

  const getMatchDotColor = () => {
    if (!hasConfirmPassword) return 'bg-muted-text/30';
    return pwMatch ? 'bg-growth-green' : 'bg-red-500/50';
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
      setError('Password does not meet requirements.');
      setLoading(false);
      return;
    }

    try {
      const res = await resetPassword(token, password);
      if (res?.success) {
        setSuccess(true);
      } else {
        setError(res?.message || 'Password reset failed.');
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        setError(Object.values(errors).flat().join(' '));
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Invalid or expired reset token.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      pageType="resetPassword"
      title="Create New Password"
      subtitle="Ensure your new account credentials are secure"
      error={error}
      success={success ? 'Password reset successfully!' : ''}
      footerLink={
        <Link to="/login" className="text-xs text-muted-text font-bold hover:text-deep-green transition-colors border-b border-transparent hover:border-deep-green pb-0.5 animate-fade-in">
          Back to Sign In
        </Link>
      }
    >
      {success ? (
        <div className="space-y-4 text-center">
          <p className="text-xs text-muted-text font-semibold leading-relaxed">
            Your credentials have been successfully updated. You can now use your new password to sign in.
          </p>
          <Link to="/login" className="block w-full bg-deep-green text-white py-3.5 rounded-xl font-black hover:bg-growth-green hover:text-deep-green text-sm text-center shadow-md cursor-pointer">
            Sign In Now
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-deep-green uppercase tracking-widest pl-1 block">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="auth-input auth-input-icon pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-text hover:text-deep-green cursor-pointer p-0.5"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-deep-green uppercase tracking-widest pl-1 block">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="auth-input auth-input-icon pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-text hover:text-deep-green cursor-pointer p-0.5"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="p-3.5 bg-mint-surface border border-deep-green/10 rounded-xl space-y-2 text-left">
            <div className="flex items-center gap-2.5 text-[11px]">
              <span className={`w-2.5 h-2.5 rounded-full ${pwHasLength ? 'bg-growth-green' : 'bg-muted-text/30'}`} />
              <span className={pwHasLength ? 'text-deep-green font-bold' : 'text-muted-text'}>
                Minimum 8 characters
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-[11px]">
              <span className={`w-2.5 h-2.5 rounded-full ${pwHasSymbol ? 'bg-growth-green' : 'bg-muted-text/30'}`} />
              <span className={pwHasSymbol ? 'text-deep-green font-bold' : 'text-muted-text'}>
                At least one symbol or number
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-[11px]">
              <span className={`w-2.5 h-2.5 rounded-full ${getMatchDotColor()}`} />
              <span className={`${getMatchTextColor()} font-bold`}>
                Passwords match
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !pwHasLength || !pwHasSymbol || !pwMatch}
            className="w-full bg-deep-green text-white py-3.5 rounded-xl font-black hover:bg-growth-green hover:text-deep-green hover:scale-[1.02] active:scale-95 transition-all shadow-md text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin text-white" /> Saving Password...</>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      )}
    </AuthLayout>
  );
};

export default ResetPassword;
