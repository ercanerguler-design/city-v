'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface MicroInteractionButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  className?: string;
  disabled?: boolean;
  pulse?: boolean;
}

const variantStyles = {
  primary: 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white',
  secondary: 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white',
  success: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white',
  danger: 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export default function MicroInteractionButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  disabled = false,
  pulse = false,
}: MicroInteractionButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative inline-flex items-center justify-center gap-2
        rounded-xl font-semibold
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        overflow-hidden
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      whileHover={!disabled ? { scale: 1.05 } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        boxShadow: pulse ? [
          '0 0 0 0 rgba(99, 102, 241, 0.7)',
          '0 0 0 20px rgba(99, 102, 241, 0)',
        ] : undefined,
      }}
      transition={{
        boxShadow: {
          duration: 1.5,
          repeat: Infinity,
        },
      }}
    >
      {/* Ripple effect container */}
      <motion.span
        className="absolute inset-0 bg-white/20"
        initial={{ scale: 0, opacity: 1 }}
        whileTap={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.5 }}
      />

      {/* Icon */}
      {icon && (
        <motion.span
          initial={{ rotate: 0 }}
          whileHover={{ rotate: 15 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {icon}
        </motion.span>
      )}

      {/* Content */}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
