'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { escortProfileService } from '@/services/escortProfileService';
import { profilePictureService } from '@/services/profilePictureService';
import { UpdateEscortProfileDto } from '@/types/auth.types';
import MultiSelectDropdown from './MultiSelectDropdown';
import DatePicker from './DatePicker';
import { ArrowLeft, ChevronRight, Check, User, Activity, Eye, Star, FileText, Briefcase, Clock, ShieldCheck } from 'lucide-react';
import { useParams } from 'next/navigation';
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
  const params = useParams();
  const locale = (params?.locale as string) || 'de';
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
    name: user?.name || '',
    showNameInProfile: user?.showNameInProfile || false,
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

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(
    user?.profilePicture ? profilePictureService.getProfilePictureUrl(user.profilePicture) : null
  );
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [showProfilePictureModal, setShowProfilePictureModal] = useState(false);

  // Mobile navigation state - null means menu is shown, string means section is shown
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Desktop sidebar navigation state - tracks active section on desktop
  const [activeSidebarSection, setActiveSidebarSection] = useState<string>('persoenliche-daten');

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
      setTimeout(() => setSuccess(false), 3000);
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
      setProfilePicture(null);
      setShowProfilePictureModal(false);
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
    { id: 'persoenliche-daten', label: 'Persönliche Daten', icon: User },
    { id: 'koerpermerkmale', label: 'Körpermerkmale', icon: Activity },
    { id: 'aussehen', label: 'Aussehen', icon: Eye },
    { id: 'eigenschaften', label: 'Eigenschaften', icon: Star },
    { id: 'service', label: 'Service', icon: Briefcase },
    { id: 'arbeitszeiten', label: 'Arbeitszeiten', icon: Clock },
    { id: 'verifizierung', label: 'Verifizierung', icon: ShieldCheck },
    { id: 'beschreibung', label: 'Beschreibung', icon: FileText },
  ];

  return (
    <div>
      {/* Profile Picture Section - Mobile/Tablet only, shown above menu */}
      <div className="mb-6 lg:hidden">
        <div>
          <div className="flex items-center gap-4">
            <div
              className="cursor-pointer transition-opacity hover:opacity-80 flex-shrink-0"
              onClick={() => setShowProfilePictureModal(true)}
            >
              {profilePicturePreview ? (
                <img
                  src={profilePicturePreview}
                  alt="Profilbild"
                  className="w-20 h-20 object-cover rounded-full"
                />
              ) : (
                <div className="w-20 h-20 border border-default rounded-full flex items-center justify-center">
                  <span className="text-heading font-bold text-xl">
                    {user?.firstName?.[0] || user?.username?.[0] || '?'}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-heading text-lg font-semibold">
                {user?.username || user?.email}
              </p>
              <button
                onClick={() => setShowProfilePictureModal(true)}
                className="text-sm text-action-primary hover:text-action-primary-hover transition-colors mt-1"
              >
                Profilbild ändern
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Navigation - shown only when no section is active */}
      {activeSection === null && (
        <div className="lg:hidden mb-6 animate-slide-in-left">
          <div className="border border-[#2f3336] shadow-md bg-page-primary rounded-lg overflow-hidden">
            <nav>
              {sections.map((section, index) => {
                const Icon = section.icon;
                const isLast = index === sections.length - 1;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center justify-between px-4 py-4 text-sm font-medium transition-all text-body hover-bg-page-secondary bg-page-primary ${
                      !isLast ? 'border-b border-[#2f3336]' : ''
                    }`}
                    style={{ borderRadius: 0 }}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 flex-shrink-0 text-muted" />
                      <span className="text-left">{section.label}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 flex-shrink-0 text-muted" />
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Back Button - Mobile/Tablet only, shown when a section is active */}
      {activeSection !== null && (
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setActiveSection(null)}
            className="flex items-center gap-2 text-sm font-medium transition-all text-muted hover:text-body"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Zurück</span>
          </button>
        </div>
      )}

      {/* Überschrift - Desktop only */}
      <h1 className="text-3xl font-bold text-heading mb-6 hidden lg:block">Profil bearbeiten</h1>

      <div className="flex gap-0">
        {/* Sidebar Navigation - Desktop only */}
        <aside className="hidden lg:block lg:w-64 lg:flex-shrink-0 lg:sticky lg:top-16 lg:self-start lg:border lg:border-[#2f3336] lg:shadow-md lg:bg-page-primary lg:rounded-l-lg" style={{ minHeight: 'calc(100vh - 4rem)' }}>
          <nav>
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSidebarSection(section.id)}
                  className={`w-full flex items-center justify-between px-4 py-4 text-sm font-medium transition-all text-body hover-bg-page-secondary ${
                    activeSidebarSection === section.id
                      ? 'bg-page-secondary'
                      : 'bg-page-primary'
                  }`}
                  style={{ borderRadius: 0 }}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 flex-shrink-0 text-muted" />
                    <span className="text-left">{section.label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 flex-shrink-0 text-muted" />
                </button>
              );
            })}
          </nav>
        </aside>

      {/* Main Content */}
      <div className={`flex-1 ${activeSection === null ? 'hidden lg:block' : 'block lg:block'} ${activeSection !== null ? 'animate-slide-in-right lg:animate-none' : ''}`}>
        <div className="lg:p-8 lg:pr-16 bg-page-primary lg:border lg:border-[#2f3336] lg:shadow-md lg:rounded-r-lg lg:border-l-0">
          <div className="mb-6">
            {/* Saving indicator - only shown while saving */}
            {isSaving && (
              <div className="flex items-center justify-end">
                <span className="flex items-center gap-2 text-sm text-muted">
                  <span className="w-4 h-4 border-2 border-muted border-t-transparent rounded-full animate-spin"></span>
                  Speichert...
                </span>
              </div>
            )}
          </div>

          {/* Profile Picture Section - Desktop only */}
          <div
            id="profilbild"
            className="mb-8 scroll-mt-8 hidden lg:block"
          >
            <div className="flex items-center gap-8">
              <div className="w-48 flex justify-end flex-shrink-0">
                <div
                  className="cursor-pointer transition-opacity hover:opacity-80"
                  onClick={() => setShowProfilePictureModal(true)}
                >
                  {profilePicturePreview ? (
                    <img
                      src={profilePicturePreview}
                      alt="Profilbild"
                      className="w-16 h-16 object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 border border-default rounded-full flex items-center justify-center">
                      <span className="text-heading font-bold text-lg">
                        {user?.firstName?.[0] || user?.username?.[0] || '?'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-heading text-base font-medium mb-1">
                  {user?.username || user?.email}
                </p>
                <button
                  onClick={() => setShowProfilePictureModal(true)}
                  className="text-sm text-action-primary hover:text-action-primary-hover transition-colors"
                >
                  Profilbild ändern
                </button>
              </div>
            </div>
          </div>


          {/* Form */}
          <div className="space-y-8">
            {/* Personal Data Section */}
            <div
              id="persoenliche-daten"
              className={`scroll-mt-8 ${
                activeSection === 'persoenliche-daten' ? 'block animate-slide-in-right' : 'hidden'
              } ${activeSidebarSection === 'persoenliche-daten' ? 'lg:block' : 'lg:hidden'}`}
            >
              {/* Name */}
              <div className="mb-4 lg:flex lg:gap-6">
                <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0 lg:pt-3 lg:text-right text-muted">
                  Name
                </label>
                <div className="lg:flex-1">
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => {
                      const newData = { ...formData, name: e.target.value };
                      setFormData(newData);
                      debouncedSave(newData);
                    }}
                    className="w-full px-4 py-3 rounded-lg border bg-page-primary text-body border-default focus:outline-none"
                    placeholder="Dein Name"
                  />

                  {/* Show Name in Profile Checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer mt-2">
                    <input
                      type="checkbox"
                      checked={formData.showNameInProfile}
                      onChange={(e) => {
                        const newData = { ...formData, showNameInProfile: e.target.checked };
                        setFormData(newData);
                        debouncedSave(newData);
                      }}
                      className="w-3 h-3 rounded border-gray-600 text-[#8b5cf6] focus:ring-[#8b5cf6] focus:ring-1"
                    />
                    <span className="text-xs text-muted">Name im Profil anzeigen</span>
                  </label>
                </div>
              </div>

              {/* Birth Date */}
              <div className="mb-4 lg:flex lg:items-center lg:gap-6">
                <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0 lg:text-right text-muted">
                  Geburtsdatum
                </label>
                <DatePicker
                  value={formData.birthDate || ''}
                  onChange={(value) => {
                    const newData = { ...formData, birthDate: value };
                    setFormData(newData);
                    debouncedSave(newData);
                  }}
                  onBlur={() => debouncedSave(formData)}
                  locale={locale}
                  className="w-full lg:flex-1"
                />
              </div>

              {/* Nationalities */}
              <div className="mb-4 lg:flex lg:items-center lg:gap-6">
                <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0 lg:text-right text-muted">
                  Nationalitäten
                </label>
                <div className="lg:flex-1">
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
              </div>

              {/* Languages */}
              <div className="lg:flex lg:items-center lg:gap-6">
                <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0 lg:text-right text-muted">
                  Sprachen
                </label>
                <div className="lg:flex-1">
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
            </div>

            {/* Body Features Section */}
            <div
              id="koerpermerkmale"
              className={`scroll-mt-8 ${
                activeSection === 'koerpermerkmale' ? 'block animate-slide-in-right' : 'hidden'
              } ${activeSidebarSection === 'koerpermerkmale' ? 'lg:block' : 'lg:hidden'}`}
            >
              {/* Height */}
              <div className="mb-4 lg:flex lg:items-center lg:gap-6">
                <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0 lg:text-right text-muted">
                  Größe (cm)
                </label>
                <select
                  value={formData.height || ''}
                  onChange={(e) => {
                    const newData = { ...formData, height: e.target.value ? Number(e.target.value) : undefined };
                    setFormData(newData);
                    debouncedSave(newData);
                  }}
                  className="w-full lg:flex-1 px-4 py-3 rounded-lg border bg-page-primary text-body border-default focus:outline-none"
                >
                  <option value="">Bitte wählen</option>
                  {HEIGHTS.map((h) => (
                    <option key={h} value={h}>{h} cm</option>
                  ))}
                </select>
              </div>

              {/* Weight */}
              <div className="mb-4 lg:flex lg:items-center lg:gap-6">
                <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0 lg:text-right text-muted">
                  Gewicht (kg)
                </label>
                <select
                  value={formData.weight || ''}
                  onChange={(e) => {
                    const newData = { ...formData, weight: e.target.value ? Number(e.target.value) : undefined };
                    setFormData(newData);
                    debouncedSave(newData);
                  }}
                  className="w-full lg:flex-1 px-4 py-3 rounded-lg border bg-page-primary text-body border-default focus:outline-none"
                >
                  <option value="">Bitte wählen</option>
                  {WEIGHTS.map((w) => (
                    <option key={w} value={w}>{w} kg</option>
                  ))}
                </select>
              </div>

              {/* Body Type */}
              <div className="mb-4 lg:flex lg:items-center lg:gap-6">
                <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0 lg:text-right text-muted">
                  Körpertyp
                </label>
                <select
                  value={formData.bodyType || ''}
                  onChange={(e) => {
                    const newData = { ...formData, bodyType: e.target.value };
                    setFormData(newData);
                    debouncedSave(newData);
                  }}
                  className="w-full lg:flex-1 px-4 py-3 rounded-lg border bg-page-primary text-body border-default focus:outline-none"
                >
                  <option value="">Bitte wählen</option>
                  {BODY_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Cup Size */}
              <div className="lg:flex lg:items-center lg:gap-6">
                <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0 lg:text-right text-muted">
                  Körbchengröße
                </label>
                <select
                  value={formData.cupSize || ''}
                  onChange={(e) => {
                    const newData = { ...formData, cupSize: e.target.value };
                    setFormData(newData);
                    debouncedSave(newData);
                  }}
                  className="w-full lg:flex-1 px-4 py-3 rounded-lg border bg-page-primary text-body border-default focus:outline-none"
                >
                  <option value="">Bitte wählen</option>
                  {CUP_SIZES.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Appearance Section */}
            <div
              id="aussehen"
              className={`scroll-mt-8 ${
                activeSection === 'aussehen' ? 'block animate-slide-in-right' : 'hidden'
              } ${activeSidebarSection === 'aussehen' ? 'lg:block' : 'lg:hidden'}`}
            >
              {/* Hair Color */}
              <div className="mb-4 lg:flex lg:items-center lg:gap-6">
                <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0 lg:text-right text-muted">
                  Haarfarbe
                </label>
                <select
                  value={formData.hairColor || ''}
                  onChange={(e) => {
                    const newData = { ...formData, hairColor: e.target.value };
                    setFormData(newData);
                    debouncedSave(newData);
                  }}
                  className="w-full lg:flex-1 px-4 py-3 rounded-lg border bg-page-primary text-body border-default focus:outline-none"
                >
                  <option value="">Bitte wählen</option>
                  {HAIR_COLORS.map((color) => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>

              {/* Hair Length */}
              <div className="mb-4 lg:flex lg:items-center lg:gap-6">
                <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0 lg:text-right text-muted">
                  Haarlänge
                </label>
                <select
                  value={formData.hairLength || ''}
                  onChange={(e) => {
                    const newData = { ...formData, hairLength: e.target.value };
                    setFormData(newData);
                    debouncedSave(newData);
                  }}
                  className="w-full lg:flex-1 px-4 py-3 rounded-lg border bg-page-primary text-body border-default focus:outline-none"
                >
                  <option value="">Bitte wählen</option>
                  {HAIR_LENGTHS.map((length) => (
                    <option key={length} value={length}>{length}</option>
                  ))}
                </select>
              </div>

              {/* Eye Color */}
              <div className="lg:flex lg:items-center lg:gap-6">
                <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0 lg:text-right text-muted">
                  Augenfarbe
                </label>
                <select
                  value={formData.eyeColor || ''}
                  onChange={(e) => {
                    const newData = { ...formData, eyeColor: e.target.value };
                    setFormData(newData);
                    debouncedSave(newData);
                  }}
                  className="w-full lg:flex-1 px-4 py-3 rounded-lg border bg-page-primary text-body border-default focus:outline-none"
                >
                  <option value="">Bitte wählen</option>
                  {EYE_COLORS.map((color) => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Characteristics Section */}
            <div
              id="eigenschaften"
              className={`scroll-mt-8 ${
                activeSection === 'eigenschaften' ? 'block animate-slide-in-right' : 'hidden'
              } ${activeSidebarSection === 'eigenschaften' ? 'lg:block' : 'lg:hidden'}`}
            >
              {/* Tattoos */}
              <div className="mb-4 lg:flex lg:items-center lg:gap-6">
                <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0 lg:text-right text-muted">
                  Tattoos
                </label>
                <label className="flex items-center gap-3 cursor-pointer lg:flex-1">
                  <input
                    type="checkbox"
                    checked={formData.hasTattoos}
                    onChange={(e) => {
                      const newData = { ...formData, hasTattoos: e.target.checked };
                      setFormData(newData);
                      debouncedSave(newData);
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-body">Hat Tattoos</span>
                </label>
              </div>

              {/* Piercings */}
              <div className="mb-4 lg:flex lg:items-center lg:gap-6">
                <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0 lg:text-right text-muted">
                  Piercings
                </label>
                <label className="flex items-center gap-3 cursor-pointer lg:flex-1">
                  <input
                    type="checkbox"
                    checked={formData.hasPiercings}
                    onChange={(e) => {
                      const newData = { ...formData, hasPiercings: e.target.checked };
                      setFormData(newData);
                      debouncedSave(newData);
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-body">Hat Piercings</span>
                </label>
              </div>

              {/* Smoker */}
              <div className="lg:flex lg:items-center lg:gap-6">
                <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0 lg:text-right text-muted">
                  Raucher
                </label>
                <label className="flex items-center gap-3 cursor-pointer lg:flex-1">
                  <input
                    type="checkbox"
                    checked={formData.isSmoker}
                    onChange={(e) => {
                      const newData = { ...formData, isSmoker: e.target.checked };
                      setFormData(newData);
                      debouncedSave(newData);
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-body">Raucher/in</span>
                </label>
              </div>
            </div>

            {/* Service Section */}
            <div
              id="service"
              className={`scroll-mt-8 ${
                activeSection === 'service' ? 'block animate-slide-in-right' : 'hidden'
              } ${activeSidebarSection === 'service' ? 'lg:block' : 'lg:hidden'}`}
            >
              <p className="text-muted text-sm">Service-Felder werden hier hinzugefügt.</p>
            </div>

            {/* Arbeitszeiten Section */}
            <div
              id="arbeitszeiten"
              className={`scroll-mt-8 ${
                activeSection === 'arbeitszeiten' ? 'block animate-slide-in-right' : 'hidden'
              } ${activeSidebarSection === 'arbeitszeiten' ? 'lg:block' : 'lg:hidden'}`}
            >
              <p className="text-muted text-sm">Arbeitszeiten-Felder werden hier hinzugefügt.</p>
            </div>

            {/* Verifizierung Section */}
            <div
              id="verifizierung"
              className={`scroll-mt-8 ${
                activeSection === 'verifizierung' ? 'block animate-slide-in-right' : 'hidden'
              } ${activeSidebarSection === 'verifizierung' ? 'lg:block' : 'lg:hidden'}`}
            >
              <p className="text-muted text-sm">Verifizierungs-Felder werden hier hinzugefügt.</p>
            </div>

            {/* Description Section */}
            <div
              id="beschreibung"
              className={`scroll-mt-8 ${
                activeSection === 'beschreibung' ? 'block animate-slide-in-right' : 'hidden'
              } ${activeSidebarSection === 'beschreibung' ? 'lg:block' : 'lg:hidden'}`}
            >
              <div className="lg:flex lg:gap-6">
                <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0 lg:pt-3 lg:text-right text-muted">
                  Beschreibung
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  onBlur={debouncedSave}
                  rows={6}
                  className="w-full lg:flex-1 px-4 py-3 rounded-lg border bg-page-primary text-body border-default focus:outline-none"
                  placeholder="Beschreibe dich selbst..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Toast Notifications */}
      {success && !isSaving && (
        <div className="fixed top-4 right-4 z-50 animate-toast">
          <div className="bg-page-secondary border border-success shadow-lg rounded-lg p-4 flex items-center gap-3 min-w-[280px]">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-success flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-heading font-semibold text-sm">Erfolgreich gespeichert</p>
              <p className="text-muted text-xs mt-0.5">Deine Änderungen wurden gespeichert</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-4 right-4 z-50 animate-toast">
          <div className="bg-page-secondary border border-error shadow-lg rounded-lg p-4 flex items-center gap-3 min-w-[280px]">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-error flex items-center justify-center">
              <span className="text-white text-lg font-bold">!</span>
            </div>
            <div className="flex-1">
              <p className="text-heading font-semibold text-sm">Fehler</p>
              <p className="text-muted text-xs mt-0.5">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="flex-shrink-0 text-muted hover:text-heading transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Profile Picture Upload Modal */}
      {showProfilePictureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-page-primary border border-[#2f3336] rounded-lg shadow-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-heading">Profilbild ändern</h2>
              <button
                onClick={() => {
                  setShowProfilePictureModal(false);
                  setProfilePicture(null);
                }}
                className="text-muted hover:text-heading transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <div className="flex justify-center mb-6">
                {profilePicture ? (
                  <img
                    src={URL.createObjectURL(profilePicture)}
                    alt="Vorschau"
                    className="w-32 h-32 object-cover rounded-full"
                  />
                ) : profilePicturePreview ? (
                  <img
                    src={profilePicturePreview}
                    alt="Aktuelles Profilbild"
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

              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="mb-4 block w-full text-sm text-body file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-action-primary hover:file:bg-action-primary-hover hover:file:text-white file:transition-all file:cursor-pointer"
              />

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-error-light border border-error">
                  <p className="text-error text-sm">{error}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowProfilePictureModal(false);
                  setProfilePicture(null);
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-[#2f3336] text-body hover-bg-page-secondary transition-all"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleUploadProfilePicture}
                disabled={!profilePicture || uploadingPicture}
                className="flex-1 btn-base btn-primary"
              >
                {uploadingPicture ? 'Lädt hoch...' : 'Hochladen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}