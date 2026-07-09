import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register, resendVerificationEmail } from '../../services/auth';
import AuthLayout from './components/AuthLayout';
import { User, Mail, Lock, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');

  const navigate = useNavigate();

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
      const res = await register(firstName, lastName, email, password);
      if (res?.success) {
        setSuccess(true);
      } else {
        setError(res?.message || 'Registration failed.');
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        setError(Object.values(errors).flat().join(' '));
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('An error occurred during registration.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setResendError('');
    setResendSuccess(false);
    try {
      const res = await resendVerificationEmail(email);
      if (res?.success) {
        setResendSuccess(true);
      } else {
        setResendError(res?.message || 'Failed to resend verification email.');
      }
    } catch (err) {
      setResendError(err.response?.data?.message || 'An error occurred while resending email.');
    } finally {
      setResendLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F3FAF6] flex items-center justify-center p-4 sm:p-6 md:p-10 font-sans">
        <div className="w-full max-w-md bg-white rounded-[32px] border border-border-color p-8 sm:p-10 text-center relative z-10 shadow-2xl space-y-6">
          <div className="w-16 h-16 bg-growth-green/10 border border-growth-green/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="text-deep-green w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black tracking-tight text-deep-green uppercase">Check Your Inbox</h3>
            <p className="text-xs text-muted-text leading-relaxed font-semibold">
              Account created. Please check your email <strong>{email}</strong> to verify your account.
            </p>
          </div>

          {resendSuccess && (
            <p className="text-xs text-deep-green font-black bg-growth-green/10 border border-growth-green/20 p-3 rounded-xl">
              Verification email resent successfully. Please check your inbox.
            </p>
          )}

          {resendError && (
            <p className="text-xs text-red-750 font-black bg-red-500/5 border border-red-500/15 p-3 rounded-xl">
              {resendError}
            </p>
          )}

          <div className="pt-4 border-t border-border-color space-y-4">
            <a
              href="https://mail.google.com/mail/u/0/#inbox"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-deep-green text-white py-3.5 rounded-xl font-black hover:bg-growth-green hover:text-deep-green hover:scale-[1.02] active:scale-95 transition-all text-sm block text-center cursor-pointer shadow-md"
            >
              Open Gmail
            </a>

            <Link
              to="/login"
              className="w-full bg-transparent border border-border-color text-deep-green py-3.5 rounded-xl font-bold hover:bg-mint-surface transition-all text-sm block text-center cursor-pointer"
            >
              Back to Login
            </Link>

            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="text-xs text-deep-green hover:underline hover:text-forest-green block mx-auto font-black cursor-pointer disabled:opacity-50"
            >
              {resendLoading ? 'Resending...' : 'Resend Verification Email'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout
      pageType="register"
      error={error}
      footerLink={
        <div>
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-deep-green font-black hover:text-growth-green transition-colors ml-1"
          >
            Sign in
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        <nav className="flex gap-8 border-b border-border-color">
          <button
            type="button"
            className="pb-3 text-sm font-medium border-b-2 border-transparent text-muted-text hover:text-deep-green transition-colors"
            onClick={() => navigate('/login')}
          >
            Sign In
          </button>
          <button
            type="button"
            className="pb-3 text-sm font-black border-b-2 border-deep-green text-deep-green"
          >
            Create Account
          </button>
        </nav>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
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
                  placeholder="John"
                  className="auth-input auth-input-icon"
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
                  placeholder="Doe"
                  className="auth-input auth-input-icon"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-deep-green uppercase tracking-widest pl-1">
              Agency Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="auth-input auth-input-icon"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-deep-green uppercase tracking-widest pl-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
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
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-text hover:text-deep-green cursor-pointer p-0.5"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-deep-green uppercase tracking-widest pl-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
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
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-text hover:text-deep-green cursor-pointer p-0.5"
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
            className="w-full bg-deep-green text-white py-4 rounded-xl font-black hover:bg-growth-green hover:text-deep-green hover:scale-[1.02] active:scale-95 transition-all shadow-md cursor-pointer text-sm flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" /> Registering...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
