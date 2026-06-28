import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { verifyEmail, resendVerificationEmail } from '../../services/auth';
import AuthLayout from '../../components/AuthLayout';
import { Loader2, Mail } from 'lucide-react';

const verificationCache = {};
const verificationPromises = {};

const VerifyEmail = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');

  useEffect(() => {
    let active = true;

    if (!token) {
      setStatus('error');
      setMessage('Invalid verification token.');
      setLoading(false);
      return;
    }

    if (verificationCache[token]) {
      const cached = verificationCache[token];
      setStatus(cached.status);
      setMessage(cached.message);
      setLoading(false);
      return;
    }

    const runVerification = async () => {
      if (!verificationPromises[token]) {
        verificationPromises[token] = verifyEmail(token);
      }

      try {
        const res = await verificationPromises[token];
        let currentStatus = 'error';
        let currentMessage = '';
        if (res?.success || res?.message === 'Email verified successfully.') {
          currentStatus = 'success';
          currentMessage = 'Your email address has been successfully verified! You can now log in.';
        } else {
          currentStatus = 'error';
          currentMessage = res?.message || 'Verification link is invalid or has expired.';
        }
        verificationCache[token] = { status: currentStatus, message: currentMessage };
        if (active) {
          setStatus(currentStatus);
          setMessage(currentMessage);
          setLoading(false);
        }
      } catch (err) {
        const currentStatus = 'error';
        const currentMessage = err.response?.data?.message || 'Verification link is invalid or has expired.';
        verificationCache[token] = { status: currentStatus, message: currentMessage };
        if (active) {
          setStatus(currentStatus);
          setMessage(currentMessage);
          setLoading(false);
        }
      }
    };

    runVerification();

    return () => {
      active = false;
    };
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    setResendLoading(true);
    setResendError('');
    setResendSuccess(false);

    try {
      const res = await resendVerificationEmail(resendEmail);
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

  return (
    <AuthLayout
      pageType="verifyEmail"
      title="Verify Email"
      subtitle="Complete your account activation"
      error={status === 'error' && !resendSuccess ? message : ''}
      success={status === 'success' ? message : (resendSuccess ? `Verification link sent to ${resendEmail}!` : '')}
      footerLink={
        <Link to="/login" className="text-xs text-muted-text font-bold hover:text-deep-green transition-colors border-b border-transparent hover:border-deep-green pb-0.5 animate-fade-in">
          Back to Sign In
        </Link>
      }
    >
      {loading && (
        <div className="space-y-4 py-6 text-center animate-pulse">
          <Loader2 className="w-10 h-10 animate-spin text-deep-green mx-auto" />
          <p className="text-sm text-muted-text font-bold">Verifying your email address...</p>
        </div>
      )}

      {!loading && status === 'success' && (
        <div className="space-y-4 text-center">
          <p className="text-xs text-muted-text font-semibold leading-relaxed">
            Your verification is complete. Click the button below to sign in.
          </p>
          <Link to="/login" className="block w-full bg-deep-green text-white py-3.5 rounded-xl font-black hover:bg-growth-green hover:text-deep-green text-sm text-center shadow-md cursor-pointer">
            Sign In to Account
          </Link>
        </div>
      )}

      {!loading && status === 'error' && (
        <div className="space-y-5 text-left">
          <div className="h-px bg-border-color my-4" />

          {resendSuccess ? (
            <div className="space-y-4 text-center">
              <p className="text-xs text-muted-text font-semibold leading-relaxed">
                A new verification email was dispatched. Please check your inbox and follow the link.
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
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleResend} className="space-y-4">
              <p className="text-[10px] text-deep-green font-bold uppercase tracking-widest pl-1 block">
                Resend Verification Email
              </p>
              {resendError && (
                <div className="bg-red-500/5 border border-red-500/15 text-red-700 p-3 rounded-xl text-xs font-bold text-center leading-relaxed flex items-center justify-center gap-2">
                  {resendError}
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
                <input
                  type="email"
                  required
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="your-registered-email@domain.com"
                  className="auth-input auth-input-icon"
                />
              </div>
              <button
                type="submit"
                disabled={resendLoading}
                className="w-full bg-deep-green text-white py-3.5 rounded-xl font-black hover:bg-growth-green hover:text-deep-green transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {resendLoading ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> Dispatching...</>
                ) : (
                  'Request New Link'
                )}
              </button>
            </form>
          )}
        </div>
      )}
    </AuthLayout>
  );
};

export default VerifyEmail;
