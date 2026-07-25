import React from 'react';
import { motion } from 'framer-motion';

export default function SmoothProgressBar({ progress = 0, className = '', barClassName = 'bg-[#36E682]' }) {
  const safeProgress = Math.min(100, Math.max(0, Number(progress) || 0));

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${safeProgress}%` }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className={`h-full ${barClassName}`}
        style={{ willChange: 'width' }}
      />
    </div>
  );
}
