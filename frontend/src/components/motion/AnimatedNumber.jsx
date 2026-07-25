import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export default function AnimatedNumber({ value = 0, suffix = '', prefix = '' }) {
  const numericValue = Number(value) || 0;
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => `${prefix}${Math.round(current)}${suffix}`);
  const [currentText, setCurrentText] = useState(`${prefix}${numericValue}${suffix}`);

  useEffect(() => {
    spring.set(numericValue);
  }, [numericValue, spring]);

  useEffect(() => {
    const unsubscribe = display.on('change', (latest) => setCurrentText(latest));
    return () => unsubscribe();
  }, [display]);

  return <motion.span>{currentText}</motion.span>;
}
