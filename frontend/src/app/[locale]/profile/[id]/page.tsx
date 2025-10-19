'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { escortService } from '@/services/escortService';
import { profilePictureService } from '@/services/profilePictureService';
import { galleryService, GalleryPhoto } from '@/services/galleryService';
import { User } from '@/types/auth.types';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [escort, setEscort] = useState<User | null>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
      <main className="min-h-screen p-8" style={{ background: 'var(--background-primary)' }}>
        <div className="mx-auto" style={{ maxWidth: 'var(--max-content-width)' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Lädt...</p>
        </div>
      </main>
    );
  }

  if (error || !escort) {
    return (
      <main className="min-h-screen p-8" style={{ background: 'var(--background-primary)' }}>
        <div className="mx-auto" style={{ maxWidth: 'var(--max-content-width)' }}>
          <div className="p-4 rounded-lg mb-4 border-depth" style={{ background: 'var(--background-secondary)', borderColor: 'var(--color-primary)' }}>
            <p style={{ color: 'var(--color-primary)' }}>{error || 'Profile not found'}</p>
          </div>
          <button onClick={() => router.push('/members')} className="btn-base btn-primary">
            Zurück zur Übersicht
          </button>
        </div>
      </main>
    );
  }

  const age = calculateAge(escort.birthDate);

  return (
    <main className="min-h-screen p-8" style={{ background: 'var(--background-primary)' }}>
      <div className="mx-auto" style={{ maxWidth: 'var(--max-content-width)' }}>
        {/* Back Button */}
        <button onClick={() => router.push('/members')} className="mb-6 btn-base btn-secondary">
          ← Zurück
        </button>

        {/* Main Profile Layout: Gallery (2/3) + Info (1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Photo Gallery - 2/3 width */}
          <div className="lg:col-span-2">
            <div className="rounded-lg overflow-hidden border-depth" style={{ background: 'var(--background-secondary)' }}>
              {/* Main Image - flexible height, no cropping */}
              <div 
                className="relative w-full flex items-center justify-center" 
                style={{
                  minHeight: '500px',
                  maxHeight: '700px',
                  background: 'var(--color-primary)'
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
                          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
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
                          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
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
                      className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden transition-all"
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
            <div className="rounded-lg p-6 border-depth space-y-6" style={{ background: 'var(--background-secondary)' }}>
              {/* Name & Username */}
              <div>
                <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-heading)' }}>
                  {escort.firstName && escort.lastName
                    ? `${escort.firstName} ${escort.lastName}`
                    : escort.username || 'Unbekannt'}
                </h1>
                <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                  @{escort.username}
                </p>
              </div>

              {/* Basic Info */}
              <div className="space-y-3 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
                {age && (
                  <div className="flex items-center gap-2">
                    <span style={{ color: 'var(--text-secondary)' }}>🎂</span>
                    <span style={{ color: 'var(--text-regular)' }}>{age} Jahre</span>
                  </div>
                )}

                {escort.nationalities && escort.nationalities.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span style={{ color: 'var(--text-secondary)' }}>🌍</span>
                    <span style={{ color: 'var(--text-regular)' }}>{escort.nationalities.join(', ')}</span>
                  </div>
                )}

                {escort.languages && escort.languages.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span style={{ color: 'var(--text-secondary)' }}>💬</span>
                    <span style={{ color: 'var(--text-regular)' }}>{escort.languages.join(', ')}</span>
                  </div>
                )}

                {escort.height && (
                  <div className="flex items-center gap-2">
                    <span style={{ color: 'var(--text-secondary)' }}>📏</span>
                    <span style={{ color: 'var(--text-regular)' }}>{escort.height} cm</span>
                  </div>
                )}

                {escort.bodyType && (
                  <div className="flex items-center gap-2">
                    <span style={{ color: 'var(--text-secondary)' }}>💃</span>
                    <span style={{ color: 'var(--text-regular)' }}>{escort.bodyType}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleMessageClick}
                  className="w-full btn-base btn-primary"
                >
                  💬 Nachricht schreiben
                </button>
                <button
                  onClick={handleDateClick}
                  className="w-full btn-base btn-secondary"
                >
                  📅 Date vereinbaren
                </button>
              </div>

              {/* Tags */}
              {(escort.hasTattoos || escort.hasPiercings || escort.isSmoker) && (
                <div className="flex flex-wrap gap-2 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                  {escort.hasTattoos && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ 
                        background: 'rgba(139, 92, 246, 0.1)',
                        color: 'var(--color-primary)'
                      }}>
                      🎨 Tattoos
                    </span>
                  )}
                  {escort.hasPiercings && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ 
                        background: 'rgba(139, 92, 246, 0.1)',
                        color: 'var(--color-primary)'
                      }}>
                      💎 Piercings
                    </span>
                  )}
                  {escort.isSmoker && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ 
                        background: 'rgba(113, 118, 123, 0.1)',
                        color: 'var(--text-secondary)'
                      }}>
                      🚬 Raucher/in
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Service Information Section - Full Width */}
        <div className="rounded-lg p-8 border-depth" style={{ background: 'var(--background-secondary)' }}>
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
              className="absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all hover:scale-110"
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
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-all hover:scale-110"
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
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-all hover:scale-110"
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