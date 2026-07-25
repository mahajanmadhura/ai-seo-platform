import React, { useState, useEffect } from 'react';
import { Palette, Building, CheckCircle2, Loader2, Save } from 'lucide-react';
import { getBranding, updateBranding } from '../../../services/reports';
import { useToast } from '../../../context/ToastContext';

export default function WhiteLabelSettings() {
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    company_name: '',
    primary_color: '#0A4B43',
    is_white_label: true,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    loadExistingBranding();
  }, []);

  const loadExistingBranding = async () => {
    setFetching(true);
    const res = await getBranding();
    if (res.success && res.data) {
      setFormData({
        company_name: res.data.company_name || '',
        primary_color: res.data.primary_color || '#0A4B43',
        is_white_label: res.data.is_white_label ?? true,
      });
    }
    setFetching(false);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await updateBranding(formData);

    if (res.success && res.data) {
      addToast(res.data.message || 'Branding settings updated successfully!', 'success');
      setFormData({
        company_name: res.data.company_name ?? formData.company_name,
        primary_color: res.data.primary_color ?? formData.primary_color,
        is_white_label: res.data.is_white_label ?? true,
      });
      setLastSaved(new Date());
    } else {
      addToast(res.message || 'Failed to update branding settings.', 'error');
    }

    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-border-color/60 p-6 shadow-xs space-y-6 text-left">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-color/40 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E5F3EC] border border-border-color/40 flex items-center justify-center text-deep-green">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-black text-deep-green tracking-tight">White Label Branding Settings</h3>
            <p className="text-xs text-muted-text font-semibold">
              Customize company name, primary theme color, and white-label preferences for PDF reports.
            </p>
          </div>
        </div>

        {lastSaved && (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-forest-green">
            <CheckCircle2 className="w-4 h-4" /> Saved at {lastSaved.toLocaleTimeString()}
          </span>
        )}
      </div>

      {fetching ? (
        <div className="p-8 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-6 h-6 text-deep-green animate-spin" />
          <p className="text-xs text-muted-text mt-2 font-bold">Loading branding settings...</p>
        </div>
      ) : (
        /* Form */
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Company Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-deep-green">
                Company / Agency Name
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-muted-text/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.company_name}
                  onChange={(e) => handleChange('company_name', e.target.value)}
                  placeholder="e.g. Acme Agency"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-soft-bg border border-border-color/60 text-xs font-bold text-deep-green placeholder:text-muted-text/50 focus:outline-none focus:border-deep-green focus:bg-white transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Primary Theme Color */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-deep-green">
                Primary Theme Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={formData.primary_color}
                  onChange={(e) => handleChange('primary_color', e.target.value)}
                  placeholder="#0A4B43"
                  maxLength={7}
                  disabled={loading}
                  className="w-full px-4 py-2.5 rounded-xl bg-soft-bg border border-border-color/60 text-xs font-mono font-bold text-deep-green placeholder:text-muted-text/50 focus:outline-none focus:border-deep-green focus:bg-white transition-all disabled:opacity-50"
                />
                <input
                  type="color"
                  value={
                    formData.primary_color.startsWith('#') && formData.primary_color.length === 7
                      ? formData.primary_color
                      : '#0A4B43'
                  }
                  onChange={(e) => handleChange('primary_color', e.target.value)}
                  disabled={loading}
                  className="w-10 h-10 rounded-xl border border-border-color/60 cursor-pointer bg-transparent p-1 disabled:opacity-50 flex-shrink-0"
                  title="Pick Color"
                />
              </div>
            </div>

            {/* White Label Toggle */}
            <div className="space-y-1.5 flex flex-col justify-end md:col-span-2">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#E5F3EC]/50 border border-border-color/40">
                <div>
                  <span className="text-xs font-black text-deep-green uppercase tracking-wider block">
                    Enable White Label Custom Branding
                  </span>
                  <span className="text-[11px] text-muted-text font-semibold">
                    When enabled, your company name and primary color will replace default branding on generated PDF reports.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={formData.is_white_label}
                    onChange={(e) => handleChange('is_white_label', e.target.checked)}
                    disabled={loading}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-deep-green"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-deep-green hover:bg-[#36E682] text-white hover:text-deep-green px-6 py-2.5 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Branding Settings
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
