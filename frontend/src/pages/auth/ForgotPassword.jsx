import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../services/auth';
import AuthLayout from '../../components/AuthLayout';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await forgotPassword(email);
      if (res?.success) {
        setSuccess(true);
      } else {
        setError(res?.message || 'Password reset request failed.');
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        setError(Object.values(errors).flat().join(' '));
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('No account found with this email.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      pageType="forgotPassword"
      title="Recover Access"
      subtitle="Enter your email to request a reset link"
      error={error}
      success={success ? `Reset link has been sent to ${email}. Check your inbox!` : ''}
      footerLink={
        <Link to="/login" className="text-xs text-muted-text font-bold hover:text-deep-green transition-colors inline-flex items-center gap-1.5 border-b border-transparent hover:border-deep-green pb-0.5 animate-fade-in">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
        </Link>
      }
    >
      {success ? (
        <div className="space-y-4 text-center">
          <p className="text-xs text-muted-text font-semibold leading-relaxed">
            If an account is associated with this address, you'll receive a password reset link shortly.
          </p>
          <a
            href="https://mail.google.com/mail/u/0/#inbox"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-deep-green text-white py-3.5 rounded-xl font-black hover:bg-growth-green hover:text-deep-green hover:scale-[1.02] active:scale-95 transition-all text-sm block text-center cursor-pointer shadow-md"
          >
            Open Gmail
          </a>
          <Link to="/login" className="block w-full bg-transparent border border-border-color text-deep-green py-3.5 rounded-xl font-bold hover:bg-mint-surface transition-all text-sm text-center cursor-pointer">
            Back to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <p className="text-xs text-muted-text leading-relaxed text-left font-semibold">
            Enter your registered email address below, and we will send you instructions to reset your credentials.
          </p>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-deep-green uppercase tracking-widest pl-1 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
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
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-deep-green text-white py-3.5 rounded-xl font-black hover:bg-growth-green hover:text-deep-green hover:scale-[1.02] active:scale-95 transition-all shadow-md text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin text-white" /> Dispatching...</>
            ) : (
              'Send Reset Instructions'
            )}
          </button>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
