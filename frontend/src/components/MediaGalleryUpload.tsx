'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Film, Loader2, Trash2 } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // Load existing photos
  useEffect(() => {
    loadGallery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      await galleryService.uploadPhotos(selectedFiles);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Clear selection
      setSelectedFiles([]);
      setPreviewUrls([]);

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

                return (
                  <div
                    key={index}
                    className="relative aspect-square rounded-lg overflow-hidden bg-page-secondary border border-default group"
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

                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black bg-opacity-70 hover:bg-opacity-90 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
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
                <Upload className="w-5 h-5" />
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
            {photos.map((photo) => {
              const url = photo.photoUrl.toLowerCase();
              const isVideo = /\.(mp4|mov|avi|webm|mkv|flv)(\?.*)?$/.test(url);

              return (
                <div
                  key={photo.id}
                  className="relative aspect-square rounded-lg overflow-hidden bg-page-secondary border border-default group"
                >
                  {isVideo ? (
                    <video
                      src={galleryService.getPhotoUrl(photo.photoUrl)}
                      className="w-full h-full object-cover"
                      controls
                    />
                  ) : (
                    <img
                      src={galleryService.getPhotoUrl(photo.photoUrl)}
                      alt="Gallery photo"
                      className="w-full h-full object-cover"
                    />
                  )}

                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-error hover:bg-error-hover flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                    title={isVideo ? "Video löschen" : "Foto löschen"}
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
