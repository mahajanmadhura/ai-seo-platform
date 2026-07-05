import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  getCreditBalance,
  getCreditTransactions,
  createPaymentOrder,
  confirmPayment,
  generateAPIKey,
  revokeAPIKey
} from '../../services/payments';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  Sparkles,
  RefreshCw,
  CreditCard,
  Key,
  Copy,
  Plus,
  Loader2,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  FileText
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

export default function Billing() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [customCredits, setCustomCredits] = useState(100);
  const [processingPayment, setProcessingPayment] = useState(false);

  const [apiKey, setApiKey] = useState('');
  const [apiKeyLoading, setApiKeyLoading] = useState(false);

  const [copiedKey, setCopiedKey] = useState(false);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      setError('');
      const balanceRes = await getCreditBalance();
      const txRes = await getCreditTransactions();

      if (balanceRes.success) {
        setBalance(balanceRes.data.balance);
      } else {
        setError('Failed to fetch credit balance.');
      }

      if (txRes.success) {
        setTransactions(txRes.data);
      }
    } catch (err) {
      setError('Error loading billing records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillingData();
  }, []);

  const handleRefresh = async () => {
    const balanceRes = await getCreditBalance();
    const txRes = await getCreditTransactions();
    if (balanceRes.success) setBalance(balanceRes.data.balance);
    if (txRes.success) setTransactions(txRes.data);
    addToast('Billing records refreshed', 'info');
  };

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
        addToast(orderRes.message || 'Failed to initialize transaction order.', 'error');
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
            const verifyRes = await confirmPayment(payment_id);
            if (verifyRes.success) {
              addToast(`Successfully credited ${creditsToBuy} credits to your account!`, 'success');
              const newBalance = await getCreditBalance();
              const newTx = await getCreditTransactions();
              if (newBalance.success) setBalance(newBalance.data.balance);
              if (newTx.success) setTransactions(newTx.data);
            } else {
              addToast('Payment verification failed.', 'error');
            }
          } catch (err) {
            addToast('Error verifying transaction confirmation.', 'error');
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
          ondismiss: function () {
            addToast('Payment cancelled.', 'info');
            setProcessingPayment(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      addToast('Error processing credit checkout.', 'error');
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
      addToast('Developer API key revoked successfully.', 'success');
    } else {
      addToast('Failed to revoke API key.', 'error');
    }
    setApiKeyLoading(false);
  };

  const handleCopyKey = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    addToast('API key copied to clipboard', 'success');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const packages = [
    { name: 'Starter Pack', credits: 100, price: 100.0, description: 'Best for single sites.' },
    { name: 'Growth Pack', credits: 500, price: 450.0, description: 'Best for growing agencies.' },
    { name: 'Agency Pack', credits: 1000, price: 800.0, description: 'Best for heavy users.' }
  ];

  return (
    <DashboardLayout title="Billing & Credits">
      <div className="space-y-8 text-left">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-deep-green tracking-tight font-sans">Billing & Credits</h2>
          <p className="text-xs text-muted-text mt-1 font-semibold leading-relaxed max-w-2xl">
            Monitor your credit balance, buy credit packages, and manage your developer api access credentials.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/5 border border-red-500/15 text-red-700 p-4 rounded-xl text-xs font-bold text-center leading-relaxed">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-border-color/60 shadow-sm relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#E5F3EC] rounded-full blur-3xl pointer-events-none"></div>
              <div className="space-y-3 relative z-10 text-left">
                <span className="text-[10px] font-black uppercase tracking-wider text-muted-text/70">Current Balance</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-black text-deep-green">
                    {loading ? (
                      <span className="h-10 w-16 bg-soft-bg rounded animate-pulse inline-block"></span>
                    ) : (
                      balance ?? 0
                    )}
                  </span>
                  <span className="text-xs text-muted-text font-bold">Credits</span>
                </div>
                <p className="text-[10px] text-muted-text font-semibold max-w-md">
                  Credits are used to run website audits. Each crawl consumes 5 credits.
                </p>
              </div>

              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-1.5 bg-deep-green/5 hover:bg-deep-green/10 text-deep-green border border-deep-green/10 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer relative z-10 shadow-sm uppercase tracking-wider flex-shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh Balance
              </button>
            </div>

            <div className="bg-white rounded-3xl p-6 md:p-8 border border-border-color/60 shadow-sm space-y-6 text-left">
              <div className="border-b border-border-color/40 pb-4">
                <h3 className="font-black text-deep-green text-base tracking-tight">Buy Credit Packages</h3>
                <p className="text-[10px] text-muted-text mt-0.5 font-semibold">Select a predefined bundle or buy custom credits.</p>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                {packages.map((pkg) => (
                  <div
                    key={pkg.name}
                    className="bg-[#E5F3EC]/20 rounded-2xl border border-border-color/40 p-5 flex flex-col justify-between min-h-[180px] hover:border-deep-green/30 transition-all group"
                  >
                    <div className="space-y-3">
                      <span className="text-[9px] font-black uppercase tracking-wider text-muted-text/80">{pkg.name}</span>
                      <div>
                        <h4 className="text-2xl font-black text-deep-green">{pkg.credits}</h4>
                        <span className="text-[9px] text-muted-text font-bold uppercase">Credits</span>
                      </div>
                      <p className="text-[9px] text-muted-text leading-relaxed font-semibold">{pkg.description}</p>
                    </div>

                    <button
                      onClick={() => handlePurchase(pkg.credits, pkg.price)}
                      disabled={processingPayment}
                      className="w-full bg-deep-green text-white hover:bg-[#36E682] hover:text-[#053D34] py-2.5 rounded-xl text-[10px] font-black transition-all cursor-pointer text-center shadow-md uppercase tracking-wider mt-4"
                    >
                      Buy for ₹{pkg.price}
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-border-color/30 pt-6 space-y-4">
                <h4 className="text-xs font-black text-deep-green uppercase tracking-wider">Or Buy Custom Credits</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-grow">
                    <input
                      type="number"
                      min="10"
                      max="10000"
                      value={customCredits}
                      onChange={(e) => setCustomCredits(Math.max(10, parseInt(e.target.value) || 10))}
                      className="auth-input pl-4 text-xs font-semibold"
                      placeholder="Enter credits quantity"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-muted-text font-black uppercase">
                      Credits (₹1 / unit)
                    </span>
                  </div>

                  <button
                    onClick={() => handlePurchase(customCredits, customCredits)}
                    disabled={processingPayment}
                    className="bg-deep-green hover:bg-[#36E682] text-white hover:text-[#053D34] px-6 py-3.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    {processingPayment ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> Loading...
                      </>
                    ) : (
                      <>
                        Buy for ₹{customCredits} <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-border-color/60 shadow-sm space-y-5 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#E5F3EC] rounded-full blur-3xl pointer-events-none"></div>
              <div className="border-b border-border-color/40 pb-4 relative z-10">
                <h3 className="font-black text-deep-green text-base tracking-tight flex items-center gap-2">
                  <Key className="w-4.5 h-4.5 text-[#0B5A4A]" /> API Developer Access
                </h3>
                <p className="text-[10px] text-muted-text mt-0.5 font-semibold">Integrate audits into external head pipelines.</p>
              </div>

              {apiKey ? (
                <div className="space-y-4 relative z-10 animate-fade-in">
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

                  <div className="flex flex-col gap-2 pt-2">
                    <button
                      onClick={handleGenerateKey}
                      disabled={apiKeyLoading}
                      className="w-full bg-[#E5F3EC] hover:bg-deep-green/10 border border-deep-green/10 text-deep-green py-2.5 rounded-xl text-[10px] font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider"
                    >
                      {apiKeyLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Regenerate API Key'}
                    </button>
                    <button
                      onClick={handleRevokeKey}
                      disabled={apiKeyLoading}
                      className="w-full bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 text-red-600 py-2.5 rounded-xl text-[10px] font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider"
                    >
                      {apiKeyLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Revoke Key Access'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 text-center py-6 relative z-10 animate-fade-in">
                  <p className="text-xs text-muted-text leading-relaxed font-semibold max-w-xs mx-auto">
                    No active developer API key found. Generate one now to start querying validated domain audits programmatically.
                  </p>
                  <button
                    onClick={handleGenerateKey}
                    disabled={apiKeyLoading}
                    className="inline-flex items-center gap-1.5 bg-[#053D34] hover:bg-[#36E682] text-white hover:text-[#053D34] px-6 py-3 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer uppercase tracking-wider"
                  >
                    {apiKeyLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...
                      </>
                    ) : (
                      'Generate API Key'
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-[#E5F3EC]/35 rounded-3xl p-6 border border-border-color/60 shadow-sm text-left">
              <h4 className="text-xs font-black text-deep-green uppercase tracking-wider mb-2">Billing Help & Notes</h4>
              <ul className="space-y-2 text-[10px] text-muted-text font-semibold list-disc pl-4 leading-relaxed">
                <li>Payment processing gateway is powered securely by Razorpay.</li>
                <li>Credits never expire and carry over billing cycles.</li>
                <li>If a crawl task fails, consumed credits are credited back.</li>
                <li>For support queries, contact info@athenura.com.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-8 border border-border-color/60 shadow-sm text-left">
          <div className="border-b border-border-color/40 pb-4 mb-5">
            <h3 className="font-black text-deep-green text-base tracking-tight flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-[#0B5A4A]" /> Transaction History
            </h3>
            <p className="text-[10px] text-muted-text mt-0.5 font-semibold font-sans">History of purchased credits and deductions.</p>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 bg-soft-bg rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-xs text-muted-text font-semibold">No payments yet. Buy credits to start running audits.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border-color/40 text-[9px] font-black uppercase text-muted-text/70">
                    <th className="pb-3 pl-2">Date/Time</th>
                    <th className="pb-3">Transaction Type</th>
                    <th className="pb-3">Description</th>
                    <th className="pb-3 text-right pr-2">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color/20">
                  {transactions.map((tx) => {
                    const isPositive = tx.amount > 0;
                    return (
                      <tr key={tx.id} className="hover:bg-soft-bg/30">
                        <td className="py-3.5 pl-2 font-medium text-muted-text">
                          {tx.created_at ? new Date(tx.created_at).toLocaleString() : 'N/A'}
                        </td>
                        <td className="py-3.5 uppercase text-[9px] font-black tracking-wider">
                          <span
                            className={`px-2 py-0.5 rounded-full ${
                              tx.transaction_type === 'purchase'
                                ? 'bg-[#36E682]/10 text-[#053D34] border border-[#36E682]/30'
                                : tx.transaction_type === 'admin_adjustment'
                                ? 'bg-deep-green/10 text-deep-green border border-deep-green/20'
                                : 'bg-red-500/10 text-red-700 border border-red-500/20'
                            }`}
                          >
                            {tx.transaction_type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 text-deep-green font-semibold">
                          {tx.description || 'No description provided'}
                        </td>
                        <td
                          className={`py-3.5 text-right pr-2 font-black ${
                            isPositive ? 'text-[#0B5A4A]' : 'text-red-600'
                          }`}
                        >
                          {isPositive ? `+${tx.amount}` : tx.amount}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
