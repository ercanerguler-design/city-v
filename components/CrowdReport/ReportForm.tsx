'use client';

import { useState } from 'react';
import { CrowdLevel, Location } from '@/types';
import { Users, Clock, MessageSquare, Send } from 'lucide-react';

interface ReportFormProps {
  location: Location;
  onSubmit: (report: {
    crowdLevel: CrowdLevel;
    waitTime: number;
    comment?: string;
  }) => void;
  onCancel: () => void;
}

const crowdLevels: { value: CrowdLevel; label: string; emoji: string; color: string }[] = [
  { value: 'empty', label: 'Boş', emoji: '😊', color: 'bg-green-500' },
  { value: 'low', label: 'Az Kalabalık', emoji: '🙂', color: 'bg-lime-500' },
  { value: 'moderate', label: 'Orta', emoji: '😐', color: 'bg-yellow-500' },
  { value: 'high', label: 'Kalabalık', emoji: '😟', color: 'bg-orange-500' },
  { value: 'very_high', label: 'Çok Kalabalık', emoji: '😫', color: 'bg-red-500' },
];

export default function ReportForm({ location, onSubmit, onCancel }: ReportFormProps) {
  const [crowdLevel, setCrowdLevel] = useState<CrowdLevel>('moderate');
  const [waitTime, setWaitTime] = useState<number>(0);
  const [comment, setComment] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      crowdLevel,
      waitTime,
      comment: comment.trim() || undefined,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Kalabalık Durumu Bildir
        </h2>
        <p className="text-sm text-gray-600">
          <span className="font-semibold">{location.name}</span>
        </p>
        <p className="text-xs text-gray-500">{location.address}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Kalabalık Seviyesi */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Users className="w-4 h-4" />
            Kalabalık Seviyesi
          </label>
          <div className="grid grid-cols-5 gap-2">
            {crowdLevels.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => setCrowdLevel(level.value)}
                className={`
                  flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all
                  ${crowdLevel === level.value 
                    ? `${level.color} text-white border-transparent scale-105 shadow-lg` 
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                  }
                `}
              >
                <span className="text-2xl mb-1">{level.emoji}</span>
                <span className="text-xs font-medium text-center leading-tight">
                  {level.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bekleme Süresi */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <Clock className="w-4 h-4" />
            Bekleme Süresi (dakika)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={waitTime}
              onChange={(e) => setWaitTime(Number(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-lg font-bold text-gray-800 min-w-[50px] text-right">
              {waitTime} dk
            </span>
          </div>
        </div>

        {/* Yorum (Opsiyonel) */}
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
            <MessageSquare className="w-4 h-4" />
            Yorum (Opsiyonel)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ek bilgi paylaşmak ister misiniz?"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            maxLength={200}
          />
          <p className="text-xs text-gray-500 mt-1 text-right">
            {comment.length}/200
          </p>
        </div>

        {/* Butonlar */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            İptal
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            <Send className="w-4 h-4" />
            Gönder
          </button>
        </div>
      </form>
    </div>
  );
}
