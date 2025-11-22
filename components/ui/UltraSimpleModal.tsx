'use client';

import { Location } from '@/types';
import { X } from 'lucide-react';

interface UltraSimpleModalProps {
  location: Location | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: () => void;
  onReview?: () => void;
}

export default function UltraSimpleModal({ 
  location, 
  isOpen, 
  onClose, 
  onNavigate, 
  onReview 
}: UltraSimpleModalProps) {
  console.log('🔧 UltraSimpleModal rendering:', { isOpen, hasLocation: !!location });
  
  if (!isOpen || !location) {
    console.log('⏹️ Modal not rendering - isOpen:', isOpen, 'location:', !!location);
    return null;
  }

  console.log('✅ Modal rendering for location:', location.name);

  const handleClose = () => {
    try {
      console.log('🔴 Modal close triggered');
      onClose();
    } catch (error) {
      console.error('❌ Error in handleClose:', error);
    }
  };

  const handleNavigate = () => {
    try {
      console.log('🧭 Navigate triggered');
      if (onNavigate) onNavigate();
    } catch (error) {
      console.error('❌ Error in handleNavigate:', error);
    }
  };

  const handleReview = () => {
    try {
      console.log('⭐ Review triggered');
      if (onReview) onReview();
    } catch (error) {
      console.error('❌ Error in handleReview:', error);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={handleClose}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          margin: '16px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
          position: 'relative',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={24} />
        </button>

        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
            {location.name}
          </h2>
          <p style={{ color: '#666', margin: '0' }}>
            {location.address}
          </p>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <p><strong>Kategori:</strong> {location.category}</p>
          <p><strong>Kalabalık Seviyesi:</strong> {location.crowdLevel}</p>
          {location.workingHours && (
            <p><strong>Çalışma Saatleri:</strong> {location.workingHours}</p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={handleNavigate}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 20px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🧭 Yol Tarifi
          </button>
          
          <button
            onClick={handleReview}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 20px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ⭐ Değerlendir
          </button>
        </div>
      </div>
    </div>
  );
}