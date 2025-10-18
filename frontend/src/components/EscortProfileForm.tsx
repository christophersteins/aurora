'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { escortProfileService } from '@/services/escortProfileService';
import { profilePictureService } from '@/services/profilePictureService';
import { galleryService, GalleryPhoto } from '@/services/galleryService';
import { UpdateEscortProfileDto } from '@/types/auth.types';
import MultiSelectDropdown from './MultiSelectDropdown';
import {
  NATIONALITIES,
  LANGUAGES,
  HEIGHTS,
  WEIGHTS,
  BODY_TYPES,
  CUP_SIZES,
  HAIR_COLORS,
  HAIR_LENGTHS,
  EYE_COLORS,
} from '@/constants/escortProfileOptions';

export default function EscortProfileForm() {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState<UpdateEscortProfileDto>({
    birthDate: formatDateForInput(user?.birthDate),
    nationalities: user?.nationalities || [],
    languages: user?.languages || [],
    height: user?.height || undefined,
    weight: user?.weight || undefined,
    bodyType: user?.bodyType || '',
    cupSize: user?.cupSize || '',
    hairColor: user?.hairColor || '',
    hairLength: user?.hairLength || '',
    eyeColor: user?.eyeColor || '',
    hasTattoos: user?.hasTattoos || false,
    hasPiercings: user?.hasPiercings || false,
    isSmoker: user?.isSmoker || false,
    description: user?.description || '',
  });

  const [age, setAge] = useState<number | null>(null);

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(
    user?.profilePicture ? profilePictureService.getProfilePictureUrl(user.profilePicture) : null
  );
  const [uploadingPicture, setUploadingPicture] = useState(false);

  // Gallery Photos State
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [selectedGalleryFiles, setSelectedGalleryFiles] = useState<File[]>([]);
  const [galleryPreviewUrls, setGalleryPreviewUrls] = useState<string[]>([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [loadingGallery, setLoadingGallery] = useState(true);

  useEffect(() => {
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      setAge(calculatedAge);
    } else {
      setAge(null);
    }
  }, [formData.birthDate]);

  // Load Gallery Photos
  useEffect(() => {
    if (user?.role === 'escort') {
      loadGalleryPhotos();
    }
  }, [user]);

  const loadGalleryPhotos = async () => {
    try {
      setLoadingGallery(true);
      const photos = await galleryService.getMyPhotos();
      setGalleryPhotos(photos);
    } catch (err) {
      console.error('Error loading gallery photos:', err);
    } finally {
      setLoadingGallery(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const updatedUser = await escortProfileService.updateProfile(formData);
      setUser(updatedUser);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Fehler beim Speichern des Profils';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadProfilePicture = async () => {
    if (!profilePicture) return;

    setUploadingPicture(true);
    setError(null);

    try {
      const result = await profilePictureService.uploadProfilePicture(profilePicture);
      const fullUrl = profilePictureService.getProfilePictureUrl(result.profilePicture);
      
      if (user) {
        setUser({ ...user, profilePicture: result.profilePicture });
      }
      
      setProfilePicturePreview(fullUrl);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Fehler beim Hochladen des Profilbilds';
      setError(errorMessage);
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleGalleryFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setSelectedGalleryFiles(files);

    // Generate preview URLs
    const previewUrls: string[] = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previewUrls.push(reader.result as string);
        if (previewUrls.length === files.length) {
          setGalleryPreviewUrls(previewUrls);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleUploadGalleryPhotos = async () => {
    if (selectedGalleryFiles.length === 0) return;

    setUploadingGallery(true);
    setError(null);

    try {
      await galleryService.uploadPhotos(selectedGalleryFiles);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Reset selection
      setSelectedGalleryFiles([]);
      setGalleryPreviewUrls([]);
      
      // Reload gallery
      await loadGalleryPhotos();
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Fehler beim Hochladen der Fotos';
      setError(errorMessage);
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleDeleteGalleryPhoto = async (photoId: string) => {
    if (!confirm('Möchtest du dieses Foto wirklich löschen?')) return;

    try {
      await galleryService.deletePhoto(photoId);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      await loadGalleryPhotos();
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Fehler beim Löschen des Fotos';
      setError(errorMessage);
    }
  };

  if (user?.role !== 'escort') {
    return (
      <div className="p-6 rounded-lg border-depth" style={{ background: 'var(--background-secondary)' }}>
        <p style={{ color: 'var(--color-primary)' }}>
          Nur Benutzer mit der Rolle &quot;Escort&quot; können dieses Profil bearbeiten.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Picture Section */}
      <div className="p-8 rounded-lg border-depth" style={{ background: 'var(--background-secondary)' }}>
        <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-heading)' }}>
          Profilbild
        </h2>

        <div className="p-6 rounded-lg border-depth" style={{ background: 'var(--background-primary)' }}>
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-shrink-0">
              {profilePicturePreview ? (
                <img
                  src={profilePicturePreview}
                  alt="Profilbild Vorschau"
                  className="w-32 h-32 object-cover rounded-full"
                />
              ) : (
                <div 
                  className="w-32 h-32 rounded-full flex items-center justify-center"
                  style={{ 
                    background: 'linear-gradient(135deg, var(--gradient-cyan) 0%, var(--gradient-blue) 50%, var(--gradient-purple) 100%)'
                  }}
                >
                  <span className="text-white font-bold text-2xl">
                    {user?.firstName?.[0] || user?.username?.[0] || '?'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-1 w-full">
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="mb-3 block w-full text-sm"
                style={{ color: 'var(--text-regular)' }}
              />
              <button
                type="button"
                onClick={handleUploadProfilePicture}
                disabled={!profilePicture || uploadingPicture}
                className="btn-base btn-primary"
              >
                {uploadingPicture ? 'Lädt hoch...' : 'Profilbild hochladen'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Photos Section */}
      <div className="p-8 rounded-lg border-depth" style={{ background: 'var(--background-secondary)' }}>
        <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-heading)' }}>
          Foto-Galerie
        </h2>

        {/* Upload New Photos */}
        <div className="mb-8 p-6 rounded-lg border-depth" style={{ background: 'var(--background-primary)' }}>
          <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-heading)' }}>
            Neue Fotos hochladen
          </h3>
          
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleGalleryFilesChange}
            className="mb-4 block w-full text-sm"
            style={{ color: 'var(--text-regular)' }}
          />

          {/* Preview Selected Files */}
          {galleryPreviewUrls.length > 0 && (
            <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {galleryPreviewUrls.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-depth">
                  <img
                    src={url}
                    alt={`Vorschau ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={handleUploadGalleryPhotos}
            disabled={selectedGalleryFiles.length === 0 || uploadingGallery}
            className="btn-base btn-primary"
          >
            {uploadingGallery ? 'Lädt hoch...' : `${selectedGalleryFiles.length} Foto(s) hochladen`}
          </button>
        </div>

        {/* Existing Gallery Photos */}
        <div>
          <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-heading)' }}>
            Vorhandene Fotos ({galleryPhotos.length})
          </h3>

          {loadingGallery ? (
            <p style={{ color: 'var(--text-secondary)' }}>Lädt Galerie...</p>
          ) : galleryPhotos.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>
              Noch keine Fotos in der Galerie. Lade deine ersten Fotos hoch!
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {galleryPhotos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden border-depth">
                    <img
                      src={galleryService.getPhotoUrl(photo.photoUrl)}
                      alt={`Gallery ${photo.order + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteGalleryPhoto(photo.id)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: 'rgba(239, 68, 68, 0.9)',
                      color: 'white'
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="p-4 rounded-lg border-depth" style={{ 
          background: 'rgba(239, 68, 68, 0.1)', 
          borderColor: '#ef4444' 
        }}>
          <p style={{ color: '#ef4444' }}>{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-lg border-depth" style={{ 
          background: 'rgba(16, 185, 129, 0.1)', 
          borderColor: '#10b981' 
        }}>
          <p style={{ color: '#10b981' }}>Erfolgreich gespeichert!</p>
        </div>
      )}

      {/* Profile Form */}
      <div className="p-8 rounded-lg border-depth" style={{ background: 'var(--background-secondary)' }}>
        <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-heading)' }}>
          Profil-Informationen
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Birth Date */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-regular)' }}>
              Geburtsdatum {age !== null && <span style={{ color: 'var(--text-secondary)' }}>({age} Jahre)</span>}
            </label>
            <input
              type="date"
              value={formData.birthDate || ''}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
            />
          </div>

          {/* Nationalities */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-regular)' }}>
              Nationalitäten
            </label>
            <MultiSelectDropdown
              options={NATIONALITIES}
              selectedValues={formData.nationalities || []}
              onChange={(values) => setFormData({ ...formData, nationalities: values })}
              placeholder="Wähle Nationalitäten"
            />
          </div>

          {/* Languages */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-regular)' }}>
              Sprachen
            </label>
            <MultiSelectDropdown
              options={LANGUAGES}
              selectedValues={formData.languages || []}
              onChange={(values) => setFormData({ ...formData, languages: values })}
              placeholder="Wähle Sprachen"
            />
          </div>

          {/* Height and Weight */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-regular)' }}>
                Größe (cm)
              </label>
              <select
                value={formData.height || ''}
                onChange={(e) => setFormData({ ...formData, height: e.target.value ? Number(e.target.value) : undefined })}
              >
                <option value="">Bitte wählen</option>
                {HEIGHTS.map((h) => (
                  <option key={h} value={h}>{h} cm</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-regular)' }}>
                Gewicht (kg)
              </label>
              <select
                value={formData.weight || ''}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value ? Number(e.target.value) : undefined })}
              >
                <option value="">Bitte wählen</option>
                {WEIGHTS.map((w) => (
                  <option key={w} value={w}>{w} kg</option>
                ))}
              </select>
            </div>
          </div>

          {/* Body Type and Cup Size */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-regular)' }}>
                Körpertyp
              </label>
              <select
                value={formData.bodyType || ''}
                onChange={(e) => setFormData({ ...formData, bodyType: e.target.value })}
              >
                <option value="">Bitte wählen</option>
                {BODY_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-regular)' }}>
                Körbchengröße
              </label>
              <select
                value={formData.cupSize || ''}
                onChange={(e) => setFormData({ ...formData, cupSize: e.target.value })}
              >
                <option value="">Bitte wählen</option>
                {CUP_SIZES.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Hair Color, Length, Eye Color */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-regular)' }}>
                Haarfarbe
              </label>
              <select
                value={formData.hairColor || ''}
                onChange={(e) => setFormData({ ...formData, hairColor: e.target.value })}
              >
                <option value="">Bitte wählen</option>
                {HAIR_COLORS.map((color) => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-regular)' }}>
                Haarlänge
              </label>
              <select
                value={formData.hairLength || ''}
                onChange={(e) => setFormData({ ...formData, hairLength: e.target.value })}
              >
                <option value="">Bitte wählen</option>
                {HAIR_LENGTHS.map((length) => (
                  <option key={length} value={length}>{length}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-regular)' }}>
                Augenfarbe
              </label>
              <select
                value={formData.eyeColor || ''}
                onChange={(e) => setFormData({ ...formData, eyeColor: e.target.value })}
              >
                <option value="">Bitte wählen</option>
                {EYE_COLORS.map((color) => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hasTattoos}
                onChange={(e) => setFormData({ ...formData, hasTattoos: e.target.checked })}
                className="w-5 h-5 rounded"
                style={{ accentColor: 'var(--color-primary)' }}
              />
              <span style={{ color: 'var(--text-regular)' }}>Hat Tattoos</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hasPiercings}
                onChange={(e) => setFormData({ ...formData, hasPiercings: e.target.checked })}
                className="w-5 h-5 rounded"
                style={{ accentColor: 'var(--color-secondary)' }}
              />
              <span style={{ color: 'var(--text-regular)' }}>Hat Piercings</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isSmoker}
                onChange={(e) => setFormData({ ...formData, isSmoker: e.target.checked })}
                className="w-5 h-5 rounded"
                style={{ accentColor: 'var(--color-tertiary)' }}
              />
              <span style={{ color: 'var(--text-regular)' }}>Raucher/in</span>
            </label>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-regular)' }}>
              Beschreibung
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              placeholder="Beschreibe dich selbst..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-base btn-primary font-semibold text-lg"
          >
            {loading ? 'Speichert...' : 'Profil speichern'}
          </button>
        </form>
      </div>
    </div>
  );
}