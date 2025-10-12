'use client';

import { motion } from 'framer-motion';

export default function LocationCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-slate-700"
    >
      {/* Header gradient placeholder */}
      <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600 animate-pulse" />
      
      <div className="p-5 space-y-4">
        {/* Title area */}
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse" />
              <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-32 animate-pulse" />
            </div>
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24 animate-pulse" />
          </div>
          <div className="w-10 h-10 bg-gray-200 dark:bg-slate-700 rounded-full animate-pulse" />
        </div>

        {/* Crowd level badge */}
        <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded-xl w-32 animate-pulse" />

        {/* Details */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 animate-pulse" />
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse" />
          <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
}

export function LoadingGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <LocationCardSkeleton key={i} />
      ))}
    </div>
  );
}
