'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { escortProfileService } from '@/services/escortProfileService';
import { profilePictureService } from '@/services/profilePictureService';
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

  if (user?.role !== 'escort') {
    return (
      <div className="p-6 rounded-lg border-depth bg-page-primary">
        <p className="text-action-primary">
          Nur Benutzer mit der Rolle &quot;Escort&quot; können dieses Profil bearbeiten.
        </p>
      </div>
    );
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar Navigation - Desktop only */}
      <aside className="hidden lg:block lg:col-span-1">
        <div className="sticky top-24 p-6 rounded-lg border border-default bg-page-secondary">
          <h3 className="text-lg font-semibold mb-4 text-heading">Navigation</h3>
          <nav className="space-y-2">
            <button
              onClick={() => scrollToSection('profilbild')}
              className="w-full text-left px-3 py-2 rounded-lg text-body hover:bg-page-primary hover:text-heading transition"
            >
              Profilbild
            </button>
            <button
              onClick={() => scrollToSection('persoenliche-daten')}
              className="w-full text-left px-3 py-2 rounded-lg text-body hover:bg-page-primary hover:text-heading transition"
            >
              Persönliche Daten
            </button>
            <button
              onClick={() => scrollToSection('koerpermerkmale')}
              className="w-full text-left px-3 py-2 rounded-lg text-body hover:bg-page-primary hover:text-heading transition"
            >
              Körpermerkmale
            </button>
            <button
              onClick={() => scrollToSection('aussehen')}
              className="w-full text-left px-3 py-2 rounded-lg text-body hover:bg-page-primary hover:text-heading transition"
            >
              Aussehen
            </button>
            <button
              onClick={() => scrollToSection('eigenschaften')}
              className="w-full text-left px-3 py-2 rounded-lg text-body hover:bg-page-primary hover:text-heading transition"
            >
              Eigenschaften
            </button>
            <button
              onClick={() => scrollToSection('beschreibung')}
              className="w-full text-left px-3 py-2 rounded-lg text-body hover:bg-page-primary hover:text-heading transition"
            >
              Beschreibung
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:col-span-3">
        <div className="p-8 rounded-lg border-depth bg-page-primary">
          <h2 className="text-3xl font-bold mb-6 text-heading">
            Escort-Profil bearbeiten
          </h2>

          {/* Profile Picture Section */}
          <div id="profilbild" className="mb-8 p-6 rounded-lg border border-default scroll-mt-8">
            <h3 className="text-xl font-semibold mb-4 text-heading">Profilbild</h3>

        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="flex-shrink-0">
            {profilePicturePreview ? (
              <img
                src={profilePicturePreview}
                alt="Profilbild Vorschau"
                className="w-32 h-32 object-cover rounded-full"
              />
            ) : (
              <div className="w-32 h-32 border border-default rounded-full flex items-center justify-center">
                <span className="text-heading font-bold text-2xl">
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
              className="mb-3 block w-full text-sm text-body file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-action-primary hover:file:bg-action-primary-hover hover:file:text-white file:transition-all file:cursor-pointer"
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

          {/* Success/Error Messages */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-error-light border border-error">
              <p className="text-error">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-lg bg-success-light border border-success">
              <p className="text-success">Profil erfolgreich gespeichert!</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Data Section */}
            <div id="persoenliche-daten" className="scroll-mt-8">
              <h3 className="text-xl font-semibold mb-4 text-heading border-b border-default pb-2">
                Persönliche Daten
              </h3>

              {/* Birth Date */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-body">
                  Geburtsdatum {age !== null && <span className="text-muted">({age} Jahre)</span>}
                </label>
                <input
                  type="date"
                  value={formData.birthDate || ''}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border bg-page-primary text-body border-default focus:outline-none"
                />
              </div>

              {/* Nationalities */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 text-body">
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
                <label className="block text-sm font-medium mb-2 text-body">
                  Sprachen
                </label>
                <MultiSelectDropdown
                  options={LANGUAGES}
                  selectedValues={formData.languages || []}
                  onChange={(values) => setFormData({ ...formData, languages: values })}
                  placeholder="Wähle Sprachen"
                />
              </div>
            </div>

            {/* Body Features Section */}
            <div id="koerpermerkmale" className="scroll-mt-8">
              <h3 className="text-xl font-semibold mb-4 text-heading border-b border-default pb-2">
                Körpermerkmale
              </h3>

              {/* Height and Weight */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-body">
                    Größe (cm)
                  </label>
                  <select
                    value={formData.height || ''}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-4 py-3 rounded-lg border bg-page-primary text-body border-default focus:outline-none"
                  >
                    <option value="">Bitte wählen</option>
                    {HEIGHTS.map((h) => (
                      <option key={h} value={h}>{h} cm</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-body">
                    Gewicht (kg)
                  </label>
                  <select
                    value={formData.weight || ''}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-4 py-3 rounded-lg border bg-page-primary text-body border-default focus:outline-none"
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
                  <label className="block text-sm font-medium mb-2 text-body">
                    Körpertyp
                  </label>
                  <select
                    value={formData.bodyType || ''}
                    onChange={(e) => setFormData({ ...formData, bodyType: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border bg-page-primary text-body border-default focus:outline-none"
                  >
                    <option value="">Bitte wählen</option>
                    {BODY_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-body">
                    Körbchengröße
                  </label>
                  <select
                    value={formData.cupSize || ''}
                    onChange={(e) => setFormData({ ...formData, cupSize: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border bg-page-primary text-body border-default focus:outline-none"
                  >
                    <option value="">Bitte wählen</option>
                    {CUP_SIZES.map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Appearance Section */}
            <div id="aussehen" className="scroll-mt-8">
              <h3 className="text-xl font-semibold mb-4 text-heading border-b border-default pb-2">
                Aussehen
              </h3>

              {/* Hair Color, Length, Eye Color */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-body">
                    Haarfarbe
                  </label>
                  <select
                    value={formData.hairColor || ''}
                    onChange={(e) => setFormData({ ...formData, hairColor: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border bg-page-primary text-body border-default focus:outline-none"
                  >
                    <option value="">Bitte wählen</option>
                    {HAIR_COLORS.map((color) => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-body">
                    Haarlänge
                  </label>
                  <select
                    value={formData.hairLength || ''}
                    onChange={(e) => setFormData({ ...formData, hairLength: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border bg-page-primary text-body border-default focus:outline-none"
                  >
                    <option value="">Bitte wählen</option>
                    {HAIR_LENGTHS.map((length) => (
                      <option key={length} value={length}>{length}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-body">
                    Augenfarbe
                  </label>
                  <select
                    value={formData.eyeColor || ''}
                    onChange={(e) => setFormData({ ...formData, eyeColor: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border bg-page-primary text-body border-default focus:outline-none"
                  >
                    <option value="">Bitte wählen</option>
                    {EYE_COLORS.map((color) => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Characteristics Section */}
            <div id="eigenschaften" className="scroll-mt-8">
              <h3 className="text-xl font-semibold mb-4 text-heading border-b border-default pb-2">
                Eigenschaften
              </h3>

              {/* Checkboxes */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasTattoos}
                    onChange={(e) => setFormData({ ...formData, hasTattoos: e.target.checked })}
                  />
                  <span className="text-body">Hat Tattoos</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasPiercings}
                    onChange={(e) => setFormData({ ...formData, hasPiercings: e.target.checked })}
                  />
                  <span className="text-body">Hat Piercings</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isSmoker}
                    onChange={(e) => setFormData({ ...formData, isSmoker: e.target.checked })}
                  />
                  <span className="text-body">Raucher/in</span>
                </label>
              </div>
            </div>

            {/* Description Section */}
            <div id="beschreibung" className="scroll-mt-8">
              <h3 className="text-xl font-semibold mb-4 text-heading border-b border-default pb-2">
                Beschreibung
              </h3>
              <div>
                <label className="block text-sm font-medium mb-2 text-body">
                  Beschreibung
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border bg-page-primary text-body border-default focus:outline-none"
                  placeholder="Beschreibe dich selbst..."
                />
              </div>
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
    </div>
  );
}