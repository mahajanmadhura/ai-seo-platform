import React, { useState } from 'react';
import { adjustUserCredits } from '../../services/admin';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import ModalMotion from '../../components/motion/ModalMotion';

export default function CreditAdjustmentModal({ user, onClose, onUpdateSuccess }) {
  const { addToast } = useToast();
  const [balance, setBalance] = useState(user?.credits ?? 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (balance < 0) {
      setError('Credit balance cannot be negative.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const res = await adjustUserCredits(user.id, balance);
    if (res.success) {
      addToast(`Credits updated successfully for ${user.email}`, 'success');
      onUpdateSuccess(user.id, balance);
      onClose();
    } else {
      setError(res.message || 'Failed to adjust credit balance.');
    }
    setLoading(false);
  };

  return (
    <ModalMotion isOpen={true} onClose={onClose} className="max-w-md">
      <div className="bg-white rounded-3xl border border-neutral-100 shadow-2xl overflow-hidden flex flex-col text-left font-sans">
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex justify-between items-center bg-[#F8FAFC]">
          <div>
            <h3 className="text-sm font-black text-deep-green uppercase tracking-wider">Adjust Credits</h3>
            <p className="text-[10px] text-muted-text font-semibold mt-0.5">Admin manual token adjustment operation.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-neutral-200/60 text-muted-text hover:text-deep-green transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-150 rounded-xl text-red-700 text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase text-muted-text tracking-wider">User Target</span>
            <div className="p-3 bg-[#F8FAFC] rounded-xl border border-neutral-100 space-y-0.5">
              <p className="text-xs font-bold text-deep-green">
                {user.first_name ? `${user.first_name}` : 'Athenura User'}
              </p>
              <p className="text-[10px] text-muted-text font-semibold">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase text-muted-text tracking-wider">Current Credits</span>
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-neutral-100 text-center">
                <span className="text-xl font-black text-deep-green">{user.credits}</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <label htmlFor="new-balance-input" className="text-[9px] font-black uppercase text-muted-text tracking-wider block">
                New Balance
              </label>
              <input
                id="new-balance-input"
                type="number"
                min="0"
                value={balance}
                onChange={(e) => setBalance(parseInt(e.target.value) || 0)}
                className="w-full p-3 rounded-xl border border-neutral-200 focus:outline-none focus:border-deep-green text-center text-xl font-black text-deep-green bg-white"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-white hover:bg-neutral-50 text-deep-green border border-neutral-200 p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-deep-green hover:bg-forest-green text-white p-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </ModalMotion>
  );
}
