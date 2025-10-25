'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Film, Loader2, Trash2, Plus } from 'lucide-react';
import { galleryService, GalleryPhoto } from '@/services/galleryService';

interface MediaGalleryUploadProps {
  onUploadComplete?: () => void;
  mediaType?: 'image' | 'video';
}

export default function MediaGalleryUpload({ onUploadComplete, mediaType }: MediaGalleryUploadProps) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingGallery, setIsLoadingGallery] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [previewFsk18Flags, setPreviewFsk18Flags] = useState<boolean[]>([]);
  const [previewViewerOpen, setPreviewViewerOpen] = useState(false);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // Load existing photos
  useEffect(() => {
    loadGallery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard navigation and body scroll prevention
  useEffect(() => {
    if (!viewerOpen) return;

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      // If delete confirmation is open, only handle ESC
      if (showDeleteConfirm) {
        if (e.key === 'Escape') {
          handleCancelDelete();
        }
        return;
      }

      // Normal viewer keyboard navigation
      if (e.key === 'Escape') {
        handleCloseViewer();
      } else if (e.key === 'ArrowLeft') {
        handlePrevPhoto();
      } else if (e.key === 'ArrowRight') {
        handleNextPhoto();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [viewerOpen, photos.length, showDeleteConfirm]);

  // Preview viewer keyboard navigation and body scroll prevention
  useEffect(() => {
    if (!previewViewerOpen) return;

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      // Preview viewer keyboard navigation
      if (e.key === 'Escape') {
        handleClosePreviewViewer();
      } else if (e.key === 'ArrowLeft') {
        handlePrevPreview();
      } else if (e.key === 'ArrowRight') {
        handleNextPreview();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [previewViewerOpen, previewUrls.length]);

  const loadGallery = async () => {
    try {
      setIsLoadingGallery(true);
      const galleryPhotos = await galleryService.getMyPhotos();

      // Filter photos based on mediaType
      const filteredPhotos = mediaType
        ? galleryPhotos.filter(photo => {
            // Check if the photo URL ends with common image or video extensions
            const url = photo.photoUrl.toLowerCase();
            const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/.test(url);
            const isVideo = /\.(mp4|mov|avi|webm|mkv|flv)(\?.*)?$/.test(url);

            if (mediaType === 'image') return isImage;
            if (mediaType === 'video') return isVideo;
            return true;
          })
        : galleryPhotos;

      setPhotos(filteredPhotos);
    } catch (err) {
      console.error('Error loading gallery:', err);
    } finally {
      setIsLoadingGallery(false);
    }
  };

  const addFiles = useCallback((files: File[]) => {
    // Filter for images and videos based on mediaType
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (mediaType === 'image') {
        return isImage;
      } else if (mediaType === 'video') {
        return isVideo;
      }

      // If no mediaType specified, allow both
      return isImage || isVideo;
    });

    if (validFiles.length !== files.length) {
      const errorMessage = mediaType === 'image'
        ? 'Einige Dateien wurden übersprungen. Nur Bilder sind erlaubt.'
        : mediaType === 'video'
        ? 'Einige Dateien wurden übersprungen. Nur Videos sind erlaubt.'
        : 'Einige Dateien wurden übersprungen. Nur Bilder und Videos sind erlaubt.';
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    }

    setSelectedFiles(prev => {
      // Limit to 10 files at a time
      if (prev.length + validFiles.length > 10) {
        setError('Du kannst maximal 10 Dateien gleichzeitig hochladen.');
        setTimeout(() => setError(null), 5000);
        return prev;
      }
      return [...prev, ...validFiles];
    });

    // Initialize FSK18 flags for new files (default: false)
    setPreviewFsk18Flags(prev => [...prev, ...validFiles.map(() => false)]);

    // Create preview URLs
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }, [mediaType]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setPreviewFsk18Flags(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  }, [addFiles]);

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Simulate progress (since we don't have real progress tracking)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 200);

      await galleryService.uploadPhotos(selectedFiles, previewFsk18Flags);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Clear selection
      setSelectedFiles([]);
      setPreviewUrls([]);
      setPreviewFsk18Flags([]);

      // Reload gallery
      await loadGallery();

      if (onUploadComplete) {
        onUploadComplete();
      }

      // Reset progress after a short delay
      setTimeout(() => setUploadProgress(0), 1000);
    } catch (err) {
      setError('Fehler beim Hochladen der Dateien. Bitte versuche es erneut.');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await galleryService.deletePhoto(photoId);
      await loadGallery();
    } catch (err) {
      setError('Fehler beim Löschen des Fotos.');
      console.error('Delete error:', err);
    }
  };

  const handleToggleFsk18 = async (photoId: string, isFsk18: boolean) => {
    try {
      await galleryService.updatePhotoFlags(photoId, isFsk18);
      await loadGallery();
    } catch (err) {
      setError('Fehler beim Aktualisieren der FSK18-Markierung.');
      console.error('Toggle FSK18 error:', err);
    }
  };

  const handleOpenViewer = (index: number) => {
    setSelectedPhotoIndex(index);
    setViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setViewerOpen(false);
  };

  const handlePrevPhoto = () => {
    setSelectedPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNextPhoto = () => {
    setSelectedPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const handleRequestDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleConfirmDelete = async () => {
    const currentPhoto = photos[selectedPhotoIndex];
    if (!currentPhoto) return;

    setShowDeleteConfirm(false);

    try {
      await galleryService.deletePhoto(currentPhoto.id);

      // Close viewer if this was the last photo
      if (photos.length === 1) {
        setViewerOpen(false);
      } else {
        // Adjust selected index if needed
        if (selectedPhotoIndex >= photos.length - 1) {
          setSelectedPhotoIndex(Math.max(0, photos.length - 2));
        }
      }

      await loadGallery();
    } catch (err) {
      setError('Fehler beim Löschen des Fotos.');
      console.error('Delete error:', err);
    }
  };

  const handleToggleCurrentFsk18 = async () => {
    const currentPhoto = photos[selectedPhotoIndex];
    if (!currentPhoto) return;
    await handleToggleFsk18(currentPhoto.id, !currentPhoto.isFsk18);
  };

  // Preview Viewer Handlers
  const handleOpenPreviewViewer = (index: number) => {
    setSelectedPreviewIndex(index);
    setPreviewViewerOpen(true);
  };

  const handleClosePreviewViewer = () => {
    setPreviewViewerOpen(false);
  };

  const handlePrevPreview = () => {
    setSelectedPreviewIndex((prev) => (prev === 0 ? previewUrls.length - 1 : prev - 1));
  };

  const handleNextPreview = () => {
    setSelectedPreviewIndex((prev) => (prev === previewUrls.length - 1 ? 0 : prev + 1));
  };

  const handleTogglePreviewFsk18 = () => {
    setPreviewFsk18Flags(prev => {
      const newFlags = [...prev];
      newFlags[selectedPreviewIndex] = !newFlags[selectedPreviewIndex];
      return newFlags;
    });
  };

  const handleRemoveCurrentPreview = () => {
    removeFile(selectedPreviewIndex);
    // Close viewer if this was the last file
    if (previewUrls.length === 1) {
      setPreviewViewerOpen(false);
    } else {
      // Adjust selected index if needed
      if (selectedPreviewIndex >= previewUrls.length - 1) {
        setSelectedPreviewIndex(Math.max(0, previewUrls.length - 2));
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-2xl transition-all duration-200 ${
          isDragging
            ? 'border-action-primary bg-action-primary bg-opacity-5 scale-[1.02]'
            : 'border-default hover:border-action-primary'
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={mediaType === 'image' ? 'image/*' : mediaType === 'video' ? 'video/*' : 'image/*,video/*'}
          onChange={handleFileSelect}
          className="hidden"
        />

        {selectedFiles.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-page-secondary flex items-center justify-center">
                <Upload className="w-10 h-10 text-action-primary" />
              </div>
            </div>

            <h3 className="text-xl font-semibold text-heading mb-2">
              {mediaType === 'image' ? 'Fotos hochladen' : mediaType === 'video' ? 'Videos hochladen' : 'Fotos & Videos hochladen'}
            </h3>
            <p className="text-muted mb-6 max-w-md mx-auto">
              Ziehe Dateien hierher oder klicke auf den Button unten. Du kannst bis zu 10 Dateien gleichzeitig hochladen.
            </p>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-base btn-primary cursor-pointer inline-flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Dateien auswählen
            </button>

            <p className="text-xs text-muted mt-4">
              {mediaType === 'image'
                ? 'Unterstützte Formate: JPG, PNG, GIF, WEBP'
                : mediaType === 'video'
                ? 'Unterstützte Formate: MP4, MOV, AVI, WEBM'
                : 'Unterstützte Formate: JPG, PNG, GIF, MP4, MOV'}
            </p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
              {previewUrls.map((url, index) => {
                const file = selectedFiles[index];
                const isVideo = file.type.startsWith('video/');
                const isFsk18 = previewFsk18Flags[index];

                return (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden bg-page-secondary border border-default group cursor-pointer"
                    onClick={() => handleOpenPreviewViewer(index)}
                  >
                    {isVideo ? (
                      <div className="w-full h-full flex items-center justify-center relative">
                        <video
                          src={url}
                          className="w-full h-full object-cover"
                          muted
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 pointer-events-none">
                          <Film className="w-12 h-12 text-white" />
                        </div>
                      </div>
                    ) : (
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}

                    {/* FSK18 Badge */}
                    {isFsk18 && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-red-500 text-white">
                          18+
                        </span>
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black bg-opacity-70 hover:bg-opacity-90 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-10"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs truncate">
                        {file.name}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 px-4 py-3 rounded-lg border border-default text-body hover-bg-page-secondary transition-all cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Weitere Dateien hinzufügen
              </button>

              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-1 btn-base btn-primary cursor-pointer inline-flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Lädt hoch... {uploadProgress}%
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    {selectedFiles.length} {selectedFiles.length === 1 ? 'Datei' : 'Dateien'} hochladen
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-error bg-opacity-10 border border-error">
          <p className="text-error text-sm">{error}</p>
        </div>
      )}

      {/* Existing Gallery */}
      <div>
        <h3 className="text-lg font-semibold text-heading mb-4">
          {mediaType === 'image' ? 'Deine Fotos' : mediaType === 'video' ? 'Deine Videos' : 'Deine Galerie'} ({photos.length})
        </h3>

        {isLoadingGallery ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-action-primary" />
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-default rounded-lg">
            {mediaType === 'video' ? (
              <Film className="w-16 h-16 text-muted mx-auto mb-4" />
            ) : (
              <ImageIcon className="w-16 h-16 text-muted mx-auto mb-4" />
            )}
            <p className="text-muted">
              {mediaType === 'image'
                ? 'Du hast noch keine Fotos hochgeladen'
                : mediaType === 'video'
                ? 'Du hast noch keine Videos hochgeladen'
                : 'Du hast noch keine Fotos hochgeladen'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {photos.map((photo, index) => {
              const url = photo.photoUrl.toLowerCase();
              const isVideo = /\.(mp4|mov|avi|webm|mkv|flv)(\?.*)?$/.test(url);

              return (
                <div
                  key={photo.id}
                  className="relative aspect-square rounded-lg overflow-hidden bg-page-secondary border border-default group cursor-pointer"
                  onClick={() => handleOpenViewer(index)}
                >
                  {/* Media */}
                  {isVideo ? (
                    <video
                      src={galleryService.getPhotoUrl(photo.photoUrl)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={galleryService.getPhotoUrl(photo.photoUrl)}
                      alt="Gallery photo"
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Status Badges - Top Left */}
                  {photo.isFsk18 && (
                    <div className="absolute top-2 left-2 z-10">
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-red-500 text-white">
                        18+
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Media Viewer Modal */}
      {viewerOpen && photos.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 mobile-menu-backdrop"
          onClick={handleCloseViewer}
        >
          {/* Close Button */}
          <button
            onClick={handleCloseViewer}
            className="absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all hover:scale-110 cursor-pointer z-50"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
            }}
          >
            ✕
          </button>

          {/* Main Content Area */}
          <div className="relative w-full h-full flex items-center justify-center px-4" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const currentPhoto = photos[selectedPhotoIndex];
              const url = currentPhoto.photoUrl.toLowerCase();
              const isVideo = /\.(mp4|mov|avi|webm|mkv|flv)(\?.*)?$/.test(url);
              const photoUrl = galleryService.getPhotoUrl(currentPhoto.photoUrl);

              return (
                <>
                  {/* Media Display */}
                  <div className="flex-1 flex items-center justify-center max-h-[calc(100vh-200px)]">
                    {isVideo ? (
                      <video
                        src={photoUrl}
                        className="max-w-full max-h-full"
                        controls
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <img
                        src={photoUrl}
                        alt={`Media ${selectedPhotoIndex + 1}`}
                        className="max-w-full max-h-full object-contain"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </div>

                  {/* Navigation Arrows */}
                  {photos.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePrevPhoto(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-all hover:scale-110 cursor-pointer"
                        style={{
                          background: 'rgba(0, 0, 0, 0.7)',
                          color: '#fff',
                          border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}
                      >
                        ‹
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleNextPhoto(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-all hover:scale-110 cursor-pointer"
                        style={{
                          background: 'rgba(0, 0, 0, 0.7)',
                          color: '#fff',
                          border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}
                      >
                        ›
                      </button>
                    </>
                  )}

                  {/* Delete Button - Top Left */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRequestDelete();
                    }}
                    className="absolute top-4 left-4 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 cursor-pointer z-50 group"
                    style={{
                      background: 'rgba(220, 38, 38, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                    title={isVideo ? "Video löschen" : "Foto löschen"}
                  >
                    <Trash2 className="w-5 h-5 text-white" />
                  </button>

                  {/* Counter - Above Control Panel */}
                  <div className="absolute bottom-24 left-0 right-0 text-center">
                    <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                      {selectedPhotoIndex + 1} / {photos.length}
                    </span>
                  </div>

                  {/* Bottom Control Panel */}
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-page-primary px-4 sm:px-6 py-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* FSK18 Toggle Switch */}
                    <div className="flex items-center justify-center gap-4">
                      <span className="text-text-primary font-medium text-sm">FSK18</span>
                      <button
                        onClick={handleToggleCurrentFsk18}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors cursor-pointer ${
                          currentPhoto.isFsk18 ? 'bg-red-500' : 'bg-gray-600'
                        }`}
                        role="switch"
                        aria-checked={currentPhoto.isFsk18}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                            currentPhoto.isFsk18 ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className={`text-sm font-medium ${currentPhoto.isFsk18 ? 'text-red-400' : 'text-text-secondary'}`}>
                        {currentPhoto.isFsk18 ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && photos.length > 0 && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={handleCancelDelete}
        >
          <div
            className="bg-page-primary border border-default rounded-xl p-6 max-w-md mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            {(() => {
              const currentPhoto = photos[selectedPhotoIndex];
              const url = currentPhoto.photoUrl.toLowerCase();
              const isVideo = /\.(mp4|mov|avi|webm|mkv|flv)(\?.*)?$/.test(url);

              return (
                <>
                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
                      <Trash2 className="w-8 h-8 text-error" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-text-primary text-center mb-2">
                    {isVideo ? 'Video löschen?' : 'Foto löschen?'}
                  </h3>

                  {/* Message */}
                  <p className="text-sm text-text-secondary text-center mb-6">
                    Möchtest du dieses {isVideo ? 'Video' : 'Foto'} wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                  </p>

                  {/* Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancelDelete}
                      className="flex-1 btn-base btn-secondary cursor-pointer"
                    >
                      Abbrechen
                    </button>
                    <button
                      onClick={handleConfirmDelete}
                      className="flex-1 btn-base bg-error hover:bg-error-hover text-white cursor-pointer"
                    >
                      Löschen
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Preview Viewer Modal */}
      {previewViewerOpen && previewUrls.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 mobile-menu-backdrop"
          onClick={handleClosePreviewViewer}
        >
          {/* Close Button */}
          <button
            onClick={handleClosePreviewViewer}
            className="absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all hover:scale-110 cursor-pointer z-50"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
            }}
          >
            ✕
          </button>

          {/* Main Content Area */}
          <div className="relative w-full h-full flex items-center justify-center px-4" onClick={(e) => e.stopPropagation()}>
            {(() => {
              const previewUrl = previewUrls[selectedPreviewIndex];
              const file = selectedFiles[selectedPreviewIndex];
              const isVideo = file.type.startsWith('video/');
              const isFsk18 = previewFsk18Flags[selectedPreviewIndex];

              return (
                <>
                  {/* Media Display */}
                  <div className="flex-1 flex items-center justify-center max-h-[calc(100vh-200px)]">
                    {isVideo ? (
                      <video
                        src={previewUrl}
                        className="max-w-full max-h-full"
                        controls
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <img
                        src={previewUrl}
                        alt={`Preview ${selectedPreviewIndex + 1}`}
                        className="max-w-full max-h-full object-contain"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </div>

                  {/* Navigation Arrows */}
                  {previewUrls.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePrevPreview(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-all hover:scale-110 cursor-pointer"
                        style={{
                          background: 'rgba(0, 0, 0, 0.7)',
                          color: '#fff',
                          border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}
                      >
                        ‹
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleNextPreview(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-all hover:scale-110 cursor-pointer"
                        style={{
                          background: 'rgba(0, 0, 0, 0.7)',
                          color: '#fff',
                          border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}
                      >
                        ›
                      </button>
                    </>
                  )}

                  {/* Delete Button - Top Left */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveCurrentPreview();
                    }}
                    className="absolute top-4 left-4 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 cursor-pointer z-50 group"
                    style={{
                      background: 'rgba(220, 38, 38, 0.7)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                    title={isVideo ? "Video entfernen" : "Foto entfernen"}
                  >
                    <Trash2 className="w-5 h-5 text-white" />
                  </button>

                  {/* Counter - Above Control Panel */}
                  <div className="absolute bottom-24 left-0 right-0 text-center">
                    <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                      {selectedPreviewIndex + 1} / {previewUrls.length}
                    </span>
                  </div>

                  {/* Bottom Control Panel */}
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-page-primary px-4 sm:px-6 py-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* FSK18 Toggle Switch */}
                    <div className="flex items-center justify-center gap-4">
                      <span className="text-text-primary font-medium text-sm">FSK18</span>
                      <button
                        onClick={handleTogglePreviewFsk18}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors cursor-pointer ${
                          isFsk18 ? 'bg-red-500' : 'bg-gray-600'
                        }`}
                        role="switch"
                        aria-checked={isFsk18}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                            isFsk18 ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className={`text-sm font-medium ${isFsk18 ? 'text-red-400' : 'text-text-secondary'}`}>
                        {isFsk18 ? 'Aktiv' : 'Inaktiv'}
                      </span>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
