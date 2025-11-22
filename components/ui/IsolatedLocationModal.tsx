'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, MapPin, Users } from 'lucide-react';

interface Location {
  id: string | number;
  name: string;
  address?: string;
  crowdLevel?: string;
  category?: string;
}

interface IsolatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: Location | null;
  onReviewClick?: () => void;
  onRouteClick?: () => void;
}

// Portal Container Component (completely isolated)
const ModalPortalContent = ({ 
  isOpen, 
  onClose, 
  location, 
  onReviewClick, 
  onRouteClick 
}: IsolatedModalProps) => {
  console.log('🚀 IsolatedModal Portal Content rendering:', { 
    isOpen, 
    location: location?.name,
    hasReviewClick: !!onReviewClick,
    hasRouteClick: !!onRouteClick
  });

  if (!isOpen || !location) {
    console.log('⏹️ Portal modal not rendering - isOpen:', isOpen, 'location:', !!location);
    return null;
  }

  console.log('✅ Portal Modal WILL render for location:', location.name);

  const getCrowdText = (level?: string) => {
    switch (level) {
      case 'low': return 'Az Kalabalık';
      case 'moderate': return 'Orta Kalabalık';
      case 'high': return 'Çok Kalabalık';
      case 'very_high': return 'Çok Yoğun';
      default: return 'Bilinmiyor';
    }
  };

  const getCrowdColor = (level?: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'moderate': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'very_high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      console.log('🔙 Backdrop clicked, closing modal');
      onClose?.();
    }
  };

  const handleReviewClick = () => {
    try {
      console.log('📝 Review button clicked for:', location.name);
      if (onReviewClick && typeof onReviewClick === 'function') {
        onReviewClick();
      } else {
        console.warn('⚠️ onReviewClick is not available or not a function');
      }
    } catch (error) {
      console.error('❌ Error in handleReviewClick:', error);
    }
  };

  const handleRouteClick = () => {
    try {
      console.log('🗺️ Route button clicked for:', location.name);
      if (onRouteClick && typeof onRouteClick === 'function') {
        onRouteClick();
      } else {
        console.warn('⚠️ onRouteClick is not available or not a function');
      }
    } catch (error) {
      console.error('❌ Error in handleRouteClick:', error);
    }
  };

  const handleCloseClick = () => {
    try {
      console.log('❌ Close button clicked');
      onClose?.();
    } catch (error) {
      console.error('❌ Error in handleCloseClick:', error);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
      style={{ position: 'fixed', zIndex: 9999 }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {location.name || 'İsimsiz Konum'}
            </h3>
          </div>
          
          <button
            onClick={handleCloseClick}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            type="button"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Address */}
          {location.address && (
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-600 break-words">
                {location.address}
              </span>
            </div>
          )}

          {/* Crowd Level */}
          {location.crowdLevel && (
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className={`text-sm font-medium ${getCrowdColor(location.crowdLevel)}`}>
                Kalabalık: {getCrowdText(location.crowdLevel)}
              </span>
            </div>
          )}

          {/* Category */}
          {location.category && (
            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {location.category}
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleReviewClick}
              className="bg-blue-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-blue-700 transition-colors"
              type="button"
            >
              📝 Yorum Yaz
            </button>
            
            <button
              onClick={handleRouteClick}
              className="bg-green-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-green-700 transition-colors"
              type="button"
            >
              🗺️ Yol Tarifi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Isolated Modal Component 
const IsolatedLocationModal = (props: IsolatedModalProps) => {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Create or get portal container
    let container = document.getElementById('modal-portal-root');
    if (!container) {
      container = document.createElement('div');
      container.id = 'modal-portal-root';
      container.style.position = 'relative';
      container.style.zIndex = '9999';
      document.body.appendChild(container);
      console.log('📦 Created modal portal container');
    }
    setPortalContainer(container);

    // Cleanup
    return () => {
      // Don't remove container on unmount as it might be used by other modals
    };
  }, []);

  useEffect(() => {
    if (props.isOpen) {
      document.body.style.overflow = 'hidden';
      console.log('🔒 Body scroll locked');
    } else {
      document.body.style.overflow = 'unset';
      console.log('🔓 Body scroll unlocked');
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [props.isOpen]);

  // Error boundary for portal content
  const [hasPortalError, setHasPortalError] = useState(false);

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      if (error.message?.includes('b is not a function') || 
          error.message?.includes('Portal')) {
        console.error('🚨 Portal error detected, switching to fallback:', error);
        setHasPortalError(true);
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Fallback modal (direct render without portal)
  if (hasPortalError || !portalContainer) {
    console.log('🆘 Using fallback modal rendering');
    return <ModalPortalContent {...props} />;
  }

  // Normal portal rendering
  try {
    console.log('🌀 Creating portal for modal');
    return createPortal(
      <ModalPortalContent {...props} />,
      portalContainer
    );
  } catch (error) {
    console.error('❌ Portal creation failed, using fallback:', error);
    return <ModalPortalContent {...props} />;
  }
};

export default IsolatedLocationModal;