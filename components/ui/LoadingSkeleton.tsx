'use client';

import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  type?: 'card' | 'list' | 'grid' | 'profile';
  count?: number;
  className?: string;
}

export default function LoadingSkeleton({ 
  type = 'card', 
  count = 3,
  className = '' 
}: LoadingSkeletonProps) {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 space-y-4 ${className}`}>
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl skeleton" />
              <div className="flex-1 space-y-2">
                <div className="h-6 w-3/4 rounded-lg skeleton" />
                <div className="h-4 w-1/2 rounded-lg skeleton" />
              </div>
            </div>
            {/* Content */}
            <div className="space-y-2">
              <div className="h-4 w-full rounded-lg skeleton" />
              <div className="h-4 w-5/6 rounded-lg skeleton" />
              <div className="h-4 w-4/6 rounded-lg skeleton" />
            </div>
            {/* Footer */}
            <div className="flex gap-2 pt-4">
              <div className="h-10 w-24 rounded-lg skeleton" />
              <div className="h-10 w-24 rounded-lg skeleton" />
            </div>
          </div>
        );

      case 'list':
        return (
          <div className={`bg-white dark:bg-gray-800 rounded-xl p-4 ${className}`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full skeleton" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-3/4 rounded-lg skeleton" />
                <div className="h-4 w-1/2 rounded-lg skeleton" />
              </div>
              <div className="w-20 h-8 rounded-lg skeleton" />
            </div>
          </div>
        );

      case 'grid':
        return (
          <div className={`bg-white dark:bg-gray-800 rounded-2xl overflow-hidden ${className}`}>
            <div className="h-48 w-full skeleton" />
            <div className="p-4 space-y-3">
              <div className="h-6 w-3/4 rounded-lg skeleton" />
              <div className="h-4 w-full rounded-lg skeleton" />
              <div className="h-4 w-5/6 rounded-lg skeleton" />
              <div className="flex gap-2 pt-2">
                <div className="h-8 w-16 rounded-lg skeleton" />
                <div className="h-8 w-16 rounded-lg skeleton" />
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 ${className}`}>
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 rounded-full skeleton" />
              <div className="h-6 w-32 rounded-lg skeleton" />
              <div className="h-4 w-48 rounded-lg skeleton" />
              <div className="flex gap-4 pt-4 w-full">
                <div className="flex-1 h-20 rounded-xl skeleton" />
                <div className="flex-1 h-20 rounded-xl skeleton" />
                <div className="flex-1 h-20 rounded-xl skeleton" />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          {renderSkeleton()}
        </motion.div>
      ))}
    </div>
  );
}
