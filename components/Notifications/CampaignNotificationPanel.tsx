'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, Calendar, MapPin } from 'lucide-react';

interface CampaignNotificationPanelProps {
  show: boolean;
  onClose: () => void;
  campaign: {
    id: number;
    title: string;
    description: string;
    businessName?: string;
    discountPercent?: number;
    discountAmount?: number;
    validUntil?: string;
    location?: string;
  };
}

export default function CampaignNotificationPanel({ 
  show, 
  onClose, 
  campaign 
}: CampaignNotificationPanelProps) {
  const [autoCloseTimer, setAutoCloseTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (show) {
      // 10 saniye sonra otomatik kapat
      const timer = setTimeout(() => {
        onClose();
      }, 10000);
      
      setAutoCloseTimer(timer);

      return () => {
        if (timer) clearTimeout(timer);
      };
    }
  }, [show, onClose]);

  const handleClose = () => {
    if (autoCloseTimer) clearTimeout(autoCloseTimer);
    onClose();
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop - Tıklanabilir */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
            onClick={handleClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ 
              type: "spring", 
              damping: 25,
              stiffness: 300
            }}
            className="fixed right-4 top-20 bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-2xl w-96 z-[9999] overflow-hidden border border-purple-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">🎉</span>
                    <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                      Yeni Kampanya
                    </span>
                  </div>
                  <h3 className="font-bold text-lg">{campaign.title}</h3>
                  {campaign.businessName && (
                    <p className="text-sm text-purple-100 mt-1">
                      {campaign.businessName}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleClose}
                  className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <p className="text-gray-700 text-sm leading-relaxed">
                {campaign.description}
              </p>

              {/* Discount Badge */}
              {(campaign.discountPercent || campaign.discountAmount) && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-orange-100 to-yellow-100 p-3 rounded-xl border border-orange-200">
                  <Tag className="w-5 h-5 text-orange-600" />
                  <div className="flex-1">
                    <p className="text-xs text-orange-800 font-medium">İndirim</p>
                    <p className="text-lg font-bold text-orange-900">
                      {campaign.discountPercent && `%${campaign.discountPercent} İndirim`}
                      {campaign.discountAmount && `${campaign.discountAmount}₺ İndirim`}
                    </p>
                  </div>
                </div>
              )}

              {/* Valid Until */}
              {campaign.validUntil && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span>
                    Son Tarih: {new Date(campaign.validUntil).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              )}

              {/* Location */}
              {campaign.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-purple-600" />
                  <span>{campaign.location}</span>
                </div>
              )}
            </div>

            {/* Footer - Auto-close indicator */}
            <div className="px-4 pb-4">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 10, ease: 'linear' }}
                className="h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
              />
              <p className="text-xs text-center text-gray-400 mt-2">
                10 saniye sonra otomatik kapanacak
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
