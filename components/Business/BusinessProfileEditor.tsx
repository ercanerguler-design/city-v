'use client';

import { useState, useEffect } from 'react';
import { Building2, MapPin, Phone, Mail, Clock, Upload, Save } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface BusinessProfile {
  id: number;
  businessName: string;
  businessType: string;
  logoUrl?: string;
  description?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  workingHours?: {
    [key: string]: { open: string; close: string };
  };
}

interface BusinessProfileEditorProps {
  businessId: number;
  onSave?: () => void;
}

export default function BusinessProfileEditor({ businessId, onSave }: BusinessProfileEditorProps) {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [businessId]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/business/profile?businessId=${businessId}`);
      const data = await response.json();
      if (data.success) {
        setProfile(data.profile);
      }
    } catch (error) {
      console.error('Profil yüklenemedi:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch('/api/business/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId, ...profile })
      });

      const data = await response.json();
      if (data.success) {
        setSuccess(true);
        if (onSave) onSave();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Profil kaydedilemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return <div className="text-center text-gray-400">{t('loading')}</div>;
  }

  return (
    <div className="bg-gradient-to-br from-slate-900/50 to-blue-900/30 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">{t('businessProfile')}</h2>
      </div>

      {success && (
        <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300">
          ✓ {t('success')}! Profil güncellendi.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo Upload */}
        <div>
          <label className="text-white font-semibold mb-2 flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Logo
          </label>
          <div className="flex items-center gap-4">
            {profile.logoUrl && (
              <img
                src={profile.logoUrl}
                alt="Logo"
                className="w-20 h-20 rounded-lg object-cover border-2 border-white/20"
              />
            )}
            <input
              type="file"
              accept="image/*"
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-500 file:text-white"
            />
          </div>
        </div>

        {/* Business Name */}
        <div>
          <label className="text-white font-semibold mb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            {t('businessName')}
          </label>
          <input
            type="text"
            value={profile.businessName}
            onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
            required
          />
        </div>

        {/* Business Type */}
        <div>
          <label className="text-white font-semibold mb-2">
            {t('businessType')}
          </label>
          <select
            value={profile.businessType}
            onChange={(e) => setProfile({ ...profile, businessType: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
          >
            <option value="restaurant">Restaurant / Restoran</option>
            <option value="cafe">Cafe / Kafe</option>
            <option value="retail">Retail / Perakende</option>
            <option value="hotel">Hotel / Otel</option>
            <option value="gym">Gym / Spor Salonu</option>
            <option value="shop">Shop / Mağaza</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="text-white font-semibold mb-2">
            {t('description')}
          </label>
          <textarea
            value={profile.description || ''}
            onChange={(e) => setProfile({ ...profile, description: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white h-24"
          />
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-white font-semibold mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              {t('phone')}
            </label>
            <input
              type="tel"
              value={profile.phone || ''}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="text-white font-semibold mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {t('email')}
            </label>
            <input
              type="email"
              value={profile.email || ''}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="text-white font-semibold mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {t('address')}
          </label>
          <input
            type="text"
            value={profile.address || ''}
            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
          />
        </div>

        {/* City */}
        <div>
          <label className="text-white font-semibold mb-2">
            {t('city')}
          </label>
          <input
            type="text"
            value={profile.city || ''}
            onChange={(e) => setProfile({ ...profile, city: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
          />
        </div>

        {/* Working Hours */}
        <div>
          <label className="text-white font-semibold mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {t('workingHours')}
          </label>
          <div className="space-y-2">
            {['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'].map((day) => (
              <div key={day} className="grid grid-cols-3 gap-3 items-center">
                <span className="text-white">{day}</span>
                <input
                  type="time"
                  placeholder="Açılış"
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                />
                <input
                  type="time"
                  placeholder="Kapanış"
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-white font-bold text-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t('loading')}
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              {t('saveChanges')}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
