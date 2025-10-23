'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { escortService } from '@/services/escortService';
import { profilePictureService } from '@/services/profilePictureService';
import { galleryService, GalleryPhoto } from '@/services/galleryService';
import { User } from '@/types/auth.types';
import { Check, MapPin, Home, Gem, Circle, Clock, Bookmark, Send, Flag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [escort, setEscort] = useState<User | null>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [locationText, setLocationText] = useState<string>('');
  const [distanceKm, setDistanceKm] = useState<number | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const username = params.id as string;
        const data = await escortService.getEscortByUsername(username);

        // Temporary: Add mock data for testing if backend doesn't provide it
        if (!data.isOnline && !data.lastSeen) {
          data.lastSeen = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(); // 2 hours ago
        }

        setEscort(data);

        // Load gallery photos
        if (data.id) {
          const photos = await galleryService.getPublicPhotos(data.id);
          setGalleryPhotos(photos);
        }

        // Fetch location from coordinates and calculate distance
        if (data.location && data.location.coordinates && data.location.coordinates.length === 2) {
          const [escortLon, escortLat] = data.location.coordinates;

          // Fetch location name
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${escortLat}&lon=${escortLon}`
            );
            const locationData = await response.json();

            const city = locationData.address?.city ||
                        locationData.address?.town ||
                        locationData.address?.village || '';
            const postcode = locationData.address?.postcode || '';

            if (postcode && city) {
              setLocationText(`${postcode} ${city}`);
            } else if (city) {
              setLocationText(city);
            } else {
              setLocationText('Standort verfügbar');
            }
          } catch (error) {
            console.error('Error fetching location:', error);
            setLocationText('Standort verfügbar');
          }

          // Get user's location and calculate distance
          try {
            const ipResponse = await fetch('https://ipapi.co/json/');
            const ipData = await ipResponse.json();

            if (ipData.latitude && ipData.longitude) {
              const userLat = ipData.latitude;
              const userLon = ipData.longitude;

              // Calculate distance using Haversine formula
              const R = 6371; // Earth radius in km
              const dLat = ((escortLat - userLat) * Math.PI) / 180;
              const dLon = ((escortLon - userLon) * Math.PI) / 180;
              const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos((userLat * Math.PI) / 180) *
                  Math.cos((escortLat * Math.PI) / 180) *
                  Math.sin(dLon / 2) *
                  Math.sin(dLon / 2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              const distance = R * c;

              setDistanceKm(Math.round(distance));
            }
          } catch (error) {
            console.error('Error calculating distance:', error);
          }
        }
      } catch (err) {
        setError('Fehler beim Laden des Profils');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [params.id]);

  // Generate photos array: profile picture first, then gallery photos
  const photos = (() => {
    const allPhotos: string[] = [];
    
    // Add profile picture first if it exists
    if (escort?.profilePicture) {
      allPhotos.push(profilePictureService.getProfilePictureUrl(escort.profilePicture));
    }
    
    // Add gallery photos
    galleryPhotos.forEach((photo) => {
      allPhotos.push(galleryService.getPhotoUrl(photo.photoUrl));
    });
    
    return allPhotos;
  })();

  // Keyboard navigation for fullscreen gallery
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      } else if (e.key === 'ArrowLeft') {
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, selectedImageIndex, photos.length]);

  const calculateAge = (birthDate: string | undefined): number | null => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const handleMessageClick = () => {
    // TODO: Navigate to chat
    console.log('Navigate to chat');
  };

  const handleDateClick = () => {
    // TODO: Open date booking modal
    console.log('Open date booking');
  };

  if (loading) {
    return (
      <main className="min-h-screen py-8" style={{ background: 'var(--background-primary)' }}>
        <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: 'var(--max-content-width)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Lädt...</p>
        </div>
      </main>
    );
  }

  if (error || !escort) {
    return (
      <main className="min-h-screen py-8" style={{ background: 'var(--background-primary)' }}>
        <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: 'var(--max-content-width)' }}>
          <div className="p-4 rounded-lg mb-4 border-depth" style={{ background: 'var(--background-primary)', borderColor: 'var(--color-primary)' }}>
            <p style={{ color: 'var(--color-primary)' }}>{error || 'Profile not found'}</p>
          </div>
          <button onClick={() => router.push('/escorts')} className="btn-base btn-primary">
            Zurück zur Übersicht
          </button>
        </div>
      </main>
    );
  }

  const age = calculateAge(escort.birthDate);

  return (
    <main className="min-h-screen py-8" style={{ background: 'var(--background-primary)' }}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: 'var(--max-content-width)' }}>
        {/* Main Profile Layout: Gallery (2/3) + Info (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Photo Gallery - 2/3 width */}
          <div className="lg:col-span-2">
            <div className="rounded-lg overflow-hidden border-depth" style={{ background: 'var(--background-primary)' }}>
              {/* Main Image - flexible height, no cropping */}
              <div
                className="relative w-full flex items-center justify-center"
                style={{
                  minHeight: '500px',
                  maxHeight: '700px',
                  background: 'var(--background-secondary)'
                }}
              >
                {photos.length > 0 ? (
                  <>
                    <img
                      src={photos[selectedImageIndex]}
                      alt={`Foto ${selectedImageIndex + 1}`}
                      className="w-full h-full cursor-pointer"
                      style={{ 
                        objectFit: 'contain',
                        maxHeight: '700px'
                      }}
                      onClick={() => setIsFullscreen(true)}
                    />
                    
                    {/* Navigation Arrows */}
                    {photos.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
                          style={{
                            background: 'rgba(0, 0, 0, 0.5)',
                            color: 'var(--text-button)',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                          }}
                        >
                          ‹
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
                          style={{
                            background: 'rgba(0, 0, 0, 0.5)',
                            color: 'var(--text-button)',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                          }}
                        >
                          ›
                        </button>
                      </>
                    )}

                    {/* Image Counter */}
                    <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full text-sm font-medium"
                      style={{ 
                        background: 'rgba(0, 0, 0, 0.7)',
                        color: 'var(--text-button)'
                      }}>
                      {selectedImageIndex + 1} / {photos.length}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-9xl font-bold" style={{ color: 'var(--text-heading)' }}>
                      {escort.firstName?.[0]?.toUpperCase() || escort.username?.[0]?.toUpperCase() || '?'}
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {photos.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {photos.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all cursor-pointer"
                      style={{
                        border: selectedImageIndex === index
                          ? '2px solid var(--color-primary)'
                          : '2px solid transparent',
                        opacity: selectedImageIndex === index ? 1 : 0.6
                      }}
                    >
                      <img
                        src={photo}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Profile Info - 1/3 width */}
          <div className="lg:col-span-1">
            <div className="rounded-lg p-6 border-depth space-y-6" style={{ background: 'var(--background-primary)' }}>
              {/* Name & Username */}
              <div>
                {/* Show name only if showNameInProfile is true and name exists */}
                {escort.showNameInProfile && escort.firstName && escort.lastName ? (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>
                        {escort.firstName} {escort.lastName}
                      </h1>
                      {/* Verified Badge */}
                      <div className="flex items-center justify-center w-5 h-5 rounded-full" style={{ backgroundColor: 'var(--color-secondary)' }}>
                        <Check className="w-3 h-3" style={{ color: 'var(--color-link-secondary)', strokeWidth: 3 }} />
                      </div>
                      {/* Premium Badge */}
                      <div className="flex items-center justify-center w-5 h-5 rounded-full" style={{
                        backgroundColor: 'var(--color-primary)'
                      }}>
                        <Gem className="w-3 h-3" style={{ color: 'var(--color-link-secondary)', fill: 'none', strokeWidth: 2 }} />
                      </div>
                    </div>
                    <p className="text-base mb-2" style={{ color: 'var(--text-secondary)' }}>
                      {escort.username}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>
                        {escort.username || 'Unbekannt'}
                      </p>
                      {/* Verified Badge */}
                      <div className="flex items-center justify-center w-5 h-5 rounded-full" style={{ backgroundColor: 'var(--color-secondary)' }}>
                        <Check className="w-3 h-3" style={{ color: 'var(--color-link-secondary)', strokeWidth: 3 }} />
                      </div>
                      {/* Premium Badge */}
                      <div className="flex items-center justify-center w-5 h-5 rounded-full" style={{
                        backgroundColor: 'var(--color-primary)'
                      }}>
                        <Gem className="w-3 h-3" style={{ color: 'var(--color-link-secondary)', fill: 'none', strokeWidth: 2 }} />
                      </div>
                    </div>
                  </>
                )}

                {/* Location and Distance */}
                <div className="space-y-1 mb-4 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                  {locationText && (
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {locationText}
                      </span>
                    </div>
                  )}

                  {distanceKm !== null && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {distanceKm} km
                      </span>
                    </div>
                  )}

                  {/* Online Status */}
                  <div className="flex items-center gap-2">
                    {escort.isOnline ? (
                      <>
                        <Circle className="w-4 h-4" style={{ color: '#10b981', fill: '#10b981' }} />
                        <span className="text-sm" style={{ color: 'var(--color-primary)' }}>
                          Jetzt online
                        </span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {escort.lastSeen ? (
                            (() => {
                              try {
                                const lastSeenDate = new Date(escort.lastSeen);
                                const timeAgo = formatDistanceToNow(lastSeenDate, {
                                  addSuffix: false,
                                  locale: de
                                });
                                return `Zuletzt online vor ${timeAgo}`;
                              } catch (error) {
                                console.error('Error formatting lastSeen:', error, escort.lastSeen);
                                return 'Offline';
                              }
                            })()
                          ) : (
                            'Offline'
                          )}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Attributes */}
                <div className="space-y-2">
                  {age && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Alter:</span>
                      <span className="text-sm" style={{ color: 'var(--text-regular)' }}>{age} Jahre</span>
                    </div>
                  )}

                  {escort.gender && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Geschlecht:</span>
                      <span className="text-sm" style={{ color: 'var(--text-regular)' }}>{escort.gender}</span>
                    </div>
                  )}

                  {escort.nationalities && escort.nationalities.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Nationalität:</span>
                      <span className="text-sm" style={{ color: 'var(--text-regular)' }}>{escort.nationalities.join(', ')}</span>
                    </div>
                  )}

                  {/* Körper */}
                  {(escort.height || escort.weight || escort.bodyType) && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Körper:</span>
                      <span className="text-sm" style={{ color: 'var(--text-regular)' }}>
                        {[
                          escort.height ? `${escort.height} cm` : null,
                          escort.weight ? `${escort.weight} kg` : null,
                          escort.bodyType
                        ].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}

                  {escort.cupSize && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Oberweite:</span>
                      <span className="text-sm" style={{ color: 'var(--text-regular)' }}>{escort.cupSize} Körbchen</span>
                    </div>
                  )}

                  {/* Haar */}
                  {(escort.hairLength || escort.hairColor) && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Haar:</span>
                      <span className="text-sm" style={{ color: 'var(--text-regular)' }}>
                        {[escort.hairLength, escort.hairColor].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}

                  {escort.eyeColor && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Augenfarbe:</span>
                      <span className="text-sm" style={{ color: 'var(--text-regular)' }}>{escort.eyeColor}</span>
                    </div>
                  )}

                  {escort.languages && escort.languages.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Sprachen:</span>
                      <span className="text-sm" style={{ color: 'var(--text-regular)' }}>{escort.languages.join(', ')}</span>
                    </div>
                  )}

                  {/* Körperschmuck */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Körperschmuck:</span>
                    <span className="text-sm" style={{ color: 'var(--text-regular)' }}>
                      {[
                        escort.hasTattoos ? 'Tattoos' : null,
                        escort.hasPiercings ? 'Piercings' : null
                      ].filter(Boolean).join(', ') || 'Keiner'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleMessageClick}
                  className="w-full btn-base btn-primary cursor-pointer"
                >
                  Nachricht schreiben
                </button>
                <button
                  onClick={handleDateClick}
                  className="w-full btn-base btn-secondary cursor-pointer"
                >
                  Date vereinbaren
                </button>
              </div>

              {/* Tags */}
              {escort.isSmoker && (
                <div className="flex flex-wrap gap-2 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <span className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      background: 'rgba(113, 118, 123, 0.1)',
                      color: 'var(--text-secondary)'
                    }}>
                    🚬 Raucher/in
                  </span>
                </div>
              )}
            </div>

            {/* Quick Actions - Outside Container */}
            <div className="flex justify-center gap-12 mt-6">
              <button className="flex flex-col items-center gap-2 cursor-pointer group">
                <Bookmark
                  className="w-5 h-5 transition-colors"
                  style={{
                    color: 'var(--color-primary)'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-link-secondary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
                />
                <span
                  className="text-xs transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-link-secondary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  Merken
                </span>
              </button>

              <button className="flex flex-col items-center gap-2 cursor-pointer group">
                <svg
                  className="w-5 h-5 transition-colors"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: 'var(--color-primary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-link-secondary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
                >
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                  <polyline points="16 6 12 2 8 6"></polyline>
                  <line x1="12" y1="2" x2="12" y2="15"></line>
                </svg>
                <span
                  className="text-xs transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-link-secondary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  Teilen
                </span>
              </button>

              <button className="flex flex-col items-center gap-2 cursor-pointer group">
                <Flag
                  className="w-5 h-5 transition-colors"
                  style={{
                    color: 'var(--color-primary)'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-link-secondary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
                />
                <span
                  className="text-xs transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-link-secondary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  Melden
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Service Information Section - Full Width */}
        <div className="rounded-lg p-8 border-depth" style={{ background: 'var(--background-primary)' }}>
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-heading)' }}>
            Service & Angebote
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Dieser Bereich wird in einem späteren Schritt implementiert.
          </p>
        </div>

        {/* Fullscreen Gallery Modal */}
        {isFullscreen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center mobile-menu-backdrop"
            style={{ background: 'rgba(0, 0, 0, 0.95)' }}
            onClick={() => setIsFullscreen(false)}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all hover:scale-110 cursor-pointer"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'var(--text-button)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              ✕
            </button>

            {/* Image */}
            <div className="relative max-w-7xl max-h-[90vh] w-full mx-4">
              <img
                src={photos[selectedImageIndex]}
                alt={`Foto ${selectedImageIndex + 1}`}
                className="w-full h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />

              {/* Navigation */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-all hover:scale-110 cursor-pointer"
                    style={{
                      background: 'rgba(0, 0, 0, 0.7)',
                      color: 'var(--text-button)',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    ‹
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-all hover:scale-110 cursor-pointer"
                    style={{
                      background: 'rgba(0, 0, 0, 0.7)',
                      color: 'var(--text-button)',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    ›
                  </button>
                </>
              )}

              {/* Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-base font-medium"
                style={{ 
                  background: 'rgba(0, 0, 0, 0.7)',
                  color: 'var(--text-button)'
                }}>
                {selectedImageIndex + 1} / {photos.length}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}