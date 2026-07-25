import React, { useState } from 'react';
import { Mail, X, Loader2, Send } from 'lucide-react';
import ModalMotion from '../../../components/motion/ModalMotion';

export default function EmailModal({ isOpen, onClose, onSendEmail, loading }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setError('Recipient email address is required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      setError('Please enter a valid email address.');
      return;
    }

    onSendEmail(emailTrimmed);
  };

  const handleClose = () => {
    if (loading) return;
    setEmail('');
    setError('');
    onClose();
  };

  return (
    <ModalMotion isOpen={isOpen} onClose={handleClose} className="max-w-md">
      <div className="relative w-full bg-white rounded-3xl border border-border-color/60 shadow-2xl p-6 sm:p-8 space-y-6 text-left">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E5F3EC] border border-border-color/40 flex items-center justify-center text-deep-green">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-deep-green tracking-tight">Email SEO Report</h3>
              <p className="text-xs text-muted-text font-semibold">Send PDF report directly to a client or team member.</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-1.5 hover:bg-soft-bg rounded-xl text-muted-text hover:text-deep-green transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-wider text-deep-green">
              Recipient Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted-text/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder="client@example.com"
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-soft-bg border border-border-color/60 text-xs font-bold text-deep-green placeholder:text-muted-text/50 focus:outline-none focus:border-deep-green focus:bg-white transition-all disabled:opacity-50"
              />
            </div>
            {error && <p className="text-[11px] font-bold text-red-600 mt-1">{error}</p>}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-border-color/60 text-xs font-bold text-muted-text hover:text-deep-green hover:bg-soft-bg transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-deep-green hover:bg-[#36E682] text-white hover:text-deep-green px-5 py-2.5 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Send Email
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </ModalMotion>
  );
}
