import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Search } from 'lucide-react';

export default function AdminDropdown({
  label,
  options = [], // [{ value: '1', label: 'Option 1' }]
  value,
  onChange,
  placeholder = 'Select...',
  searchable = false,
  variant = 'admin', // 'admin' (Black/Zinc) | 'client' (White/Emerald Green)
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  const filteredOptions = searchable
    ? options.filter((opt) => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : options;

  const isClient = variant === 'client';

  // Theme Styling Token Maps
  const btnStyles = isClient
    ? 'bg-white hover:bg-emerald-50/50 border-emerald-200/80 text-emerald-950 focus:border-emerald-600'
    : 'bg-zinc-50 hover:bg-zinc-100/80 border-zinc-200 text-zinc-950 focus:border-zinc-950';

  const popoverBorder = isClient ? 'border-emerald-200 shadow-xl' : 'border-zinc-200 shadow-xl';

  const selectedItemStyles = isClient
    ? 'bg-emerald-600 text-white font-bold'
    : 'bg-zinc-950 text-white font-bold';

  const hoverItemStyles = isClient
    ? 'text-emerald-950 hover:bg-emerald-50 hover:text-emerald-900'
    : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950';

  return (
    <div className={`relative text-left font-sans ${className}`} ref={dropdownRef}>
      {label && (
        <label
          className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
            isClient ? 'text-emerald-800 font-black' : 'text-zinc-400'
          }`}
        >
          {label}
        </label>
      )}

      {/* Dropdown Control Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 border rounded-lg text-xs font-semibold transition-all cursor-pointer focus:outline-none shadow-2xs ${btnStyles}`}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ml-2 ${
            isClient ? 'text-emerald-600' : 'text-zinc-500'
          } ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Popover Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className={`absolute left-0 right-0 mt-1.5 z-50 bg-white border rounded-xl overflow-hidden py-1 text-xs ${popoverBorder}`}
          >
            {/* Search Input for long lists */}
            {(searchable || options.length > 5) && (
              <div
                className={`px-2.5 py-1.5 border-b flex items-center gap-2 ${
                  isClient ? 'bg-emerald-50/50 border-emerald-100' : 'bg-zinc-50/50 border-zinc-100'
                }`}
              >
                <Search className={`w-3.5 h-3.5 shrink-0 ${isClient ? 'text-emerald-600' : 'text-zinc-400'}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search options..."
                  className="w-full text-xs font-medium bg-transparent border-none focus:outline-none text-zinc-950 placeholder-zinc-400"
                  autoFocus
                />
              </div>
            )}

            {/* Options List */}
            <div className="max-h-56 overflow-y-auto py-1">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-zinc-400 text-center font-medium">No results</div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = String(opt.value) === String(value);

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-left font-semibold transition-colors cursor-pointer ${
                        isSelected ? selectedItemStyles : hoverItemStyles
                      }`}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-2" />}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
