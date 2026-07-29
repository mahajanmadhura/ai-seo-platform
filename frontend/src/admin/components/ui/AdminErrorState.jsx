import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function AdminErrorState({ message = "Failed to load data", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 bg-red-50/50 rounded-2xl border border-red-200/60">
      <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
        <AlertCircle className="w-5 h-5" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-red-900">An Error Occurred</h4>
        <p className="text-xs text-red-600 mt-1">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry Action
        </button>
      )}
    </div>
  );
}
