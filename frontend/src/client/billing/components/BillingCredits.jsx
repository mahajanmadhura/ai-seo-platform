import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import {
  getCreditTransactions,
  createPaymentOrder,
  confirmPayment,
  cancelPayment,
  failPayment,
  generateAPIKey,
  revokeAPIKey,
  getAPIKey
} from '../../../services/payments';
import {
  RefreshCw,
  CreditCard,
  Key,
  Copy,
  ArrowRight,
  FileText,
  Loader2
} from 'lucide-react';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function BillingCredits() {
  const navigate = useNavigate();
  const { user, credits, refreshCredits } = useAuth();
  const { addToast } = useToast();

  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState('');
  const [customCredits, setCustomCredits] = useState(100);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiKeyLoading, setApiKeyLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const fetchBillingData = async () => {
    try {
      setBillingLoading(true);
      setBillingError('');
      await refreshCredits();
      const keyRes = await getAPIKey();
      if (keyRes.success && keyRes.data) {
        setApiKey(keyRes.data.api_key || '');
      }
    } catch (err) {
      setBillingError('Failed to load billing status.');
    } finally {
      setBillingLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchBillingData();
    addToast('Billing status refreshed', 'info');
  };

  useEffect(() => {
    fetchBillingData();
  }, []);

  const handlePurchase = async (creditsToBuy, costInInr) => {
    setProcessingPayment(true);
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      addToast('Failed to load Razorpay checkout script.', 'error');
      setProcessingPayment(false);
      return;
    }

    try {
      const orderRes = await createPaymentOrder(costInInr, creditsToBuy);
      if (!orderRes.success || !orderRes.data) {
        addToast(orderRes.message || 'Failed to initialize payment.', 'error');
        setProcessingPayment(false);
        return;
      }

      const { razorpay_key, razorpay_order_id, amount, currency, payment_id } = orderRes.data;

      const options = {
        key: razorpay_key,
        amount: amount,
        currency: currency,
        name: 'Athenura AI SEO Platform',
        description: `Purchase of ${creditsToBuy} Credits`,
        order_id: razorpay_order_id,
        handler: async function (response) {
          setProcessingPayment(true);
          try {
            const verifyRes = await confirmPayment(payment_id, response.razorpay_payment_id);
            if (verifyRes.success) {
              addToast(`Successfully credited ${creditsToBuy} credits!`, 'success');
              fetchBillingData();
            } else {
              addToast('Payment verification failed.', 'error');
            }
          } catch (err) {
            addToast('Error verifying transaction.', 'error');
          } finally {
            setProcessingPayment(false);
          }
        },
        prefill: {
          email: user?.email || '',
          name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim()
        },
        theme: {
          color: '#053D34'
        },
        modal: {
          ondismiss: async function () {
            await cancelPayment(payment_id);
            addToast('Payment checkout cancelled.', 'info');
            setProcessingPayment(false);
            fetchBillingData();
          }
        }
      };

      const rzpInstance = new window.Razorpay(options);

      rzpInstance.on('payment.failed', async function (response) {
        const errorDesc = response.error?.description || 'Gateway declined payment';
        await failPayment(payment_id, errorDesc);
        addToast(`Payment failed: ${errorDesc}`, 'error');
        setProcessingPayment(false);
        fetchBillingData();
      });

      rzpInstance.open();
    } catch (err) {
      addToast('Error opening payments checkout.', 'error');
      setProcessingPayment(false);
    }
  };

  const handleGenerateKey = async () => {
    setApiKeyLoading(true);
    const res = await generateAPIKey();
    if (res.success && res.data) {
      setApiKey(res.data.api_key);
      addToast('Developer API key generated successfully.', 'success');
    } else {
      addToast('Failed to generate API key.', 'error');
    }
    setApiKeyLoading(false);
  };

  const handleRevokeKey = async () => {
    setApiKeyLoading(true);
    const res = await revokeAPIKey();
    if (res.success) {
      setApiKey('');
      addToast('Developer API key revoked.', 'success');
    } else {
      addToast('Failed to revoke key.', 'error');
    }
    setApiKeyLoading(false);
  };

  const handleCopyKey = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    addToast('Copied to clipboard', 'success');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const packages = [
    { name: 'Starter Pack', credits: 100, price: 100.0, desc: 'Best for single sites.' },
    { name: 'Growth Pack', credits: 500, price: 450.0, desc: 'Best for growing agencies.' },
    { name: 'Agency Pack', credits: 1000, price: 800.0, desc: 'Best for large agencies.' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-color/60 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#E5F3EC] rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-3 relative z-10">
          <span className="text-[10px] font-black uppercase tracking-wider text-muted-text/70">Current Balance</span>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl md:text-5xl font-black text-deep-green">
              {billingLoading ? (
                <span className="h-10 w-16 bg-soft-bg rounded animate-pulse inline-block"></span>
              ) : (
                credits ?? 0
              )}
            </span>
            <span className="text-xs text-muted-text font-bold">Credits</span>
          </div>
          <p className="text-[10px] text-muted-text font-semibold">
            Credits are used to run website audits. Each crawl consumes 5 credits.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={billingLoading}
          className="flex items-center gap-1.5 bg-deep-green/5 hover:bg-deep-green/10 text-deep-green border border-deep-green/10 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer relative z-10 shadow-sm uppercase tracking-wider flex-shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${billingLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-color/60 shadow-sm space-y-6">
        <div className="border-b border-border-color/40 pb-4">
          <h3 className="font-black text-deep-green text-base tracking-tight">Buy Credit Packages</h3>
          <p className="text-[10px] text-muted-text mt-0.5 font-semibold">Select a predefined bundle or buy custom credits.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className="bg-[#E5F3EC]/20 rounded-2xl border border-border-color/40 p-5 flex flex-col justify-between min-h-[170px] hover:border-deep-green/30 transition-all group"
            >
              <div className="space-y-3">
                <span className="text-[9px] font-black uppercase tracking-wider text-muted-text/80">{pkg.name}</span>
                <div>
                  <h4 className="text-xl font-black text-deep-green">{pkg.credits}</h4>
                  <span className="text-[9px] text-muted-text font-bold uppercase">Credits</span>
                </div>
                <p className="text-[9px] text-muted-text font-semibold leading-relaxed">{pkg.desc}</p>
              </div>
              <button
                onClick={() => handlePurchase(pkg.credits, pkg.price)}
                disabled={processingPayment}
                className="w-full bg-deep-green text-white hover:bg-[#36E682] hover:text-[#053D34] py-2.5 rounded-xl text-[10px] font-black transition-all cursor-pointer text-center shadow-sm uppercase tracking-wider mt-4"
              >
                Buy for ₹{pkg.price}
              </button>
            </div>
          ))}
        </div>

        <div className="border-t border-border-color/30 pt-6 space-y-4">
          <h4 className="text-xs font-black text-deep-green uppercase tracking-wider">Or Buy Custom Credits</h4>
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <input
                  type="number"
                  min="50"
                  max="10000"
                  value={customCredits || ''}
                  onChange={(e) => setCustomCredits(parseInt(e.target.value) || 0)}
                  className={`auth-input pl-4 text-xs font-semibold ${customCredits > 0 && customCredits < 50 ? 'border-red-500 focus:border-red-500' : ''}`}
                  placeholder="Minimum 50 credits"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-muted-text font-black uppercase">
                  Credits (₹1/unit)
                </span>
              </div>
              <button
                onClick={() => handlePurchase(customCredits, customCredits)}
                disabled={processingPayment || customCredits < 50}
                className="bg-deep-green hover:bg-[#36E682] text-white hover:text-[#053D34] px-6 py-3.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> Loading...
                  </>
                ) : (
                  <>
                    Buy for ₹{customCredits || 0} <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
            {customCredits > 0 && customCredits < 50 && (
              <p className="text-[10px] text-red-600 font-bold pl-1">
                Minimum purchase is 50 credits.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-color/60 shadow-sm space-y-5">
        <div className="border-b border-border-color/40 pb-4 mb-5">
          <h3 className="font-black text-deep-green text-base tracking-tight flex items-center gap-2">
            <Key className="w-4.5 h-4.5 text-[#0B5A4A]" /> API Developer Credentials
          </h3>
          <p className="text-[10px] text-muted-text mt-0.5 font-semibold">Integrate audits into external head pipelines.</p>
        </div>

        {apiKey ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-deep-green uppercase tracking-widest pl-1">
                Active API Key
              </label>
              <div className="flex gap-2 bg-[#E5F3EC]/40 p-2 rounded-2xl border border-border-color/50">
                <input
                  type="text"
                  readOnly
                  value={apiKey}
                  className="flex-grow text-xs font-mono py-1.5 bg-transparent text-deep-green border-none focus:outline-none pl-2 select-all overflow-ellipsis font-bold"
                />
                <button
                  onClick={handleCopyKey}
                  className="bg-deep-green hover:bg-[#36E682] text-white hover:text-[#053D34] px-3.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer flex-shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedKey ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleGenerateKey}
                disabled={apiKeyLoading}
                className="flex-grow bg-[#E5F3EC] hover:bg-deep-green/10 border border-deep-green/10 text-deep-green py-2.5 rounded-xl text-[10px] font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider"
              >
                {apiKeyLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Regenerate'}
              </button>
              <button
                onClick={handleRevokeKey}
                disabled={apiKeyLoading}
                className="flex-grow bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 text-red-600 py-2.5 rounded-xl text-[10px] font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider"
              >
                {apiKeyLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Revoke Key'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-center py-4">
            <p className="text-xs text-muted-text leading-relaxed font-semibold max-w-xs mx-auto">
              No developer API key found. Generate one now to start querying validated domain audits programmatically.
            </p>
            <button
              onClick={handleGenerateKey}
              disabled={apiKeyLoading}
              className="inline-flex items-center gap-1.5 bg-[#053D34] hover:bg-[#36E682] text-white hover:text-[#053D34] px-6 py-3 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer uppercase tracking-wider"
            >
              {apiKeyLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Generate API Key'}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-border-color/60 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1.5 text-left">
          <h3 className="font-black text-deep-green text-base tracking-tight flex items-center gap-2">
            <FileText className="w-4.5 h-4.5 text-[#0B5A4A]" /> Billing & Ledger History
          </h3>
          <p className="text-xs text-muted-text font-semibold">
            View financial payment history and credit wallet ledger logs.
          </p>
        </div>
        <button
          onClick={() => navigate('/settings/transactions')}
          className="bg-deep-green hover:bg-[#36E682] text-white hover:text-[#053D34] px-6 py-3 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md uppercase tracking-wider flex-shrink-0"
        >
          View Billing History
        </button>
      </div>
    </div>
  );
}
