import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { createWebsite } from '../services/websites';
import { Globe, X, Loader2 } from 'lucide-react';

export default function AddWebsiteModal({ isOpen, onClose }) {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const { addToast } = useToast();
  const navigate = useNavigate();

  const validateUrl = (url) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!domain.trim()) {
      setValidationError('Website URL is required.');
      return;
    }

    if (!validateUrl(domain)) {
      setValidationError('Please enter a valid URL (e.g. https://example.com).');
      return;
    }

    setLoading(true);

    try {
      const res = await createWebsite(domain.trim());
      if (res?.success && res?.data) {
        addToast('Website added successfully.', 'success');
        setDomain('');
        onClose();
        navigate(`/websites/${res.data.id}`);
      } else {
        setValidationError(res?.message || 'Failed to add website.');
      }
    } catch (err) {
      setValidationError(
        err.response?.data?.domain?.[0] ||
          err.response?.data?.message ||
          'Error adding website.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#053D34]/40 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-[32px] border border-border-color/60 p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-left animate-scale-up">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 hover:bg-soft-bg rounded-lg text-muted-text hover:text-deep-green transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-black text-deep-green tracking-tight">Add Website</h3>
            <p className="text-xs text-muted-text mt-1 font-semibold leading-relaxed">
              Add your domain to your workspace before ownership verification.
            </p>
          </div>

          {validationError && (
            <div className="bg-red-500/5 border border-red-500/15 text-red-700 p-4 rounded-xl text-xs font-bold text-center leading-relaxed">
              {validationError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-deep-green uppercase tracking-widest pl-1">
                Website URL
              </label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
                <input
                  type="text"
                  required
                  placeholder="https://example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="auth-input auth-input-icon text-xs font-medium"
                />
              </div>
              <p className="text-[10px] text-muted-text pl-1 font-medium">
                Use the full URL including https://
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-grow bg-deep-green text-white py-3.5 rounded-xl font-black hover:bg-[#36E682] hover:text-[#053D34] transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" /> Adding...
                  </>
                ) : (
                  'Add Website'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="bg-deep-green/5 hover:bg-deep-green/10 text-deep-green border border-deep-green/10 text-center py-3.5 px-6 rounded-xl font-black transition-all text-xs flex items-center justify-center cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
