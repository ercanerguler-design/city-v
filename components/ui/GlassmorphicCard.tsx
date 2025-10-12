'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlassmorphicCardProps {
  children: ReactNode;
  className?: string;
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  opacity?: number;
  hover?: boolean;
}

const blurValues = {
  sm: 'backdrop-blur-sm',
  md: 'backdrop-blur-md',
  lg: 'backdrop-blur-lg',
  xl: 'backdrop-blur-xl',
};

export default function GlassmorphicCard({
  children,
  className = '',
  blur = 'md',
  opacity = 0.7,
  hover = true,
}: GlassmorphicCardProps) {
  const bgOpacity = Math.round(opacity * 100);

  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-2xl
        ${blurValues[blur]}
        bg-white/${bgOpacity} dark:bg-gray-800/${bgOpacity}
        border border-white/20 dark:border-gray-700/20
        shadow-xl
        ${className}
      `}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={hover ? { scale: 1.02, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' } : undefined}
    >
      {/* Glass reflection effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-white/5" />
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent dark:via-white/5 transform -skew-x-12 animate-shimmer" />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
