'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { escortService } from '@/services/escortService';
import { profilePictureService } from '@/services/profilePictureService';
import { galleryService, GalleryPhoto } from '@/services/galleryService';
import { User } from '@/types/auth.types';
import { Check, MapPin, Home, Gem, Circle, Clock, Bookmark, Send, Flag, ArrowLeft, Star, Phone, Copy, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import ProfileTabs from '@/components/ProfileTabs';
import { scrollPositionUtil } from '@/utils/scrollPosition';

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
  const [activeTab, setActiveTab] = useState<'service' | 'preise' | 'zeiten' | 'ueber-mich' | 'bewertungen'>('service');
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  // Mock data for reviews (replace with real data later)
  const reviewCount = 24;
  const averageRating = 3.5;

  // Mock phone number (replace with real data later)
  const phoneNumber = '+49 151 12345678';

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

  // Keyboard navigation for fullscreen gallery and prevent body scroll
  useEffect(() => {
    if (!isFullscreen) return;

    // Prevent body scroll when fullscreen is open
    document.body.style.overflow = 'hidden';

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

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // Restore body scroll when fullscreen is closed
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen, selectedImageIndex, photos.length]);

  // Prevent body scroll when phone modal is open
  useEffect(() => {
    if (showPhoneModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showPhoneModal]);

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

  const handleBackClick = () => {
    // Navigate back to escorts page
    router.push('/escorts');
  };

  const handleReviewsClick = () => {
    // Switch to reviews tab
    setActiveTab('bewertungen');

    // Scroll to tabs container
    setTimeout(() => {
      if (tabsContainerRef.current) {
        const yOffset = -80; // Offset for sticky header
        const y = tabsContainerRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }, 100);
  };

  const handleShareClick = async () => {
    const shareData = {
      title: escort?.firstName && escort?.lastName
        ? `${escort.firstName} ${escort.lastName} - Aurora`
        : `${escort?.username} - Aurora`,
      text: `Schau dir ${escort?.firstName && escort?.lastName ? `${escort.firstName} ${escort.lastName}` : escort?.username} auf Aurora an!`,
      url: window.location.href,
    };

    try {
      // Check if Web Share API is supported
      if (navigator.share) {
        await navigator.share(shareData);
        console.log('Profile shared successfully');
      } else {
        // Fallback: Copy link to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert('Link wurde in die Zwischenablage kopiert!');
      }
    } catch (error) {
      // User cancelled or error occurred
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        // Fallback: Try to copy to clipboard
        try {
          await navigator.clipboard.writeText(window.location.href);
          alert('Link wurde in die Zwischenablage kopiert!');
        } catch (clipboardError) {
          console.error('Clipboard error:', clipboardError);
        }
      }
    }
  };

  const handleCopyPhone = async () => {
    try {
      await navigator.clipboard.writeText(phoneNumber);
      alert('Telefonnummer wurde kopiert!');
      setShowPhoneModal(false);
    } catch (error) {
      console.error('Failed to copy phone number:', error);
    }
  };

  const handleCallPhone = () => {
    window.location.href = `tel:${phoneNumber}`;
    setShowPhoneModal(false);
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${phoneNumber.replace(/\s+/g, '')}`, '_blank');
    setShowPhoneModal(false);
  };

  const handleTelegram = () => {
    window.open(`https://t.me/${phoneNumber.replace(/\s+/g, '')}`, '_blank');
    setShowPhoneModal(false);
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
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-4">
          {/* Back Button */}
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer"
            style={{ color: 'var(--color-primary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Zurück</span>
          </button>

          {/* Action Buttons */}
          <div className="flex items-center gap-6">
            {/* Bookmark */}
            <button
              className="flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              <Bookmark className="w-5 h-5" />
              <span className="hidden sm:inline">Merken</span>
            </button>

            {/* Share */}
            <button
              onClick={handleShareClick}
              className="flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                <polyline points="16 6 12 2 8 6"></polyline>
                <line x1="12" y1="2" x2="12" y2="15"></line>
              </svg>
              <span className="hidden sm:inline">Teilen</span>
            </button>

            {/* Report */}
            <button
              className="flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              <Flag className="w-5 h-5" />
              <span className="hidden sm:inline">Melden</span>
            </button>
          </div>
        </div>

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

                {/* Rating - directly below username */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4"
                        style={{
                          color: i < Math.floor(averageRating) ? 'var(--color-primary)' : 'var(--background-secondary)',
                          fill: i < Math.floor(averageRating) ? 'var(--color-primary)' : 'var(--background-secondary)',
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>
                    {averageRating.toFixed(1)}
                  </span>
                  <button
                    onClick={handleReviewsClick}
                    className="text-xs transition-colors cursor-pointer"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  >
                    ({reviewCount} Bewertungen)
                  </button>
                </div>

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

            {/* Phone Number Link - Outside container */}
            <button
              onClick={() => setShowPhoneModal(true)}
              className="flex items-center justify-center gap-2 w-full py-3 transition-colors cursor-pointer"
              style={{ color: 'var(--color-primary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm font-medium">Telefonnummer anzeigen</span>
            </button>
          </div>
        </div>

        {/* Profile Tabs Section - Full Width */}
        <div ref={tabsContainerRef}>
          <ProfileTabs escort={escort} initialTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Fullscreen Gallery Modal */}
        {isFullscreen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center mobile-menu-backdrop overflow-hidden"
            style={{ background: 'rgba(0, 0, 0, 0.95)' }}
            onClick={() => setIsFullscreen(false)}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all hover:scale-110"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'var(--text-button)',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>

            {/* Image */}
            <div className="relative w-full h-full flex items-center justify-center mx-4">
              <img
                src={photos[selectedImageIndex]}
                alt={`Foto ${selectedImageIndex + 1}`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain'
                }}
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

        {/* Phone Modal */}
        {showPhoneModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center mobile-menu-backdrop"
            style={{ background: 'rgba(0, 0, 0, 0.7)' }}
            onClick={() => setShowPhoneModal(false)}
          >
            <div
              className="rounded-lg p-6 w-full max-w-md mx-4 border-depth relative"
              style={{
                background: 'var(--background-primary)',
                border: '1px solid var(--border)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowPhoneModal(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer"
                style={{
                  background: 'var(--background-tertiary)',
                  color: 'var(--text-secondary)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-primary)';
                  e.currentTarget.style.color = 'var(--text-button)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--background-tertiary)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                ✕
              </button>

              {/* Modal Header */}
              <div className="mb-6 text-center">
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-heading)' }}>
                  Telefonnummer
                </h3>
                <p className="text-lg font-semibold" style={{ color: 'var(--color-primary)' }}>
                  {phoneNumber}
                </p>
              </div>

              {/* Action Links - Horizontal Grid */}
              <div className="grid grid-cols-4 gap-4">
                <button
                  onClick={handleCopyPhone}
                  className="flex flex-col items-center gap-2 py-4 px-2 rounded-lg transition-all cursor-pointer border-depth"
                  style={{
                    background: 'var(--background-secondary)',
                    color: 'var(--text-heading)',
                    border: '1px solid var(--border)',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                >
                  <Copy className="w-6 h-6" />
                  <span className="text-xs font-medium text-center">Kopieren</span>
                </button>

                <button
                  onClick={handleCallPhone}
                  className="flex flex-col items-center gap-2 py-4 px-2 rounded-lg transition-all cursor-pointer border-depth"
                  style={{
                    background: 'var(--background-secondary)',
                    color: 'var(--text-heading)',
                    border: '1px solid var(--border)',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                >
                  <Phone className="w-6 h-6" />
                  <span className="text-xs font-medium text-center">Anrufen</span>
                </button>

                <button
                  onClick={handleWhatsApp}
                  className="flex flex-col items-center gap-2 py-4 px-2 rounded-lg transition-all cursor-pointer border-depth"
                  style={{
                    background: 'var(--background-secondary)',
                    color: 'var(--text-heading)',
                    border: '1px solid var(--border)',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <span className="text-xs font-medium text-center">WhatsApp</span>
                </button>

                <button
                  onClick={handleTelegram}
                  className="flex flex-col items-center gap-2 py-4 px-2 rounded-lg transition-all cursor-pointer border-depth"
                  style={{
                    background: 'var(--background-secondary)',
                    color: 'var(--text-heading)',
                    border: '1px solid var(--border)',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  <span className="text-xs font-medium text-center">Telegram</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}