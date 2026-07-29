import React, { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

export default function AdminSearch({ value = '', onChange, placeholder = 'Search...' }) {
  const [internalValue, setInternalValue] = useState(value);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    setIsTyping(true);
    const handler = setTimeout(() => {
      setIsTyping(false);
      if (onChange && internalValue !== value) {
        onChange(internalValue);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [internalValue]);

  const handleClear = () => {
    setInternalValue('');
    if (onChange) onChange('');
  };

  return (
    <div className="relative flex-1 max-w-xs font-sans">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {isTyping ? (
          <Loader2 className="w-3.5 h-3.5 text-zinc-400 animate-spin" />
        ) : (
          <Search className="w-3.5 h-3.5 text-zinc-400" />
        )}
      </div>

      <input
        type="text"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-950 placeholder-zinc-400 focus:outline-none focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 shadow-2xs transition-all"
      />

      {internalValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-zinc-400 hover:text-zinc-950 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
