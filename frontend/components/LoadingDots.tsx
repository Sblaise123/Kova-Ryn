'use client';

import { motion } from 'framer-motion';

export default function LoadingDots() {
  const dotVariants = {
    start: { y: 0 },
    end: { y: -8 },
  };

  const dotTransition = {
    duration: 0.5,
    repeat: Infinity,
    repeatType: 'reverse' as const,
    ease: 'easeInOut',
  };

  return (
    <div className="flex items-center gap-1">
      <motion.div
        className="h-2 w-2 rounded-full bg-gray-400"
        variants={dotVariants}
        initial="start"
        animate="end"
        transition={{ ...dotTransition, delay: 0 }}
      />
      <motion.div
        className="h-2 w-2 rounded-full bg-gray-400"
        variants={dotVariants}
        initial="start"
        animate="end"
        transition={{ ...dotTransition, delay: 0.15 }}
      />
      <motion.div
        className="h-2 w-2 rounded-full bg-gray-400"
        variants={dotVariants}
        initial="start"
        animate="end"
        transition={{ ...dotTransition, delay: 0.3 }}
      />
    </div>
  );
}