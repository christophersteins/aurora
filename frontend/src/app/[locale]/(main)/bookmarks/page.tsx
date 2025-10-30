'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/auth.types';
import { Heart, LayoutGrid, Grid3x3, MapPin, MessageCircle, Calendar, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';

type GridView = 'compact' | 'comfortable';

interface ContextMenuState {
  escort: User;
  x: number;
  y: number;
}

export default function MerklistePage() {
  const router = useRouter();
  const t = useTranslations('bookmarks');
  const { user, token, _hasHydrated } = useAuthStore();
  const [bookmarkedEscorts, setBookmarkedEscorts] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gridView, setGridView] = useState<GridView>('comfortable');
  const [userLatitude, setUserLatitude] = useState<number | null>(null);
  const [userLongitude, setUserLongitude] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Get location from IP address on mount
  useEffect(() => {
    const getLocationFromIP = async () => {
      const fallbackCoords = { latitude: 51.1657, longitude: 10.4515 }; // Center of Germany

      try {
        const response = await fetch('https://ipapi.co/json/', {
          signal: AbortSignal.timeout(5000), // 5 second timeout
        });

        if (!response.ok) {
          throw new Error('Failed to fetch location');
        }

        const data = await response.json();

        const latitude = data.latitude || fallbackCoords.latitude;
        const longitude = data.longitude || fallbackCoords.longitude;

        setUserLatitude(latitude);
        setUserLongitude(longitude);
      } catch (error) {
        console.warn('Could not get location from IP, using fallback:', error);
        setUserLatitude(fallbackCoords.latitude);
        setUserLongitude(fallbackCoords.longitude);
      }
    };

    getLocationFromIP();
  }, []);

  useEffect(() => {
    // Wait for hydration before checking auth
    if (!_hasHydrated) {
      return;
    }

    // Redirect to login if not authenticated after hydration
    if (!user || !token) {
      router.push('/login');
      return;
    }

    const fetchBookmarks = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:4000/users/bookmarks', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBookmarkedEscorts(response.data);
      } catch (err: any) {
        console.error('Error fetching bookmarks:', err);
        setError(err.response?.data?.message || 'Error loading bookmarks');
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [_hasHydrated, user, token, router]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu(null);
      }
    };

    const handleScroll = () => {
      setContextMenu(null);
    };

    if (contextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('scroll', handleScroll, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, [contextMenu]);

  const handleContextMenu = (e: React.MouseEvent, escort: User) => {
    e.preventDefault();

    // Only show context menu on desktop (lg breakpoint is 1024px)
    if (window.innerWidth < 1024) {
      return;
    }

    setContextMenu({
      escort,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleSendMessage = (escort: User) => {
    setContextMenu(null);
    router.push(`/nachrichten/${escort.username}`);
  };

  const handleScheduleDate = (escort: User) => {
    setContextMenu(null);
    // TODO: Implement date scheduling
    console.log('Schedule date with:', escort.username);
  };

  const removeBookmark = async (escortId: string) => {
    if (!token) return;

    try {
      await axios.delete(`http://localhost:4000/users/bookmarks/${escortId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBookmarkedEscorts(bookmarkedEscorts.filter(escort => escort.id !== escortId));
    } catch (err) {
      console.error('Error removing bookmark:', err);
    }
  };

  // Show loading while hydrating or fetching data
  if (!_hasHydrated || !user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: 'var(--text-secondary)' }}>{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-base btn-primary cursor-pointer"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto px-4 sm:px-6 lg:px-0" style={{ maxWidth: 'var(--max-content-width)' }}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl text-heading">{t('title')}</h1>

          {/* View Switcher */}
          <div className="flex gap-2">
            <button
              onClick={() => setGridView('compact')}
              className={`p-2 rounded-lg border transition cursor-pointer ${
                gridView === 'compact'
                  ? 'bg-action-primary text-button-primary border-primary'
                  : 'bg-page-secondary text-muted border-default hover:border-primary hover:text-action-primary'
              }`}
              title={t('compactView')}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setGridView('comfortable')}
              className={`p-2 rounded-lg border transition cursor-pointer ${
                gridView === 'comfortable'
                  ? 'bg-action-primary text-button-primary border-primary'
                  : 'bg-page-secondary text-muted border-default hover:border-primary hover:text-action-primary'
              }`}
              title={t('comfortableView')}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Escort Grid */}
      {bookmarkedEscorts.length === 0 ? (
        <div className="text-center py-12 rounded-lg border-depth" style={{ background: 'var(--background-primary)' }}>
          <Heart className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-secondary)' }} />
          <p style={{ color: 'var(--text-heading)' }} className="text-xl font-semibold mb-2">
            {t('noBookmarks')}
          </p>
          <p style={{ color: 'var(--text-secondary)' }} className="mb-4">
            {t('noBookmarksDescription')}
          </p>
          <button
            onClick={() => router.push('/escorts')}
            className="btn-base btn-primary cursor-pointer"
          >
            {t('browseEscorts')}
          </button>
        </div>
      ) : (
        <div
          className={`grid gap-6 ${
            gridView === 'compact'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
          }`}
        >
          {bookmarkedEscorts.map((escort) => (
            <div
              key={escort.id}
              onClick={() => router.push(`/profile/${escort.username}`)}
              onContextMenu={(e) => handleContextMenu(e, escort)}
              className="bg-page-primary border-depth rounded-lg overflow-hidden cursor-pointer transition-all"
            >
              {/* Profile Picture */}
              <div className="aspect-square bg-page-secondary flex items-center justify-center relative">
                {escort.profilePicture ? (
                  <img
                    src={`http://localhost:4000${escort.profilePicture}`}
                    alt={escort.username || 'Profilbild'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-muted text-6xl">
                    {(
                      escort.firstName?.[0] ||
                      escort.username?.[0] ||
                      escort.email[0]
                    ).toUpperCase()}
                  </div>
                )}

                {/* Remove Bookmark Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeBookmark(escort.id);
                  }}
                  className="absolute top-2 right-2 p-2 rounded-full transition-all hover:scale-110 z-10"
                  style={{
                    background: 'rgba(0, 0, 0, 0.6)',
                    color: 'var(--color-primary)',
                  }}
                  title={t('removeFromBookmarks')}
                >
                  <Heart className="w-5 h-5" fill="currentColor" />
                </button>
              </div>

              {/* Information */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-base font-normal text-body">
                    {escort.username || 'Unbekannt'}
                  </h3>
                  <div className="flex items-center justify-center w-4 h-4 rounded-full" style={{ backgroundColor: 'var(--color-secondary)' }}>
                    <span className="text-white text-xs">✓</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted">
                  {/* Distance */}
                  {userLatitude && userLongitude && escort.location ? (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {(() => {
                        const coords = escort.location.coordinates;
                        if (!coords || coords.length !== 2) return 'N/A';

                        const [escortLon, escortLat] = coords;
                        const distance = calculateDistance(
                          userLatitude,
                          userLongitude,
                          escortLat,
                          escortLon
                        );

                        return `${Math.round(distance)} km`;
                      })()}
                    </span>
                  ) : (
                    <span></span>
                  )}

                  {/* Star Rating */}
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-3.5 h-3.5"
                      style={{ color: 'var(--color-primary)', fill: 'var(--color-primary)' }}
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span className="text-sm text-body font-normal">2.5</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed bg-page-secondary border border-default rounded-lg shadow-lg overflow-hidden z-50"
          style={{
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
          }}
        >
          <button
            onClick={() => handleSendMessage(contextMenu.escort)}
            className="w-full px-4 py-3 text-left hover:bg-page-primary transition-all flex items-center gap-3 text-body cursor-pointer"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{t('sendMessage')}</span>
          </button>
          <button
            onClick={() => handleScheduleDate(contextMenu.escort)}
            className="w-full px-4 py-3 text-left hover:bg-page-primary transition-all flex items-center gap-3 text-body cursor-pointer"
          >
            <Calendar className="w-5 h-5" />
            <span>{t('scheduleDate')}</span>
          </button>
          <div className="border-t border-default my-1"></div>
          <button
            onClick={() => {
              removeBookmark(contextMenu.escort.id);
              setContextMenu(null);
            }}
            className="w-full px-4 py-3 text-left hover:bg-page-primary transition-all flex items-center gap-3 text-error cursor-pointer"
          >
            <Trash2 className="w-5 h-5" />
            <span>{t('removeFromList')}</span>
          </button>
        </div>
      )}
    </div>
  );
}
