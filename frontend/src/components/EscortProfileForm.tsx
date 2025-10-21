'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { escortProfileService } from '@/services/escortProfileService';
import { profilePictureService } from '@/services/profilePictureService';
import { UpdateEscortProfileDto } from '@/types/auth.types';
import MultiSelectDropdown from './MultiSelectDropdown';
import { ChevronRight, ArrowLeft, Check } from 'lucide-react';
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
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Mobile navigation state - null means menu is shown, string means section is shown
  const [activeSection, setActiveSection] = useState<string | null>(null);

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

  // Auto-save function with debouncing - accepts the data to save
  const autoSave = useCallback(async (dataToSave: UpdateEscortProfileDto) => {
    setIsSaving(true);
    setError(null);

    try {
      // Filter out empty strings and undefined values
      const cleanedData: Partial<UpdateEscortProfileDto> = {};

      Object.entries(dataToSave).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          // For arrays, only include if not empty
          if (Array.isArray(value)) {
            if (value.length > 0) {
              cleanedData[key as keyof UpdateEscortProfileDto] = value as any;
            }
          } else {
            cleanedData[key as keyof UpdateEscortProfileDto] = value as any;
          }
        }
      });

      console.log('Sending data:', cleanedData);
      const updatedUser = await escortProfileService.updateProfile(cleanedData as UpdateEscortProfileDto);
      console.log('Received updated user:', updatedUser);

      // Update the local form data with the response to ensure consistency
      setFormData({
        birthDate: formatDateForInput(updatedUser.birthDate),
        nationalities: updatedUser.nationalities || [],
        languages: updatedUser.languages || [],
        height: updatedUser.height || undefined,
        weight: updatedUser.weight || undefined,
        bodyType: updatedUser.bodyType || '',
        cupSize: updatedUser.cupSize || '',
        hairColor: updatedUser.hairColor || '',
        hairLength: updatedUser.hairLength || '',
        eyeColor: updatedUser.eyeColor || '',
        hasTattoos: updatedUser.hasTattoos || false,
        hasPiercings: updatedUser.hasPiercings || false,
        isSmoker: updatedUser.isSmoker || false,
        description: updatedUser.description || '',
      });

      setUser(updatedUser);
      console.log('User updated in store');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error('Save error:', err);
      const errorMessage = err instanceof Error
        ? err.message
        : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Fehler beim Speichern des Profils';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [setUser]);

  // Debounced save - triggers 1 second after user stops typing
  const debouncedSave = useCallback((newData: UpdateEscortProfileDto) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      autoSave(newData);
    }, 1000);
  }, [autoSave]);

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

  const sections = [
    { id: 'persoenliche-daten', label: 'Persönliche Daten' },
    { id: 'koerpermerkmale', label: 'Körpermerkmale' },
    { id: 'aussehen', label: 'Aussehen' },
    { id: 'eigenschaften', label: 'Eigenschaften' },
    { id: 'beschreibung', label: 'Beschreibung' },
  ];

  return (
    <div>
      {/* Profile Picture Section - Mobile/Tablet only, shown when menu is visible */}
      {activeSection === null && (
        <div className="mb-6 lg:hidden">
        <div className="p-6 rounded-lg border-depth bg-page-primary">
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
        </div>
      )}

      {/* Mobile Navigation - Tablets and Smartphones only */}
      <div className="lg:hidden mb-6">
        {/* Menu - shown when no section is active */}
        {activeSection === null && (
          <div className="grid grid-cols-1 gap-2 p-4 rounded-lg bg-page-primary animate-slide-in-left">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className="flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all border-depth bg-page-primary text-body hover:bg-page-secondary hover:text-heading"
              >
                <span className="text-left">{section.label}</span>
                <ChevronRight className="w-5 h-5 flex-shrink-0 text-muted" />
              </button>
            ))}
          </div>
        )}

        {/* Back Button - shown when a section is active */}
        {activeSection !== null && (
          <button
            onClick={() => setActiveSection(null)}
            className="flex items-center gap-2 mb-4 px-4 py-2 rounded-lg text-sm font-medium transition-all border-depth bg-page-primary text-body hover:bg-page-secondary hover:text-heading"
          >
            <ArrowLeft className="w-5 h-5 text-muted" />
            <span>Zurück zum Menü</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation - Desktop only */}
        <aside className="hidden lg:block lg:col-span-1">
        <div className="sticky top-24 p-6 rounded-lg border border-default bg-page-primary">
          <h3 className="text-lg font-semibold mb-4 text-heading">Navigation</h3>
          <nav className="space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all border-depth bg-page-primary text-body hover:bg-page-secondary hover:text-heading"
              >
                <span className="text-left">{section.label}</span>
                <ChevronRight className="w-5 h-5 flex-shrink-0 text-muted" />
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`lg:col-span-3 ${activeSection === null ? 'hidden lg:block' : 'block'}`}>
        <div className="p-8 rounded-lg border-depth bg-page-primary">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-heading hidden lg:block">
              Escort-Profil bearbeiten
            </h2>

            {/* Auto-save Indicator */}
            <div className="flex items-center gap-2 text-sm">
              {isSaving && (
                <span className="flex items-center gap-2 text-muted">
                  <span className="w-4 h-4 border-2 border-muted border-t-transparent rounded-full animate-spin"></span>
                  Speichert...
                </span>
              )}
              {success && !isSaving && (
                <span className="flex items-center gap-2 text-success">
                  <Check className="w-4 h-4" />
                  Gespeichert
                </span>
              )}
            </div>
          </div>

          {/* Profile Picture Section - Desktop only */}
          <div
            id="profilbild"
            className="mb-8 p-6 rounded-lg border border-default scroll-mt-8 hidden lg:block"
          >
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
          <div className="space-y-8">
            {/* Personal Data Section */}
            <div
              id="persoenliche-daten"
              className={`scroll-mt-8 ${
                activeSection === 'persoenliche-daten' ? 'block lg:block animate-slide-in-right' : 'hidden lg:block'
              }`}
            >
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
                  onBlur={debouncedSave}
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
                  onChange={(values) => {
                    const newData = { ...formData, nationalities: values };
                    setFormData(newData);
                    debouncedSave(newData);
                  }}
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
                  onChange={(values) => {
                    const newData = { ...formData, languages: values };
                    setFormData(newData);
                    debouncedSave(newData);
                  }}
                  placeholder="Wähle Sprachen"
                />
              </div>
            </div>

            {/* Body Features Section */}
            <div
              id="koerpermerkmale"
              className={`scroll-mt-8 ${
                activeSection === 'koerpermerkmale' ? 'block lg:block animate-slide-in-right' : 'hidden lg:block'
              }`}
            >
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
                    onChange={(e) => {
                      const newData = { ...formData, height: e.target.value ? Number(e.target.value) : undefined };
                      setFormData(newData);
                      debouncedSave(newData);
                    }}
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
                    onChange={(e) => {
                      const newData = { ...formData, weight: e.target.value ? Number(e.target.value) : undefined };
                      setFormData(newData);
                      debouncedSave(newData);
                    }}
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
                    onChange={(e) => {
                      const newData = { ...formData, bodyType: e.target.value };
                      setFormData(newData);
                      debouncedSave(newData);
                    }}
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
                    onChange={(e) => {
                      const newData = { ...formData, cupSize: e.target.value };
                      setFormData(newData);
                      debouncedSave(newData);
                    }}
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
            <div
              id="aussehen"
              className={`scroll-mt-8 ${
                activeSection === 'aussehen' ? 'block lg:block animate-slide-in-right' : 'hidden lg:block'
              }`}
            >
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
                    onChange={(e) => {
                      const newData = { ...formData, hairColor: e.target.value };
                      setFormData(newData);
                      debouncedSave(newData);
                    }}
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
                    onChange={(e) => {
                      const newData = { ...formData, hairLength: e.target.value };
                      setFormData(newData);
                      debouncedSave(newData);
                    }}
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
                    onChange={(e) => {
                      const newData = { ...formData, eyeColor: e.target.value };
                      setFormData(newData);
                      debouncedSave(newData);
                    }}
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
            <div
              id="eigenschaften"
              className={`scroll-mt-8 ${
                activeSection === 'eigenschaften' ? 'block lg:block animate-slide-in-right' : 'hidden lg:block'
              }`}
            >
              <h3 className="text-xl font-semibold mb-4 text-heading border-b border-default pb-2">
                Eigenschaften
              </h3>

              {/* Checkboxes */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasTattoos}
                    onChange={(e) => {
                      const newData = { ...formData, hasTattoos: e.target.checked };
                      setFormData(newData);
                      debouncedSave(newData);
                    }}
                  />
                  <span className="text-body">Hat Tattoos</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasPiercings}
                    onChange={(e) => {
                      const newData = { ...formData, hasPiercings: e.target.checked };
                      setFormData(newData);
                      debouncedSave(newData);
                    }}
                  />
                  <span className="text-body">Hat Piercings</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isSmoker}
                    onChange={(e) => {
                      const newData = { ...formData, isSmoker: e.target.checked };
                      setFormData(newData);
                      debouncedSave(newData);
                    }}
                  />
                  <span className="text-body">Raucher/in</span>
                </label>
              </div>
            </div>

            {/* Description Section */}
            <div
              id="beschreibung"
              className={`scroll-mt-8 ${
                activeSection === 'beschreibung' ? 'block lg:block animate-slide-in-right' : 'hidden lg:block'
              }`}
            >
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
                  onBlur={debouncedSave}
                  rows={6}
                  className="w-full px-4 py-3 rounded-lg border bg-page-primary text-body border-default focus:outline-none"
                  placeholder="Beschreibe dich selbst..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}