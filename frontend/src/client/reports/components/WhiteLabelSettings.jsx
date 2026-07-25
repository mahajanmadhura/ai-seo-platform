import React, { useState, useEffect } from 'react';
import { Palette, Building, CheckCircle2, Loader2, Save, Sparkles, Check, FileText } from 'lucide-react';
import { getBranding, updateBranding } from '../../../services/reports';
import { useToast } from '../../../context/ToastContext';

const PRESET_COLORS = [
  { name: 'Deep Forest', hex: '#0A4B43' },
  { name: 'Emerald Green', hex: '#059669' },
  { name: 'Royal Blue', hex: '#2563EB' },
  { name: 'Slate Navy', hex: '#1E293B' },
  { name: 'Deep Purple', hex: '#7C3AED' }
];

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
      addToast(res.data.message || 'Branding settings saved successfully!', 'success');
      setFormData({
        company_name: res.data.company_name ?? formData.company_name,
        primary_color: res.data.primary_color ?? formData.primary_color,
        is_white_label: res.data.is_white_label ?? true,
      });
      setLastSaved(new Date());
    } else {
      addToast(res.message || 'Failed to save branding settings.', 'error');
    }

    setLoading(false);
  };

  const activeColor = formData.primary_color.startsWith('#') && formData.primary_color.length === 7
    ? formData.primary_color
    : '#0A4B43';

  const previewName = formData.is_white_label && formData.company_name.trim()
    ? formData.company_name.trim()
    : 'Athenura AI SEO Auditor';

  return (
    <div className="bg-white rounded-3xl border border-border-color/60 p-6 sm:p-8 shadow-sm space-y-6 text-left max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-color/40 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#E5F3EC] border border-border-color/40 flex items-center justify-center text-deep-green flex-shrink-0">
            <Palette className="w-5 h-5 text-forest-green" />
          </div>
          <div>
            <h3 className="text-lg font-black text-deep-green tracking-tight">White Label Custom Branding</h3>
            <p className="text-xs text-muted-text font-semibold">
              Customize company name, primary theme color, and white-label preferences for PDF reports.
            </p>
          </div>
        </div>

        {lastSaved && (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Saved at {lastSaved.toLocaleTimeString()}
          </span>
        )}
      </div>

      {fetching ? (
        <div className="p-12 text-center flex flex-col items-center justify-center min-h-[250px]">
          <Loader2 className="w-8 h-8 text-deep-green animate-spin" />
          <p className="text-xs text-muted-text mt-3 font-bold">Loading branding configuration...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: FORM CONTROLS (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* 1. Toggle Switch Card */}
              <div className="p-4 rounded-2xl bg-soft-bg border border-border-color/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-deep-green uppercase tracking-wider">
                    Enable White Label Custom Branding
                  </span>
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
                <p className="text-[11px] text-muted-text font-semibold leading-relaxed">
                  When turned <strong className="text-deep-green">ON</strong> and saved, your custom company name and theme color will replace default branding on all newly compiled PDF reports.
                </p>
              </div>

              {/* 2. Company / Agency Name */}
              <div className="space-y-2">
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
                    disabled={loading || !formData.is_white_label}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-soft-bg border border-border-color/60 text-xs font-bold text-deep-green placeholder:text-muted-text/40 focus:outline-none focus:border-deep-green focus:bg-white transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              {/* 3. Primary Theme Color & Palette Swatches */}
              <div className="space-y-3">
                <label className="block text-xs font-black uppercase tracking-wider text-deep-green">
                  Primary Theme Color
                </label>

                {/* Swatches */}
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((preset) => {
                    const isSelected = activeColor.toLowerCase() === preset.hex.toLowerCase();
                    return (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => handleChange('primary_color', preset.hex)}
                        disabled={loading || !formData.is_white_label}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'border-deep-green bg-soft-bg text-deep-green shadow-xs'
                            : 'border-border-color/40 text-muted-text hover:bg-soft-bg'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10 flex-shrink-0"
                          style={{ backgroundColor: preset.hex }}
                        />
                        <span>{preset.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-deep-green" />}
                      </button>
                    );
                  })}
                </div>

                {/* Hex Input & Native Picker */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="relative flex-grow">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-muted-text">#</span>
                    <input
                      type="text"
                      value={formData.primary_color.replace(/^#/, '')}
                      onChange={(e) => handleChange('primary_color', `#${e.target.value}`)}
                      placeholder="0A4B43"
                      maxLength={6}
                      disabled={loading || !formData.is_white_label}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-soft-bg border border-border-color/60 text-xs font-mono font-bold text-deep-green placeholder:text-muted-text/50 focus:outline-none focus:border-deep-green focus:bg-white transition-all disabled:opacity-50"
                    />
                  </div>

                  <input
                    type="color"
                    value={activeColor}
                    onChange={(e) => handleChange('primary_color', e.target.value)}
                    disabled={loading || !formData.is_white_label}
                    className="w-11 h-10 rounded-xl border border-border-color/60 cursor-pointer bg-transparent p-1 disabled:opacity-50 flex-shrink-0"
                    title="Choose Custom Color"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-deep-green hover:bg-[#36E682] text-white hover:text-deep-green px-7 py-3 rounded-2xl text-xs font-black transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving Settings...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Branding Settings
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* RIGHT COLUMN: LIVE INTERACTIVE PDF COVER PREVIEW (5 cols) */}
            <div className="lg:col-span-5 bg-soft-bg/80 rounded-3xl p-5 border border-border-color/60 space-y-4">
              <div className="flex items-center justify-between border-b border-border-color/40 pb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-text flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-forest-green" /> Live PDF Cover Preview
                </span>
                <span className="text-[9px] font-mono font-bold text-deep-green bg-white px-2 py-0.5 rounded-md border border-border-color/40">
                  A4 Report Page
                </span>
              </div>

              {/* Live PDF Mockup Card */}
              <div className="bg-white rounded-2xl p-6 border border-border-color/60 shadow-md space-y-5 transition-all">
                {/* Header Title with Custom Primary Theme Color */}
                <div className="space-y-1.5 border-b border-border-color/30 pb-4">
                  <h2
                    className="text-lg font-black tracking-tight transition-colors"
                    style={{ color: activeColor }}
                  >
                    {previewName}
                  </h2>
                  <div className="flex items-center justify-between text-[10px] text-muted-text font-semibold">
                    <span>SEO AUDIT REPORT</span>
                    <span className="font-mono">ID: #1042</span>
                  </div>
                </div>

                {/* Styled Divider Line */}
                <div
                  className="h-1 rounded-full transition-colors"
                  style={{ backgroundColor: activeColor }}
                />

                {/* Sample PDF Content Mockup */}
                <div className="space-y-3 pt-1">
                  <div
                    className="p-3 rounded-xl text-white font-bold text-xs flex justify-between items-center transition-colors"
                    style={{ backgroundColor: activeColor }}
                  >
                    <span>Executive Summary</span>
                    <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">Score: 88/100</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="h-2 bg-soft-bg rounded-full w-full" />
                    <div className="h-2 bg-soft-bg rounded-full w-4/5" />
                    <div className="h-2 bg-soft-bg rounded-full w-3/5" />
                  </div>
                </div>

                {/* Footer Mockup */}
                <div className="border-t border-border-color/30 pt-3 text-[9px] text-muted-text font-medium flex justify-between">
                  <span>Generated by {previewName}</span>
                  <span>Page 1 of 1</span>
                </div>
              </div>

              <p className="text-[10px] text-muted-text/80 font-medium text-center">
                This preview updates in real-time as you type your company name or pick colors.
              </p>
            </div>

          </div>
        </form>
      )}
    </div>
  );
}
