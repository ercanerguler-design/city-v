'use client';

import { useState, useEffect } from 'react';
import useEventStore, { LiveEvent, EventUpdate } from '@/store/eventStore';
import useSocketStore from '@/store/socketStore';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Heart, 
  Share2, 
  MessageCircle, 
  Star,
  Ticket,
  Play,
  Eye,
  X,
  Filter,
  Search,
  Zap,
  AlertTriangle,
  Sun,
  Cloud,
  CloudRain
} from 'lucide-react';

interface LiveEventTrackerProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation?: [number, number];
}

export default function LiveEventTracker({ 
  isOpen, 
  onClose, 
  userLocation 
}: LiveEventTrackerProps) {
  const [activeTab, setActiveTab] = useState<'discover' | 'live' | 'tracked' | 'updates'>('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<LiveEvent | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { isConnected } = useSocketStore();
  const {
    events,
    trackedEvents,
    filters,
    isSubscribed,
    subscribeToEvents,
    unsubscribeFromEvents,
    trackEvent,
    untrackEvent,
    getFilteredEvents,
    getUpcomingEvents,
    getLiveEvents,
    getPopularEvents,
    searchEvents,
    getTrackedEventUpdates,
    checkinToEvent,
    shareEvent,
    updateFilters
  } = useEventStore();

  // Subscribe to events when component mounts
  useEffect(() => {
    if (isConnected && !isSubscribed) {
      subscribeToEvents();
    }

    return () => {
      if (isSubscribed) {
        unsubscribeFromEvents();
      }
    };
  }, [isConnected, isSubscribed, subscribeToEvents, unsubscribeFromEvents]);

  const getEventIcon = (category: LiveEvent['category']) => {
    switch (category) {
      case 'concert': return '🎵';
      case 'festival': return '🎪';
      case 'sports': return '⚽';
      case 'theater': return '🎭';
      case 'exhibition': return '🖼️';
      case 'conference': return '💼';
      case 'workshop': return '🔧';
      default: return '📅';
    }
  };

  const getStatusColor = (status: LiveEvent['status']) => {
    switch (status) {
      case 'live':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'upcoming':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'ended':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'postponed':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCrowdLevelColor = (level: LiveEvent['crowdLevel']) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'full': return 'text-red-600 bg-red-50';
    }
  };

  const getWeatherIcon = (weather?: LiveEvent['weatherCondition']) => {
    switch (weather) {
      case 'sunny': return <Sun className="w-4 h-4 text-yellow-500" />;
      case 'cloudy': return <Cloud className="w-4 h-4 text-gray-500" />;
      case 'rainy': return <CloudRain className="w-4 h-4 text-blue-500" />;
      case 'stormy': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDistance = (eventCoordinates: [number, number]) => {
    if (!userLocation) return null;
    
    const distance = calculateDistance(
      userLocation[0], userLocation[1],
      eventCoordinates[0], eventCoordinates[1]
    );
    
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  };

  const getCapacityPercentage = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100);
  };

  const eventsToShow = (() => {
    switch (activeTab) {
      case 'live':
        return getLiveEvents();
      case 'tracked':
        return Array.from(events.values()).filter(event => trackedEvents.has(event.id));
      case 'updates':
        return [];
      default:
        return searchQuery ? searchEvents(searchQuery) : getFilteredEvents();
    }
  })();

  const trackedUpdates = getTrackedEventUpdates();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex overflow-hidden">
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-pink-600">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6" />
                <h2 className="font-bold text-xl">Canlı Etkinlikler</h2>
                {trackedEvents.size > 0 && (
                  <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-sm">
                    {trackedEvents.size} takip edilen
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-300' : 'bg-red-300'}`} />
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            {[
              { key: 'discover', label: 'Keşfet', icon: Search },
              { key: 'live', label: 'Canlı', icon: Zap, badge: getLiveEvents().length },
              { key: 'tracked', label: 'Takip Edilenler', icon: Heart, badge: trackedEvents.size },
              { key: 'updates', label: 'Güncellemeler', icon: MessageCircle, badge: trackedUpdates.length }
            ].map(({ key, label, icon: Icon, badge }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === key 
                    ? 'border-b-2 border-purple-500 text-purple-600 bg-purple-50' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                  {badge !== undefined && badge > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {badge}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Search and Filters */}
          {activeTab === 'discover' && (
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Etkinlik ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filtrele</span>
                </button>
              </div>

              {showFilters && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                      <select
                        multiple
                        value={filters.categories}
                        onChange={(e) => updateFilters({ 
                          categories: Array.from(e.target.selectedOptions, option => option.value)
                        })}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="concert">Konser</option>
                        <option value="festival">Festival</option>
                        <option value="sports">Spor</option>
                        <option value="theater">Tiyatro</option>
                        <option value="exhibition">Sergi</option>
                        <option value="conference">Konferans</option>
                        <option value="workshop">Atölye</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
                      <select
                        multiple
                        value={filters.status}
                        onChange={(e) => updateFilters({ 
                          status: Array.from(e.target.selectedOptions, option => option.value)
                        })}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="upcoming">Yaklaşan</option>
                        <option value="live">Canlı</option>
                        <option value="ended">Bitti</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kalabalık</label>
                      <select
                        multiple
                        value={filters.crowdLevel}
                        onChange={(e) => updateFilters({ 
                          crowdLevel: Array.from(e.target.selectedOptions, option => option.value)
                        })}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="low">Az</option>
                        <option value="medium">Orta</option>
                        <option value="high">Yoğun</option>
                        <option value="full">Dolu</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'updates' ? (
              // Updates Tab
              <div className="space-y-4">
                {trackedUpdates.length > 0 ? (
                  trackedUpdates.map((update) => (
                    <div key={update.id} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${
                          update.priority === 'urgent' ? 'bg-red-100' : 'bg-blue-100'
                        }`}>
                          {update.type === 'status_change' && <Zap className="w-4 h-4" />}
                          {update.type === 'capacity_update' && <Users className="w-4 h-4" />}
                          {update.type === 'time_change' && <Clock className="w-4 h-4" />}
                          {update.type === 'weather_alert' && getWeatherIcon()}
                          {update.type === 'announcement' && <MessageCircle className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{update.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{update.message}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {formatTime(update.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Henüz güncelleme yok</p>
                  </div>
                )}
              </div>
            ) : (
              // Events Grid
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {eventsToShow.map((event) => {
                  const isTracked = trackedEvents.has(event.id);
                  const capacityPercentage = getCapacityPercentage(event.currentAttendees, event.maxCapacity);
                  const distance = userLocation ? formatDistance(event.coordinates) : null;

                  return (
                    <div
                      key={event.id}
                      className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => setSelectedEvent(event)}
                    >
                      {/* Event Header */}
                      <div className="relative">
                        {event.imageUrl && (
                          <img 
                            src={event.imageUrl} 
                            alt={event.title}
                            className="w-full h-32 object-cover"
                          />
                        )}
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                            {event.status === 'live' && <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse" />}
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </span>
                          {event.status === 'live' && event.streamUrl && (
                            <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs font-medium flex items-center gap-1">
                              <Play className="w-3 h-3" />
                              Canlı
                            </span>
                          )}
                        </div>
                        <div className="absolute top-3 right-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              isTracked ? untrackEvent(event.id) : trackEvent(event.id);
                            }}
                            className={`p-2 rounded-full transition-colors ${
                              isTracked 
                                ? 'bg-red-500 text-white' 
                                : 'bg-white bg-opacity-80 text-gray-600 hover:bg-red-500 hover:text-white'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${isTracked ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Event Content */}
                      <div className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-2xl">{getEventIcon(event.category)}</span>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg text-gray-800 truncate">{event.title}</h3>
                            <p className="text-sm text-gray-600">{event.organizer}</p>
                          </div>
                          {event.averageRating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium">{event.averageRating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>

                        {/* Event Details */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>{formatTime(event.startTime)}</span>
                            {event.weatherCondition && getWeatherIcon(event.weatherCondition)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate">{event.venue}</span>
                            {distance && <span className="text-purple-600">({distance})</span>}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>{event.currentAttendees.toLocaleString('tr-TR')} katılımcı</span>
                            <div className={`px-2 py-1 rounded-full text-xs ${getCrowdLevelColor(event.crowdLevel)}`}>
                              {event.crowdLevel}
                            </div>
                          </div>
                        </div>

                        {/* Capacity Bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Kapasite</span>
                            <span>{capacityPercentage.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                capacityPercentage > 90 ? 'bg-red-500' :
                                capacityPercentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${capacityPercentage}%` }}
                            />
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              <span>{event.checkins}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Share2 className="w-3 h-3" />
                              <span>{event.shares}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              <span>{event.comments.length}</span>
                            </div>
                          </div>
                          {event.ticketPrices && (
                            <div className="flex items-center gap-1 text-sm text-purple-600 font-medium">
                              <Ticket className="w-4 h-4" />
                              <span>{event.ticketPrices.min}₺+</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {eventsToShow.length === 0 && activeTab !== 'updates' && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  {searchQuery ? 'Etkinlik Bulunamadı' : 'Henüz Etkinlik Yok'}
                </h3>
                <p className="text-gray-500">
                  {searchQuery 
                    ? 'Arama kriterlerinizi değiştirmeyi deneyin' 
                    : 'Yeni etkinlikler için takipte kalın'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function for distance calculation
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}