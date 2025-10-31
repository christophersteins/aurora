'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { escortService } from '@/services/escortService';
import { profilePictureService } from '@/services/profilePictureService';
import { galleryService, GalleryPhoto } from '@/services/galleryService';
import { User } from '@/types/auth.types';
import { Check, MapPin, Home, Gem, Circle, Clock, Bookmark, Send, Flag, ArrowLeft, Star, Phone, Copy, MessageCircle, Expand, Heart, MessageSquare, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import ProfileTabs from '@/components/ProfileTabs';
import { scrollPositionUtil } from '@/utils/scrollPosition';
import { useAuthStore } from '@/store/authStore';
import { useOnlineStatusStore } from '@/store/onlineStatusStore';
import axios from 'axios';
import LoginModal from '@/components/LoginModal';
import RegisterModal from '@/components/RegisterModal';
import ForgotPasswordModal from '@/components/ForgotPasswordModal';
import ReportModal from '@/components/ReportModal';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user, token, isAuthenticated, _hasHydrated } = useAuthStore();
  const { getUserStatus, userStatuses } = useOnlineStatusStore();
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
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Reset selected image index when switching tabs
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [mediaTab]);

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
      if (!user || !escort || !token) {
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

        setEscort(data);

        // Load gallery photos
        if (data.id) {
          const photos = await galleryService.getPublicPhotos(data.id);
          setGalleryPhotos(photos);
        }

        // Fetch location from coordinates and calculate distance
        if (data.location && data.location.coordinates && data.location.coordinates.length === 2) {
          const [escortLon, escortLat] = data.location.coordinates;

          // Fetch location name via API route
          try {
            const response = await fetch(
              `/api/geocode?lat=${escortLat}&lon=${escortLon}`,
              {
                signal: AbortSignal.timeout(6000) // 6 second timeout
              }
            );

            if (!response.ok) {
              throw new Error(`API error: ${response.status}`);
            }

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
            // Silently fail - location name is not critical
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

  // Helper function to check if a URL is a video
  const isVideoUrl = (url: string): boolean => {
    const videoExtensions = /\.(mp4|mov|avi|webm|mkv|flv)(\?.*)?$/i;
    return videoExtensions.test(url);
  };

  // Generate photos array with metadata: profile picture first, then gallery photos (filtered by media tab)
  const photos = (() => {
    const allPhotos: Array<{
      url: string;
      isFsk18: boolean;
    }> = [];

    // Add profile picture first if it exists (only in fotos tab)
    if (mediaTab === 'fotos' && escort?.profilePicture) {
      allPhotos.push({
        url: profilePictureService.getProfilePictureUrl(escort.profilePicture),
        isFsk18: false,
      });
    }

    // Add gallery photos, filtered by media type
    galleryPhotos.forEach((photo) => {
      const photoUrl = galleryService.getPhotoUrl(photo.photoUrl);
      const isVideo = isVideoUrl(photoUrl);

      // Add to array based on active tab
      if (mediaTab === 'fotos' && !isVideo) {
        allPhotos.push({
          url: photoUrl,
          isFsk18: photo.isFsk18,
        });
      } else if (mediaTab === 'videos' && isVideo) {
        allPhotos.push({
          url: photoUrl,
          isFsk18: photo.isFsk18,
        });
      }
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
    if (!escort?.id) return;

    // Check if user is logged in
    if (!user) {
      setLoginModalOpen(true);
      return;
    }

    // Navigate to chat with this escort
    router.push(`/nachrichten?username=${escort.username}`);
  };

  const handleDateClick = () => {
    // Check if user is logged in
    if (!user) {
      setLoginModalOpen(true);
      return;
    }

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
      setLoginModalOpen(true);
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

  const openLoginModal = () => {
    setLoginModalOpen(true);
    setRegisterModalOpen(false);
  };

  const openRegisterModal = () => {
    setRegisterModalOpen(true);
    setLoginModalOpen(false);
  };

  const closeModals = () => {
    setLoginModalOpen(false);
    setRegisterModalOpen(false);
    setForgotPasswordModalOpen(false);
  };

  const openForgotPasswordModal = () => {
    setForgotPasswordModalOpen(true);
    setLoginModalOpen(false);
    setRegisterModalOpen(false);
  };

  const handleBackToLoginFromForgotPassword = () => {
    setForgotPasswordModalOpen(false);
    setLoginModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <p style={{ color: 'var(--text-secondary)' }}>Lädt...</p>
      </div>
    );
  }

  if (error || !escort) {
    return (
      <div className="min-h-screen py-8">
        <div className="p-4 rounded-lg mb-4 border-depth" style={{ background: 'var(--background-primary)', borderColor: 'var(--color-primary)' }}>
          <p style={{ color: 'var(--color-primary)' }}>{error || 'Profile not found'}</p>
        </div>
        <button onClick={() => router.push('/escorts')} className="btn-base btn-primary">
          Zurück zur Übersicht
        </button>
      </div>
    );
  }

  const age = calculateAge(escort.birthDate);

  return (
    <div className="min-h-screen py-2 lg:py-8">
      {/* Profile Header - Desktop/Tablet (single row) - Fixed */}
      <div className="hidden lg:block fixed top-0 z-50" style={{
        left: 'calc(var(--sidebar-offset, 0px) + var(--sidebar-width, 0px))',
        width: 'var(--max-content-width, 1100px)',
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRight: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <div style={{
          paddingLeft: 'var(--content-padding-left)',
          paddingRight: '2rem'
        }}>
            <div className="flex items-center justify-between py-4 gap-6">
              {/* Back Button and Username */}
              <div className="flex items-center gap-8 min-w-0 flex-1">
                <button
                  onClick={handleBackClick}
                  className="flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer"
                  style={{ color: 'var(--text-heading)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-heading-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-heading)')}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                {/* Username with Badges */}
                <div className="flex items-center gap-2 min-w-0">
                  <h1 className="text-lg font-bold truncate" style={{ color: 'var(--text-heading)' }}>
                    {escort?.username || 'Unbekannt'}
                  </h1>
                  {/* Verified Badge - only show if verified */}
                  {escort?.isVerified && (
                    <div className="flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--color-secondary)' }}>
                      <Check className="w-3 h-3" style={{ color: 'var(--color-link-secondary)', strokeWidth: 3 }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-6 flex-shrink-0">
                {/* Bookmark */}
                <button
                  onClick={handleBookmarkClick}
                  disabled={bookmarkLoading}
                  className="flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ color: 'var(--text-heading)' }}
                  onMouseEnter={(e) => !bookmarkLoading && (e.currentTarget.style.color = 'var(--text-heading-hover)')}
                  onMouseLeave={(e) => !bookmarkLoading && (e.currentTarget.style.color = 'var(--text-heading)')}
                >
                  <Bookmark
                    className="w-5 h-5"
                    fill={isBookmarked ? 'currentColor' : 'none'}
                  />
                  <span className="hidden sm:inline">{isBookmarked ? 'Gemerkt' : 'Merken'}</span>
                </button>

                {/* Date */}
                <button
                  onClick={handleDateClick}
                  className="flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer"
                  style={{ color: 'var(--text-heading)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-heading-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-heading)')}
                >
                  <Calendar className="w-5 h-5" />
                  <span className="hidden sm:inline">Date vereinbaren</span>
                </button>
              </div>
            </div>
        </div>
      </div>

      {/* Profile Header - Mobile (two rows) */}
          <div className="lg:hidden" style={{ marginBottom: '1.5rem' }}>
            {/* First Row: Back Button + Username (left) + Action Icons (right) */}
            <div style={{
              background: 'var(--background-primary)',
              marginBottom: '0.5rem',
              paddingLeft: 'var(--header-footer-padding-x)',
              paddingRight: 'var(--header-footer-padding-x)',
              borderBottom: '1px solid var(--border)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}>
              <div className="flex items-center justify-between py-3 gap-3">
                {/* Back Button + Username - Left */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    onClick={handleBackClick}
                    className="flex items-center transition-colors cursor-pointer flex-shrink-0"
                    style={{ color: 'var(--text-heading)' }}
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>

                  <div className="flex items-center gap-2 min-w-0">
                    <h1
                      className="text-lg font-bold truncate"
                      style={{ color: 'var(--text-heading)' }}
                    >
                      {escort?.username || 'Unbekannt'}
                    </h1>
                    {/* Verified Badge - only show if verified */}
                    {escort?.isVerified && (
                      <div className="flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--color-secondary)' }}>
                        <Check className="w-3 h-3" style={{ color: 'var(--color-link-secondary)', strokeWidth: 3 }} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Icons - Right */}
                <div className="flex items-center gap-6 flex-shrink-0">
                  {/* Bookmark */}
                  <button
                    onClick={handleBookmarkClick}
                    disabled={bookmarkLoading}
                    className="flex items-center transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ color: 'var(--text-heading)' }}
                  >
                    <Bookmark
                      className="w-6 h-6"
                      fill={isBookmarked ? 'currentColor' : 'none'}
                    />
                  </button>

                  {/* Date */}
                  <button
                    onClick={handleDateClick}
                    className="flex items-center transition-colors cursor-pointer"
                    style={{ color: 'var(--text-heading)' }}
                  >
                    <Calendar className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>

      {/* Main Profile Layout: Gallery + Tabs (2/3) + Info (1/3) */}
      <div className="mx-auto px-4 sm:px-6 lg:px-0 flex flex-col lg:grid lg:grid-cols-3 gap-6 mb-6 lg:pt-8" style={{
        maxWidth: 'var(--max-content-width)',
        width: '100%'
      }}>
          {/* Left Column: Gallery + Tabs + Share/Report */}
          <div className="lg:col-span-2 flex flex-col gap-6 order-1 lg:order-1">
            {/* Photo Gallery */}
            <div>
            <div className="overflow-hidden lg:rounded-lg lg:!mx-0" style={{
              background: 'var(--background-primary)',
              marginLeft: 'calc(-1 * var(--content-padding-left))',
              marginRight: '0'
            }}>
              {/* Media Tabs */}
              <div className="flex">
                <button
                  onClick={() => setMediaTab('fotos')}
                  className="flex-1 px-4 pb-3 text-sm font-medium transition-colors flex flex-col items-center justify-start cursor-pointer"
                  style={{ paddingTop: 0 }}
                >
                  <div className="flex flex-col items-center">
                    <span
                      className="relative inline-block"
                      style={{
                        color: mediaTab === 'fotos' ? 'var(--color-link-secondary)' : 'var(--text-secondary)',
                        lineHeight: '1'
                      }}
                    >
                      Fotos
                    </span>
                    {mediaTab === 'fotos' && (
                      <div
                        className="mt-3"
                        style={{
                          width: '100%',
                          height: '4px',
                          backgroundColor: 'var(--color-primary)',
                          borderRadius: '9999px'
                        }}
                      />
                    )}
                  </div>
                </button>
                <button
                  onClick={() => setMediaTab('videos')}
                  className="flex-1 px-4 pb-3 text-sm font-medium transition-colors flex flex-col items-center justify-start cursor-pointer"
                  style={{ paddingTop: 0 }}
                >
                  <div className="flex flex-col items-center">
                    <span
                      className="relative inline-block"
                      style={{
                        color: mediaTab === 'videos' ? 'var(--color-link-secondary)' : 'var(--text-secondary)',
                        lineHeight: '1'
                      }}
                    >
                      Videos
                    </span>
                    {mediaTab === 'videos' && (
                      <div
                        className="mt-3"
                        style={{
                          width: '100%',
                          height: '4px',
                          backgroundColor: 'var(--color-primary)',
                          borderRadius: '9999px'
                        }}
                      />
                    )}
                  </div>
                </button>
              </div>

              {/* Gallery Content */}
              <div>
                {/* Main Image - fixed height on desktop, no cropping */}
                <div
                  className="relative w-full flex items-center justify-center overflow-hidden"
                  style={{
                    height: '600px',
                    background: 'var(--background-secondary)'
                  }}
                >
                {/* Premium Badge - Top Right */}
                <div
                  className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-2 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, var(--color-primary), #b845ed)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <Gem className="w-4 h-4" style={{ color: '#ffffff', fill: 'none', strokeWidth: 2 }} />
                  <span className="text-xs font-semibold text-white hidden sm:inline">Premium</span>
                </div>

                {photos.length > 0 ? (
                  <>
                    {/* Determine if current media is restricted */}
                    {(() => {
                      const currentPhoto = photos[selectedImageIndex];
                      const isRestricted = !user && currentPhoto.isFsk18;
                      const currentUrl = currentPhoto.url;

                      return (
                        <>
                          {/* Background: Blurred version of current image (only show on desktop OR on mobile for landscape images, and not for videos) */}
                          {!isVideoUrl(currentUrl) && (!isCurrentImagePortrait || !isMobile) && (
                            <div
                              className="absolute inset-0"
                              style={{
                                backgroundImage: `url(${currentUrl})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                filter: 'blur(60px)',
                                transform: 'scale(1.15)',
                                opacity: 0.7
                              }}
                            />
                          )}

                          {/* Foreground: Sharp image or video */}
                          {isVideoUrl(currentUrl) ? (
                            <div className="relative w-full h-full z-10">
                              <video
                                src={currentUrl}
                                className="w-full h-full cursor-pointer"
                                style={{
                                  objectFit: 'contain',
                                  filter: isRestricted ? 'blur(20px)' : 'none',
                                }}
                                controls={!isRestricted}
                                onClick={() => !isRestricted && setIsFullscreen(true)}
                              />
                              {isRestricted && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                  <div className="bg-black/80 backdrop-blur-sm rounded-lg p-6 max-w-sm mx-4 text-center">
                                    <svg className="w-12 h-12 mx-auto mb-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                      FSK18 Inhalt
                                    </h3>
                                    <p className="text-sm text-gray-300 mb-4">
                                      Dieser Inhalt ist nur für eingeloggte Benutzer sichtbar.
                                    </p>
                                    <button
                                      onClick={() => setLoginModalOpen(true)}
                                      className="btn-base btn-primary w-full cursor-pointer"
                                    >
                                      Jetzt anmelden
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="relative w-full h-full z-10">
                              <img
                                src={currentUrl}
                                alt={`Foto ${selectedImageIndex + 1}`}
                                className="w-full h-full cursor-pointer"
                                style={{
                                  objectFit: isCurrentImagePortrait && isMobile ? 'cover' : 'contain',
                                  filter: isRestricted ? 'blur(20px)' : 'none',
                                }}
                                onLoad={(e) => {
                                  const img = e.currentTarget;
                                  setIsCurrentImagePortrait(img.naturalHeight > img.naturalWidth);
                                }}
                                onClick={() => !isRestricted && setIsFullscreen(true)}
                              />
                              {isRestricted && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-default">
                                  <div className="bg-black/80 backdrop-blur-sm rounded-lg p-6 max-w-sm mx-4 text-center">
                                    <svg className="w-12 h-12 mx-auto mb-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                      FSK18 Inhalt
                                    </h3>
                                    <p className="text-sm text-gray-300 mb-4">
                                      Dieser Inhalt ist nur für eingeloggte Benutzer sichtbar.
                                    </p>
                                    <button
                                      onClick={() => setLoginModalOpen(true)}
                                      className="btn-base btn-primary w-full cursor-pointer"
                                    >
                                      Jetzt anmelden
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      );
                    })()}
                    
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
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-6 px-6">
                    {mediaTab === 'videos' ? (
                      <>
                        <div
                          className="w-32 h-32 rounded-full flex items-center justify-center"
                          style={{
                            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                            border: '2px solid',
                            borderColor: 'var(--border)'
                          }}
                        >
                          <svg
                            className="w-16 h-16"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            style={{ color: 'var(--color-primary)', opacity: 0.6 }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div className="text-center space-y-4">
                          <div className="space-y-2">
                            <h3
                              className="text-xl font-semibold"
                              style={{ color: 'var(--text-heading)' }}
                            >
                              Noch keine Videos
                            </h3>
                            <p
                              className="text-sm max-w-xs"
                              style={{ color: 'var(--text-secondary)' }}
                            >
                              {escort.username} hat noch keine Videos hochgeladen. Schau später nochmal vorbei!
                            </p>
                          </div>
                          <button
                            onClick={() => setMediaTab('fotos')}
                            className="btn-base btn-primary cursor-pointer inline-flex items-center gap-2"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            Fotos ansehen
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-9xl font-bold" style={{ color: 'var(--text-heading)' }}>
                        {escort.firstName?.[0]?.toUpperCase() || escort.username?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Photo Counter and Fullscreen Button Container - Only show if photos exist */}
              {photos.length > 0 && (
                <div className="flex items-center justify-between px-4 py-2">
                  {/* Empty left space for alignment */}
                  <div className="w-5"></div>

                  {/* Center: Photo Counter */}
                  <div className="text-sm font-medium" style={{ color: 'var(--text-regular)' }}>
                    {selectedImageIndex + 1} / {photos.length}
                  </div>

                  {/* Right side: Fullscreen */}
                  <button
                    onClick={() => setIsFullscreen(true)}
                    className="flex items-center gap-2 text-sm font-medium transition-colors cursor-pointer"
                    style={{ color: 'var(--text-heading)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-heading-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-heading)')}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                    </svg>
                  </button>
                </div>
              )}

              {/* Thumbnail Gallery */}
              {photos.length > 1 && (
                <div className="flex justify-center gap-2 overflow-x-auto pb-2 px-4 lg:px-0">
                  {photos.map((photo, index) => {
                    const isRestricted = !user && photo.isFsk18;
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all cursor-pointer border-depth relative"
                        style={{
                          border: selectedImageIndex === index
                            ? '2px solid var(--color-primary)'
                            : '2px solid var(--border)',
                          opacity: selectedImageIndex === index ? 1 : 0.6
                        }}
                      >
                        {isVideoUrl(photo.url) ? (
                          <>
                            <video
                              src={photo.url}
                              className="w-full h-full object-cover"
                              style={{ filter: isRestricted ? 'blur(10px)' : 'none' }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 pointer-events-none">
                              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </>
                        ) : (
                          <img
                            src={photo.url}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                            style={{ filter: isRestricted ? 'blur(10px)' : 'none' }}
                          />
                        )}
                        {isRestricted && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
              </div>
            </div>
            </div>

            {/* Profile Tabs Section */}
            <div ref={tabsContainerRef} className="px-4 sm:px-6 lg:px-0">
              <ProfileTabs escort={escort} initialTab={activeTab} onTabChange={setActiveTab} />
            </div>

            {/* Share & Report - Below content */}
            <div className="mt-8 pt-6 border-t border-default px-4 sm:px-6 lg:px-0">
              <div className="flex items-center justify-center gap-8">
                {/* Share */}
                <button
                  onClick={handleShareClick}
                  className="flex flex-col items-center gap-2 text-sm font-medium transition-colors cursor-pointer"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/>
                  </svg>
                  <span>Teilen</span>
                </button>

                {/* Report */}
                <button
                  onClick={() => setReportModalOpen(true)}
                  className="flex flex-col items-center gap-2 text-sm font-medium transition-colors cursor-pointer"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  <Flag className="w-6 h-6" />
                  <span>Melden</span>
                </button>
              </div>
            </div>
          </div>

          {/* Profile Info - 1/3 width - Sticky */}
          <div className="lg:col-span-1 px-4 sm:px-6 lg:px-0 order-2 lg:order-2">
            <div className="lg:sticky lg:top-20" style={{
              alignSelf: 'start'
            }}>
            <div className="rounded-lg p-6 border-depth space-y-6" style={{ background: 'var(--background-primary)' }}>
              {/* Rating - Centered */}
              <div className="flex flex-col items-center gap-2 py-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    <svg width="0" height="0" style={{ position: 'absolute' }}>
                      <defs>
                        {[...Array(5)].map((_, i) => {
                          const fillPercentage = Math.min(Math.max((averageRating - i) * 100, 0), 100);
                          return (
                            <linearGradient key={i} id={`star-gradient-${i}`}>
                              <stop offset={`${fillPercentage}%`} stopColor="var(--color-primary)" />
                              <stop offset={`${fillPercentage}%`} stopColor="var(--border)" />
                            </linearGradient>
                          );
                        })}
                      </defs>
                    </svg>
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-5 h-5"
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
                  <span className="text-xl font-bold" style={{ color: 'var(--text-heading)' }}>
                    {averageRating.toFixed(1)}
                  </span>
                </div>
                <button
                  onClick={handleReviewsClick}
                  className="text-sm cursor-pointer hover:underline"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {reviewCount} Bewertungen
                </button>
              </div>

              {/* Name - Show only if showNameInProfile is true and name exists */}
              {escort.showNameInProfile && escort.firstName && escort.lastName && (
                <div className="text-center pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                  <p className="text-lg font-semibold" style={{ color: 'var(--text-heading)' }}>
                    {escort.firstName} {escort.lastName}
                  </p>
                </div>
              )}

              <div>
                {/* Location and Distance */}
                <div className="space-y-1 mb-4 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                  {locationText && (
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {locationText}
                      </span>
                    </div>
                  )}
                  {distanceKm !== null && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {distanceKm} km von dir entfernt
                      </span>
                    </div>
                  )}

                  {/* Online Status */}
                  <div className="flex items-center gap-2">
                    {(() => {
                      // Get real-time status from store or fallback to escort data
                      const liveStatus = getUserStatus(escort.id);
                      const isOnline = liveStatus.lastSeen ? liveStatus.isOnline : (escort.isOnline || false);
                      const lastSeen = liveStatus.lastSeen || (escort.lastSeen ? new Date(escort.lastSeen) : null);

                      if (isOnline) {
                        return (
                          <>
                            <Circle className="w-4 h-4" style={{ color: 'var(--text-secondary)', fill: 'var(--text-secondary)' }} />
                            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                              Jetzt online
                            </span>
                          </>
                        );
                      } else {
                        return (
                          <>
                            <Clock className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                              {lastSeen ? (
                                (() => {
                                  try {
                                    const timeAgo = formatDistanceToNow(lastSeen, {
                                      addSuffix: true,
                                      locale: de
                                    });
                                    return `Zuletzt online ${timeAgo}`;
                                  } catch (error) {
                                    console.error('Error formatting lastSeen:', error, lastSeen);
                                    return 'Offline';
                                  }
                                })()
                              ) : (
                                'Offline'
                              )}
                            </span>
                          </>
                        );
                      }
                    })()}
                  </div>
                </div>

                {/* Attributes */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Alter:</span>
                    <span className="text-sm" style={{ color: 'var(--text-regular)' }}>
                      {age ? `${age} Jahre` : 'Keine Angabe'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Geschlecht:</span>
                    <span className="text-sm" style={{ color: 'var(--text-regular)' }}>
                      {escort.gender || 'Keine Angabe'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Nationalität:</span>
                    <span className="text-sm" style={{ color: 'var(--text-regular)' }}>
                      {escort.nationalities && escort.nationalities.length > 0 ? escort.nationalities.join(', ') : 'Keine Angabe'}
                    </span>
                  </div>

                  {/* Körper - only show "Keine Angabe" if ALL sub-attributes are empty */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Körper:</span>
                    <span className="text-sm" style={{ color: 'var(--text-regular)' }}>
                      {(escort.height || escort.weight || escort.bodyType)
                        ? [
                            escort.height ? `${escort.height} cm` : null,
                            escort.weight ? `${escort.weight} kg` : null,
                            escort.bodyType
                          ].filter(Boolean).join(', ')
                        : 'Keine Angabe'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Oberweite:</span>
                    <span className="text-sm" style={{ color: 'var(--text-regular)' }}>
                      {escort.cupSize ? `${escort.cupSize} Körbchen` : 'Keine Angabe'}
                    </span>
                  </div>

                  {/* Haare - only show "Keine Angabe" if ALL sub-attributes are empty */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Haare:</span>
                    <span className="text-sm" style={{ color: 'var(--text-regular)' }}>
                      {(escort.hairLength || escort.hairColor)
                        ? [escort.hairLength, escort.hairColor].filter(Boolean).join(', ')
                        : 'Keine Angabe'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Augenfarbe:</span>
                    <span className="text-sm" style={{ color: 'var(--text-regular)' }}>
                      {escort.eyeColor || 'Keine Angabe'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Sprachen:</span>
                    <span className="text-sm" style={{ color: 'var(--text-regular)' }}>
                      {escort.languages && escort.languages.length > 0 ? escort.languages.join(', ') : 'Keine Angabe'}
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
                  className="w-full btn-base btn-primary cursor-pointer flex items-center justify-center"
                >
                  Nachricht schreiben
                </button>

                {/* Phone Number Link */}
                <button
                  onClick={() => setShowPhoneModal(true)}
                  className="flex items-center justify-center gap-2 w-full py-3 transition-colors cursor-pointer"
                  style={{ color: 'var(--text-heading)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-heading-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-heading)')}
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-sm font-medium">Telefonnummer anzeigen</span>
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
            </div>
          </div>

          {/* Similar Escorts Section */}
          {similarEscorts.length > 0 && (
            <div className="lg:col-span-3 mt-8 px-4 sm:px-6 lg:px-0 order-3 lg:order-3">
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

            {/* Image or Video */}
            <div className="relative w-full h-full flex items-center justify-center mx-4">
              {(() => {
                const currentPhoto = photos[selectedImageIndex];
                const isRestricted = !user && currentPhoto.isFsk18;
                const currentUrl = currentPhoto.url;

                return (
                  <>
                    {isVideoUrl(currentUrl) ? (
                      <div className="relative">
                        <video
                          src={currentUrl}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            width: 'auto',
                            height: 'auto',
                            objectFit: 'contain',
                            filter: isRestricted ? 'blur(30px)' : 'none',
                          }}
                          controls={!isRestricted}
                          onClick={(e) => e.stopPropagation()}
                        />
                        {isRestricted && (
                          <div className="absolute inset-0 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                            <div className="bg-black/80 backdrop-blur-sm rounded-lg p-8 max-w-md mx-4 text-center">
                              <svg className="w-16 h-16 mx-auto mb-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              <h3 className="text-xl font-bold text-white mb-3">
                                FSK18 Inhalt
                              </h3>
                              <p className="text-sm text-gray-300 mb-6">
                                Dieser Inhalt ist nur für eingeloggte Benutzer sichtbar.
                              </p>
                              <button
                                onClick={() => {
                                  setIsFullscreen(false);
                                  setLoginModalOpen(true);
                                }}
                                className="btn-base btn-primary w-full cursor-pointer"
                              >
                                Jetzt anmelden
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={currentUrl}
                          alt={`Foto ${selectedImageIndex + 1}`}
                          style={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            width: 'auto',
                            height: 'auto',
                            objectFit: 'contain',
                            filter: isRestricted ? 'blur(30px)' : 'none',
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                        {isRestricted && (
                          <div className="absolute inset-0 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                            <div className="bg-black/80 backdrop-blur-sm rounded-lg p-8 max-w-md mx-4 text-center">
                              <svg className="w-16 h-16 mx-auto mb-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              <h3 className="text-xl font-bold text-white mb-3">
                                FSK18 Inhalt
                              </h3>
                              <p className="text-sm text-gray-300 mb-6">
                                Dieser Inhalt ist nur für eingeloggte Benutzer sichtbar.
                              </p>
                              <button
                                onClick={() => {
                                  setIsFullscreen(false);
                                  setLoginModalOpen(true);
                                }}
                                className="btn-base btn-primary w-full cursor-pointer"
                              >
                                Jetzt anmelden
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                );
              })()}

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

        {/* Login Modal */}
        <LoginModal
          isOpen={loginModalOpen}
          onClose={closeModals}
          onSwitchToRegister={openRegisterModal}
          onSwitchToForgotPassword={openForgotPasswordModal}
        />

        {/* Register Modal */}
        <RegisterModal
          isOpen={registerModalOpen}
          onClose={closeModals}
          onSwitchToLogin={openLoginModal}
        />

        {/* Forgot Password Modal */}
        <ForgotPasswordModal
          isOpen={forgotPasswordModalOpen}
          onClose={closeModals}
          onBackToLogin={handleBackToLoginFromForgotPassword}
        />

        {/* Report Modal */}
        {escort && (
          <ReportModal
            isOpen={reportModalOpen}
            onClose={() => setReportModalOpen(false)}
            reportedUserId={escort.id}
            reportedUsername={escort.username}
          />
        )}
    </div>
  );
}