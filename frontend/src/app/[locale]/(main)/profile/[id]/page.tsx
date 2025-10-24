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
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [escort, setEscort] = useState<User | null>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [locationText, setLocationText] = useState<string>('');
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'service' | 'preise' | 'zeiten' | 'treffpunkte' | 'ueber-mich' | 'bewertungen'>('service');
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [isCurrentImagePortrait, setIsCurrentImagePortrait] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [phoneCopied, setPhoneCopied] = useState(false);
  const [mediaTab, setMediaTab] = useState<'fotos' | 'videos'>('fotos');
  const [similarEscorts, setSimilarEscorts] = useState<User[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  // Detect if mobile on client side
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mock data for reviews (replace with real data later)
  const reviewCount = 24;
  const averageRating = 2.4;

  // Mock phone number (replace with real data later)
  const phoneNumber = '+49 151 12345678';

  // Check if escort is bookmarked
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!user || !escort || user.role !== 'customer' || !token) {
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:4000/users/bookmarks/check/${escort.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setIsBookmarked(response.data.isBookmarked);
      } catch (error) {
        console.error('Error checking bookmark status:', error);
      }
    };

    checkBookmarkStatus();
  }, [user, escort, token]);

  // Load similar escorts
  useEffect(() => {
    const loadSimilarEscorts = async () => {
      if (!escort?.id) return;

      setLoadingSimilar(true);
      try {
        // Load filters from localStorage
        const savedFilters = localStorage.getItem('aurora_member_filters');
        const filters = savedFilters ? JSON.parse(savedFilters) : null;

        // Get user location from filters or IP
        let userLat = filters?.userLatitude;
        let userLon = filters?.userLongitude;

        // If no saved location, try to get from IP
        if (!userLat || !userLon) {
          try {
            const ipResponse = await fetch('https://ipapi.co/json/', {
              signal: AbortSignal.timeout(5000),
            });
            if (ipResponse.ok) {
              const ipData = await ipResponse.json();
              userLat = ipData.latitude;
              userLon = ipData.longitude;
            }
          } catch (error) {
            // Silently fail - similar escorts will just be sorted by match score only
          }
        }

        const similar = await escortService.getSimilarEscorts(
          escort.id,
          filters,
          userLat,
          userLon,
          12,
        );
        setSimilarEscorts(similar);
      } catch (error) {
        console.error('Error loading similar escorts:', error);
      } finally {
        setLoadingSimilar(false);
      }
    };

    loadSimilarEscorts();
  }, [escort?.id]);

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
            const ipResponse = await fetch('https://ipapi.co/json/', {
              signal: AbortSignal.timeout(5000) // 5 second timeout
            });

            if (!ipResponse.ok) {
              throw new Error('IP API request failed');
            }

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
            // Silently fail - distance calculation is not critical
            // User will simply not see distance information
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
      setPhoneCopied(true);
      // Wait 1.5 seconds, then close the modal
      setTimeout(() => {
        setShowPhoneModal(false);
        setPhoneCopied(false);
      }, 1500);
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

  const handleBookmarkClick = async () => {
    if (!user || !escort || !token) {
      router.push('/login');
      return;
    }

    if (user.role !== 'customer') {
      return;
    }

    setBookmarkLoading(true);
    try {
      if (isBookmarked) {
        await axios.delete(`http://localhost:4000/users/bookmarks/${escort.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setIsBookmarked(false);
      } else {
        await axios.post(
          `http://localhost:4000/users/bookmarks/${escort.id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setBookmarkLoading(false);
    }
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
            {/* Bookmark - Only visible for customers */}
            {user && user.role === 'customer' && (
              <button
                onClick={handleBookmarkClick}
                disabled={bookmarkLoading}
                className="flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ color: 'var(--color-primary)' }}
                onMouseEnter={(e) => !bookmarkLoading && (e.currentTarget.style.color = 'var(--color-primary-hover)')}
                onMouseLeave={(e) => !bookmarkLoading && (e.currentTarget.style.color = 'var(--color-primary)')}
              >
                <Bookmark
                  className="w-5 h-5"
                  fill={isBookmarked ? 'currentColor' : 'none'}
                />
                <span className="hidden sm:inline">{isBookmarked ? 'Gemerkt' : 'Merken'}</span>
              </button>
            )}

            {/* Share */}
            <button
              onClick={handleShareClick}
              className="flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer"
              style={{ color: 'var(--color-primary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/>
              </svg>
              <span className="hidden sm:inline">Teilen</span>
            </button>

            {/* Report */}
            <button
              className="flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer"
              style={{ color: 'var(--color-primary)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
            >
              <Flag className="w-5 h-5" />
              <span className="hidden sm:inline">Melden</span>
            </button>
          </div>
        </div>

        {/* Main Profile Layout: Gallery (2/3) + Info (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 lg:items-stretch">
          {/* Photo Gallery - 2/3 width */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="rounded-lg overflow-hidden border-depth" style={{ background: 'var(--background-primary)' }}>
              {/* Main Image - fixed height on desktop, no cropping */}
              <div
                className="relative w-full flex items-center justify-center overflow-hidden"
                style={{
                  height: '600px',
                  background: 'var(--background-secondary)'
                }}
              >
                {photos.length > 0 ? (
                  <>
                    {/* Background: Blurred version of current image (only show on desktop OR on mobile for landscape images) */}
                    {(!isCurrentImagePortrait || !isMobile) && (
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `url(${photos[selectedImageIndex]})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          filter: 'blur(60px)',
                          transform: 'scale(1.15)',
                          opacity: 0.7
                        }}
                      />
                    )}

                    {/* Foreground: Sharp image */}
                    <img
                      src={photos[selectedImageIndex]}
                      alt={`Foto ${selectedImageIndex + 1}`}
                      className="relative w-full h-full cursor-pointer z-10"
                      style={{
                        objectFit: isCurrentImagePortrait && isMobile ? 'cover' : 'contain'
                      }}
                      onLoad={(e) => {
                        const img = e.currentTarget;
                        setIsCurrentImagePortrait(img.naturalHeight > img.naturalWidth);
                      }}
                      onClick={() => setIsFullscreen(true)}
                    />
                    
                    {/* Navigation Arrows */}
                    {photos.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 cursor-pointer z-20"
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
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 cursor-pointer z-20"
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
                    <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full text-sm font-medium z-20"
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
            </div>

            {/* Thumbnail Gallery */}
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all cursor-pointer border-depth"
                    style={{
                      border: selectedImageIndex === index
                        ? '2px solid var(--color-primary)'
                        : '2px solid var(--border)',
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

          {/* Profile Info - 1/3 width */}
          <div className="lg:col-span-1">
            <div className="rounded-lg p-6 border-depth space-y-6 lg:h-[600px]" style={{ background: 'var(--background-primary)' }}>
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
                    <svg width="0" height="0" style={{ position: 'absolute' }}>
                      <defs>
                        {[...Array(5)].map((_, i) => {
                          const fillPercentage = Math.min(Math.max((averageRating - i) * 100, 0), 100);
                          return (
                            <linearGradient key={i} id={`star-gradient-${i}`}>
                              <stop offset={`${fillPercentage}%`} stopColor="var(--color-primary)" />
                              <stop offset={`${fillPercentage}%`} stopColor="var(--background-secondary)" />
                            </linearGradient>
                          );
                        })}
                      </defs>
                    </svg>
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill={`url(#star-gradient-${i})`}
                        stroke={`url(#star-gradient-${i})`}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
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
                  {(locationText || distanceKm !== null) && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {locationText && (
                        <>
                          <Home className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {locationText}
                          </span>
                        </>
                      )}
                      {distanceKm !== null && (
                        <>
                          <MapPin className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {distanceKm} km
                          </span>
                        </>
                      )}
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
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Alter:</span>
                    <span className="text-sm" style={{ color: 'var(--text-regular)' }}>
                      {age ? `${age} Jahre` : 'keine Angabe'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Geschlecht:</span>
                    <span className="text-sm" style={{ color: 'var(--text-regular)' }}>
                      {escort.gender || 'keine Angabe'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Nationalität:</span>
                    <span className="text-sm" style={{ color: 'var(--text-regular)' }}>
                      {escort.nationalities && escort.nationalities.length > 0 ? escort.nationalities.join(', ') : 'keine Angabe'}
                    </span>
                  </div>

                  {/* Körper - only show "keine Angabe" if ALL sub-attributes are empty */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Körper:</span>
                    <span className="text-sm" style={{ color: 'var(--text-regular)' }}>
                      {(escort.height || escort.weight || escort.bodyType)
                        ? [
                            escort.height ? `${escort.height} cm` : null,
                            escort.weight ? `${escort.weight} kg` : null,
                            escort.bodyType
                          ].filter(Boolean).join(', ')
                        : 'keine Angabe'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Oberweite:</span>
                    <span className="text-sm" style={{ color: 'var(--text-regular)' }}>
                      {escort.cupSize ? `${escort.cupSize} Körbchen` : 'keine Angabe'}
                    </span>
                  </div>

                  {/* Haare - only show "keine Angabe" if ALL sub-attributes are empty */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Haare:</span>
                    <span className="text-sm" style={{ color: 'var(--text-regular)' }}>
                      {(escort.hairLength || escort.hairColor)
                        ? [escort.hairLength, escort.hairColor].filter(Boolean).join(', ')
                        : 'keine Angabe'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Augenfarbe:</span>
                    <span className="text-sm" style={{ color: 'var(--text-regular)' }}>
                      {escort.eyeColor || 'keine Angabe'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Sprachen:</span>
                    <span className="text-sm" style={{ color: 'var(--text-regular)' }}>
                      {escort.languages && escort.languages.length > 0 ? escort.languages.join(', ') : 'keine Angabe'}
                    </span>
                  </div>

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
                  className="w-full btn-base btn-primary cursor-pointer flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Nachricht schreiben
                </button>
                <button
                  onClick={handleDateClick}
                  className="w-full btn-base btn-secondary cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
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

        {/* Similar Escorts Section */}
        {similarEscorts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-heading)' }}>
              Weitere Escorts in deiner Nähe
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {similarEscorts.map((similarEscort) => {
                const similarAge = similarEscort.birthDate ? calculateAge(similarEscort.birthDate) : null;

                return (
                  <div
                    key={similarEscort.id}
                    onClick={() => {
                      router.push(`/profile/${similarEscort.username}`);
                    }}
                    className="bg-page-primary border-depth rounded-lg overflow-hidden cursor-pointer transition-all"
                  >
                    {/* Profile Picture */}
                    <div className="aspect-square bg-page-secondary flex items-center justify-center relative">
                      {similarEscort.profilePicture ? (
                        <img
                          src={profilePictureService.getProfilePictureUrl(similarEscort.profilePicture)}
                          alt={similarEscort.username || 'Profilbild'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-muted text-6xl">
                          {(
                            similarEscort.firstName?.[0] ||
                            similarEscort.username?.[0] ||
                            '?'
                          ).toUpperCase()}
                        </div>
                      )}

                      {/* Premium Badge */}
                      <div
                        className="absolute top-2 right-2 flex items-center justify-center w-7 h-7 rounded-full backdrop-blur-sm"
                        style={{
                          backgroundColor: 'var(--color-primary)',
                          opacity: 0.85,
                        }}
                      >
                        <Gem
                          className="w-3.5 h-3.5"
                          style={{ color: 'var(--color-link-secondary)', fill: 'none', strokeWidth: 2 }}
                        />
                      </div>
                    </div>

                    {/* Information */}
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <h3 className="text-base font-normal text-body">
                          {similarEscort.username || 'Unbekannt'}
                        </h3>
                        <div
                          className="flex items-center justify-center w-4 h-4 rounded-full"
                          style={{ backgroundColor: 'var(--color-secondary)' }}
                        >
                          <Check
                            className="w-2.5 h-2.5"
                            style={{ color: 'var(--text-button)', strokeWidth: 3 }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted">
                        {/* Show distance if location available */}
                        {similarEscort.location ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {(() => {
                              const coords = similarEscort.location.coordinates;
                              if (!coords || coords.length !== 2) return '';

                              const [escortLon, escortLat] = coords;

                              // Get user location from localStorage or current location
                              const savedFilters = localStorage.getItem('aurora_member_filters');
                              const filters = savedFilters ? JSON.parse(savedFilters) : null;
                              const userLat = filters?.userLatitude;
                              const userLon = filters?.userLongitude;

                              if (!userLat || !userLon) return '';

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

                              return `${Math.round(distance)} km`;
                            })()}
                          </span>
                        ) : (
                          <span></span>
                        )}

                        {/* Star Rating */}
                        <div className="flex items-center gap-1">
                          <Star
                            className="w-3.5 h-3.5"
                            style={{ color: 'var(--color-primary)', fill: 'var(--color-primary)' }}
                          />
                          <span className="text-sm text-body font-normal">2.5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 mobile-menu-backdrop"
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
                {phoneCopied ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" style={{ color: 'var(--color-primary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <p className="text-lg font-semibold" style={{ color: 'var(--color-primary)' }}>
                      Telefonnummer wurde kopiert!
                    </p>
                  </div>
                ) : (
                  <p className="text-lg font-semibold" style={{ color: 'var(--color-primary)' }}>
                    {phoneNumber}
                  </p>
                )}
              </div>

              {/* Action Links - Horizontal on Desktop, Vertical on Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <button
                  onClick={handleCopyPhone}
                  className="flex flex-col items-center gap-2 py-4 px-2 rounded-lg transition-all cursor-pointer border-depth"
                  style={{
                    background: 'var(--background-primary)',
                    color: 'var(--color-primary)',
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
                    background: 'var(--background-primary)',
                    color: 'var(--color-primary)',
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
                    background: 'var(--background-primary)',
                    color: 'var(--color-primary)',
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
                    background: 'var(--background-primary)',
                    color: 'var(--color-primary)',
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