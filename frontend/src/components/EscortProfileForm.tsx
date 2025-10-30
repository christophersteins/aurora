'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { escortProfileService } from '@/services/escortProfileService';
import { profilePictureService } from '@/services/profilePictureService';
import { UpdateEscortProfileDto } from '@/types/auth.types';
import MultiSelectDropdown from './MultiSelectDropdown';
import DatePicker from './DatePicker';
import ToggleSwitch from './ToggleSwitch';
import AvailabilityScheduler from './AvailabilityScheduler';
import MeetingPointsSelector from './MeetingPointsSelector';
import { ArrowLeft, User, Sparkles, Image, Video, Briefcase, Clock, MapPinned, Euro, FileText, ShieldCheck, Check } from 'lucide-react';
import { useParams } from 'next/navigation';
import {
  NATIONALITIES,
  LANGUAGES,
  HEIGHTS,
  WEIGHTS,
  BODY_TYPES,
  CLOTHING_SIZES,
  CUP_SIZES,
  HAIR_COLORS,
  HAIR_LENGTHS,
  EYE_COLORS,
} from '@/constants/escortProfileOptions';
import MediaGalleryUpload from './MediaGalleryUpload';

export default function EscortProfileForm() {
  const { user, setUser } = useAuthStore();
  const params = useParams();
  const locale = (params?.locale as string) || 'de';
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const profilePictureInputRef = useRef<HTMLInputElement>(null);

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState<UpdateEscortProfileDto>({
    name: user?.name || '',
    showNameInProfile: user?.showNameInProfile || false,
    birthDate: formatDateForInput(user?.birthDate),
    gender: user?.gender || '',
    nationalities: user?.nationalities || [],
    languages: user?.languages || [],
    height: user?.height || undefined,
    weight: user?.weight || undefined,
    clothingSize: user?.clothingSize || '',
    bodyType: user?.bodyType || '',
    cupSize: user?.cupSize || '',
    hairColor: user?.hairColor || '',
    hairLength: user?.hairLength || '',
    eyeColor: user?.eyeColor || '',
    hasTattoos: user?.hasTattoos || false,
    hasPiercings: user?.hasPiercings || false,
    isSmoker: user?.isSmoker || false,
    services: user?.services || [],
    description: user?.description || '',
    availability: user?.availability || {},
    meetingPoints: user?.meetingPoints || [],
    price30Min: user?.price30Min || undefined,
    price1Hour: user?.price1Hour || undefined,
    price2Hours: user?.price2Hours || undefined,
    price3Hours: user?.price3Hours || undefined,
    price6Hours: user?.price6Hours || undefined,
    price12Hours: user?.price12Hours || undefined,
    price24Hours: user?.price24Hours || undefined,
    priceOvernight: user?.priceOvernight || undefined,
    priceWeekend: user?.priceWeekend || undefined,
  });

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(
    user?.profilePicture ? profilePictureService.getProfilePictureUrl(user.profilePicture) : null
  );
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [showProfilePictureModal, setShowProfilePictureModal] = useState(false);
  const [modalView, setModalView] = useState<'choice' | 'upload' | 'gallery'>('choice');
  const [galleryPhotos, setGalleryPhotos] = useState<any[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);

  // State for time changes (manual save required)
  const [tempAvailability, setTempAvailability] = useState(user?.availability || {});
  const [hasUnsavedTimeChanges, setHasUnsavedTimeChanges] = useState(false);
  const [isSavingTime, setIsSavingTime] = useState(false);

  // Mobile navigation state - null means menu is shown, string means section is shown
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Desktop sidebar navigation state - tracks active section on desktop
  const [activeSidebarSection, setActiveSidebarSection] = useState<string>('persoenliche-daten');

  // Define sections array
  const sections = [
    { id: 'persoenliche-daten', label: 'Persönliche Daten', icon: User },
    { id: 'erscheinungsbild', label: 'Erscheinungsbild', icon: Sparkles },
    { id: 'fotos', label: 'Fotos', icon: Image },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'service', label: 'Service', icon: Briefcase },
    { id: 'zeiten', label: 'Zeiten', icon: Clock },
    { id: 'treffpunkte', label: 'Treffpunkte', icon: MapPinned },
    { id: 'preise', label: 'Preise', icon: Euro },
    { id: 'beschreibung', label: 'Beschreibung', icon: FileText },
    { id: 'verifizierung', label: 'Verifizierung', icon: ShieldCheck },
  ];

  // Sync tempAvailability with formData when it changes (e.g., after save)
  useEffect(() => {
    setTempAvailability(formData.availability || {});
  }, [formData.availability]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showProfilePictureModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showProfilePictureModal]);

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
        name: updatedUser.name || '',
        showNameInProfile: updatedUser.showNameInProfile || false,
        birthDate: formatDateForInput(updatedUser.birthDate),
        gender: updatedUser.gender || '',
        nationalities: updatedUser.nationalities || [],
        languages: updatedUser.languages || [],
        height: updatedUser.height || undefined,
        weight: updatedUser.weight || undefined,
        clothingSize: updatedUser.clothingSize || '',
        bodyType: updatedUser.bodyType || '',
        cupSize: updatedUser.cupSize || '',
        hairColor: updatedUser.hairColor || '',
        hairLength: updatedUser.hairLength || '',
        eyeColor: updatedUser.eyeColor || '',
        hasTattoos: updatedUser.hasTattoos || false,
        hasPiercings: updatedUser.hasPiercings || false,
        isSmoker: updatedUser.isSmoker || false,
        services: updatedUser.services || [],
        description: updatedUser.description || '',
        availability: updatedUser.availability || {},
        meetingPoints: updatedUser.meetingPoints || [],
        price30Min: updatedUser.price30Min || undefined,
        price1Hour: updatedUser.price1Hour || undefined,
        price2Hours: updatedUser.price2Hours || undefined,
        price3Hours: updatedUser.price3Hours || undefined,
        price6Hours: updatedUser.price6Hours || undefined,
        price12Hours: updatedUser.price12Hours || undefined,
        price24Hours: updatedUser.price24Hours || undefined,
        priceOvernight: updatedUser.priceOvernight || undefined,
        priceWeekend: updatedUser.priceWeekend || undefined,
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

  // Manual save for time changes
  const handleSaveTimeChanges = async () => {
    setIsSavingTime(true);
    setError(null);

    const newData = { ...formData, availability: tempAvailability };

    try {
      await autoSave(newData);
      setHasUnsavedTimeChanges(false);
    } catch (err) {
      console.error('Error saving time changes:', err);
    } finally {
      setIsSavingTime(false);
    }
  };

  // Discard time changes
  const handleDiscardTimeChanges = () => {
    setTempAvailability(formData.availability || {});
    setHasUnsavedTimeChanges(false);
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      setModalView('upload');

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const loadGalleryPhotos = async () => {
    setLoadingGallery(true);
    setError(null);
    try {
      // Get token from Zustand storage
      const storedAuth = localStorage.getItem('aurora-auth-storage');
      let token = null;
      if (storedAuth) {
        try {
          const parsedAuth = JSON.parse(storedAuth);
          token = parsedAuth.state?.token;
        } catch (e) {
          console.error('Error parsing auth storage:', e);
        }
      }

      console.log('Loading gallery photos...');
      const response = await fetch('http://localhost:4000/users/gallery-photos', {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Gallery photos data:', data);
      console.log('Is array?', Array.isArray(data));
      console.log('Length:', data?.length);

      // Ensure data is an array
      setGalleryPhotos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading gallery:', error);
      setError('Fehler beim Laden der Galerie: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'));
      setGalleryPhotos([]);
    } finally {
      setLoadingGallery(false);
    }
  };

  const handleSelectGalleryPhoto = async (photoUrl: string) => {
    setUploadingPicture(true);
    setError(null);

    try {
      // Get token from Zustand storage
      const storedAuth = localStorage.getItem('aurora-auth-storage');
      let token = null;
      if (storedAuth) {
        try {
          const parsedAuth = JSON.parse(storedAuth);
          token = parsedAuth.state?.token;
        } catch (e) {
          console.error('Error parsing auth storage:', e);
        }
      }

      const response = await fetch('http://localhost:4000/users/profile-picture/from-gallery', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ photoUrl }),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Setzen des Profilbildes');
      }

      const data = await response.json();
      const fullUrl = profilePictureService.getProfilePictureUrl(data.profilePicture);

      if (user) {
        setUser({ ...user, profilePicture: data.profilePicture });
      }

      setProfilePicturePreview(fullUrl);
      setShowProfilePictureModal(false);
      setModalView('choice');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Setzen des Profilbildes');
    } finally {
      setUploadingPicture(false);
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
      setModalView('choice');
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

  const handleTabClick = (sectionId: string) => {
    setActiveSidebarSection(sectionId);
  };

  return (
    <div>
      {/* Überschrift - Desktop Layout */}
      <div className="hidden lg:block mb-6">
        <h1 className="text-3xl font-bold text-heading">Profil bearbeiten</h1>
      </div>

      {/* Überschrift - Mobile/Tablet */}
      <h1 className="text-3xl font-bold text-heading mb-6 lg:hidden">Profil bearbeiten</h1>

      {/* Profile Picture Section - Desktop only, shown between title and containers */}
      <div className="mb-6 hidden lg:flex lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div
            className="cursor-pointer transition-opacity hover:opacity-80 flex-shrink-0"
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
          <div>
            <p className="text-heading text-lg font-semibold">
              {user?.username || user?.email}
            </p>
            <button
              onClick={() => setShowProfilePictureModal(true)}
              className="text-sm text-action-primary hover:text-action-primary-hover transition-colors mt-1 cursor-pointer"
            >
              Profilbild ändern
            </button>
          </div>
        </div>
        <button
          onClick={() => window.location.href = `/profile/${user?.username}`}
          className="btn-base btn-secondary"
        >
          Profil ansehen
        </button>
      </div>

      {/* Profile Picture Section - Mobile/Tablet only, shown above menu */}
      <div className="mb-6 lg:hidden">
        <div>
          <div className="flex items-center gap-4 mb-4">
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
                className="text-sm text-action-primary hover:text-action-primary-hover transition-colors mt-1 cursor-pointer"
              >
                Profilbild ändern
              </button>
            </div>
          </div>
          {/* Button unter Profilbild - Mobile/Tablet */}
          <button
            onClick={() => window.location.href = `/profile/${user?.username}`}
            className="btn-base btn-secondary w-full"
          >
            Profil ansehen
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Navigation - shown only when no section is active */}
      {activeSection === null && (
        <div className="lg:hidden mb-6 animate-slide-in-left">
          <div className="border border-[#2f3336] shadow-md bg-page-primary rounded-lg overflow-hidden">
            <nav>
              {sections.map((section, index) => {
                const isLast = index === sections.length - 1;
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-4 text-sm font-medium cursor-pointer text-body bg-page-primary ${
                      !isLast ? 'border-b border-[#2f3336]' : ''
                    }`}
                    style={{
                      borderRadius: 0,
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--background-secondary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '';
                    }}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-left">{section.label}</span>
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
            className="flex items-center gap-2 text-sm font-medium transition-all text-action-primary hover:text-action-primary-hover cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Zurück</span>
          </button>
        </div>
      )}

      <div className="lg:flex gap-0">
        {/* Sidebar Navigation - Desktop only - Sticky Position */}
        <aside className="hidden lg:block lg:w-64 lg:flex-shrink-0 border border-[#2f3336] shadow-md bg-page-primary rounded-lg lg:rounded-r-none">
          <nav>
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSidebarSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => handleTabClick(section.id)}
                  className={`w-full flex items-center gap-3 !pl-6 pr-4 py-4 text-sm font-medium cursor-pointer group text-body ${
                    isActive
                      ? 'bg-page-secondary'
                      : ''
                  }`}
                  style={{
                    borderRadius: 0,
                    transition: 'background-color 0.2s',
                    ...(isActive && { borderRight: '2px solid var(--color-primary)' })
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--background-secondary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '';
                    }
                  }}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 transition-all ${isActive ? 'scale-105' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`text-left transition-all ${isActive ? 'font-bold' : ''}`}>{section.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

      {/* Main Content */}
      <div className={`flex-1 ${activeSection === null ? 'hidden lg:block' : 'block lg:block'} ${activeSection !== null ? 'animate-slide-in-right lg:animate-none' : ''}`}>
        <div className={`bg-page-primary border border-[#2f3336] shadow-md rounded-lg ${activeSection !== null ? 'p-0 border-0 shadow-none rounded-none lg:p-6 lg:border lg:border-l-0 lg:shadow-md lg:rounded-lg lg:rounded-l-none' : 'p-6 lg:border-l-0 lg:rounded-l-none'}`}>
          {/* Saving indicator - only shown while saving */}
          {isSaving && (
            <div className="flex items-center justify-end mb-6">
              <span className="flex items-center gap-2 text-sm text-muted">
                <span className="w-4 h-4 border-2 border-muted border-t-transparent rounded-full animate-spin"></span>
                Speichert...
              </span>
            </div>
          )}

          {/* Form */}
          <div className="space-y-8">
            {/* Personal Data Section */}
            <div
              id="persoenliche-daten"
              className={`mb-12 ${
                activeSection === 'persoenliche-daten'
                  ? 'block animate-slide-in-right'
                  : activeSection === null && activeSidebarSection === 'persoenliche-daten'
                  ? 'block'
                  : 'hidden'
              }`}
            >
              <h2 className="text-xl font-bold text-heading mb-6 pt-6 lg:pt-0">Persönliche Daten</h2>

              {/* Name */}
              <div className="mb-4 lg:flex lg:items-center lg:gap-1">
                <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0 text-muted">
                  Name
                </label>
                <div className="lg:flex-1 flex items-center gap-4">
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => {
                      const newData = { ...formData, name: e.target.value };
                      setFormData(newData);
                      debouncedSave(newData);
                    }}
                    className="flex-1 px-4 py-3 rounded-lg border bg-page-primary text-body border-default focus:outline-none"
                    placeholder="Dein Name"
                  />

                  {/* Show Name in Profile Checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
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
                    <span className="text-xs text-muted">Im Profil anzeigen</span>
                  </label>
                </div>
              </div>

              {/* Birth Date */}
              <div className="mb-4 lg:flex lg:items-center lg:gap-1">
                <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0  text-muted">
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

              {/* Gender */}
              <div className="mb-4 lg:flex lg:items-center lg:gap-1">
                <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0  text-muted">
                  Geschlecht
                </label>
                <select
                  value={formData.gender || ''}
                  onChange={(e) => {
                    const newData = { ...formData, gender: e.target.value };
                    setFormData(newData);
                    debouncedSave(newData);
                  }}
                  className="w-full lg:flex-1 px-4 py-3 rounded-lg border bg-page-primary text-body border-default focus:outline-none"
                >
                  <option value="">Bitte wählen</option>
                  <option value="Weiblich">Weiblich</option>
                  <option value="Transgender">Transgender</option>
                </select>
              </div>

              {/* Nationalities */}
              <div className="mb-4 lg:flex lg:items-center lg:gap-1">
                <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0  text-muted">
                  Nationalität
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
                    placeholder="Wähle Nationalität"
                  />
                </div>
              </div>

              {/* Languages */}
              <div className="lg:flex lg:items-center lg:gap-1">
                <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0  text-muted">
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

            {/* Erscheinungsbild Section (combined: Körpermerkmale + Aussehen + Eigenschaften) */}
            <div
              id="erscheinungsbild"
              className={`mb-12 ${
                activeSection === 'erscheinungsbild'
                  ? 'block animate-slide-in-right'
                  : activeSection === null && activeSidebarSection === 'erscheinungsbild'
                  ? 'block'
                  : 'hidden'
              }`}
            >
              <h2 className="text-xl font-bold text-heading mb-6 pt-6 lg:pt-0">Erscheinungsbild</h2>

              {/* Größe */}
              <div className="mb-4 lg:flex lg:items-center lg:gap-1">
                <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0  text-muted">
                  Größe
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

              {/* Gewicht */}
              <div className="mb-4 lg:flex lg:items-center lg:gap-1">
                <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0  text-muted">
                  Gewicht
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

              {/* Körpertyp */}
              <div className="mb-4 lg:flex lg:items-center lg:gap-1">
                <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0  text-muted">
                  Körper
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

              {/* Oberweite */}
              <div className="mb-4 lg:flex lg:items-center lg:gap-1">
                <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0  text-muted">
                  Oberweite
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

              {/* Haarfarbe */}
              <div className="mb-4 lg:flex lg:items-center lg:gap-1">
                <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0  text-muted">
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

              {/* Haarlänge */}
              <div className="mb-4 lg:flex lg:items-center lg:gap-1">
                <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0  text-muted">
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

              {/* Augenfarbe */}
              <div className="mb-4 lg:flex lg:items-center lg:gap-1">
                <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0  text-muted">
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

              {/* Tattoos - Checkboxes */}
              <div className="mb-4 lg:flex lg:items-center lg:gap-1">
                <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0  text-muted">
                  Tattoos
                </label>
                <div className="lg:flex-1 flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasTattoos}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const newData = { ...formData, hasTattoos: true };
                          setFormData(newData);
                          debouncedSave(newData);
                        }
                      }}
                    />
                    <span className="text-sm text-body">Ja</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!formData.hasTattoos}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const newData = { ...formData, hasTattoos: false };
                          setFormData(newData);
                          debouncedSave(newData);
                        }
                      }}
                    />
                    <span className="text-sm text-body">Nein</span>
                  </label>
                </div>
              </div>

              {/* Piercings - Checkboxes */}
              <div className="mb-4 lg:flex lg:items-center lg:gap-1">
                <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0  text-muted">
                  Piercings
                </label>
                <div className="lg:flex-1 flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasPiercings}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const newData = { ...formData, hasPiercings: true };
                          setFormData(newData);
                          debouncedSave(newData);
                        }
                      }}
                    />
                    <span className="text-sm text-body">Ja</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!formData.hasPiercings}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const newData = { ...formData, hasPiercings: false };
                          setFormData(newData);
                          debouncedSave(newData);
                        }
                      }}
                    />
                    <span className="text-sm text-body">Nein</span>
                  </label>
                </div>
              </div>

            </div>

            {/* Fotos Section */}
            <div
              id="fotos"
              className={`mb-12 ${
                activeSection === 'fotos'
                  ? 'block animate-slide-in-right'
                  : activeSection === null && activeSidebarSection === 'fotos'
                  ? 'block'
                  : 'hidden'
              }`}
            >
              <h2 className="text-xl font-bold text-heading mb-6 pt-6 lg:pt-0">Fotos</h2>
              <MediaGalleryUpload mediaType="image" />
            </div>

            {/* Videos Section */}
            <div
              id="videos"
              className={`mb-12 ${
                activeSection === 'videos'
                  ? 'block animate-slide-in-right'
                  : activeSection === null && activeSidebarSection === 'videos'
                  ? 'block'
                  : 'hidden'
              }`}
            >
              <h2 className="text-xl font-bold text-heading mb-6 pt-6 lg:pt-0">Videos</h2>
              <MediaGalleryUpload mediaType="video" />
            </div>

            {/* Service Section */}
            <div
              id="service"
              className={`mb-12 ${
                activeSection === 'service'
                  ? 'block animate-slide-in-right'
                  : activeSection === null && activeSidebarSection === 'service'
                  ? 'block'
                  : 'hidden'
              }`}
            >
              <h2 className="text-xl font-bold text-heading mb-6 pt-6 lg:pt-0">Service</h2>

              {/* Services */}
              <div className="mb-4 lg:flex lg:gap-1">
                <label className="block text-sm mb-3 lg:mb-0 lg:w-48 lg:flex-shrink-0 lg:pt-3  text-muted">
                  Angebotene Services
                </label>
                <div className="lg:flex-1">
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Girlfriend Experience',
                      'Boyfriend Experience',
                      'Massage',
                      'Erotische Massage',
                      'Tantra Massage',
                      'Outcall',
                      'Incall',
                      'Dinner Date',
                      'Travel Companion',
                      'Overnight',
                      'Couples',
                      'Role Play',
                      'BDSM',
                      'Fetish',
                    ].map((service) => {
                      const isSelected = formData.services?.includes(service) || false;
                      return (
                        <button
                          key={service}
                          type="button"
                          onClick={() => {
                            const currentServices = formData.services || [];
                            const newServices = isSelected
                              ? currentServices.filter((s) => s !== service)
                              : [...currentServices, service];
                            const newData = { ...formData, services: newServices };
                            setFormData(newData);
                            debouncedSave(newData);
                          }}
                          className={`px-3 py-1.5 text-sm rounded-full border transition cursor-pointer ${
                            isSelected
                              ? 'bg-action-primary text-button-primary border-primary'
                              : 'bg-page-secondary text-body border-default hover:border-primary'
                          }`}
                        >
                          {service}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted mt-3">
                    Wähle alle zutreffenden Services aus. Du kannst mehrere auswählen.
                  </p>
                </div>
              </div>
            </div>

            {/* Zeiten Section */}
            <div
              id="zeiten"
              className={`mb-12 ${
                activeSection === 'zeiten'
                  ? 'block animate-slide-in-right'
                  : activeSection === null && activeSidebarSection === 'zeiten'
                  ? 'block'
                  : 'hidden'
              }`}
            >
              <h2 className="text-xl font-bold text-heading mb-6 pt-6 lg:pt-0">Zeiten</h2>

              {/* Unsaved Changes Banner */}
              {hasUnsavedTimeChanges && (
                <div className="mb-6 p-4 rounded-lg border-2 animate-in fade-in duration-300" style={{
                  backgroundColor: 'rgba(139, 92, 246, 0.05)',
                  borderColor: 'var(--color-primary)',
                }}>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5" style={{
                      backgroundColor: 'var(--color-primary)',
                    }}>
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-heading mb-1">
                        Ungespeicherte Änderungen
                      </p>
                      <p className="text-xs text-muted">
                        Du hast Änderungen an deinen Verfügbarkeitszeiten vorgenommen, die noch nicht gespeichert wurden.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <AvailabilityScheduler
                value={tempAvailability}
                onChange={(value) => {
                  setTempAvailability(value);
                  setHasUnsavedTimeChanges(true);
                }}
              />

              {/* Save and Discard Buttons */}
              {hasUnsavedTimeChanges && (
                <div className="mt-6 flex gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <button
                    onClick={handleDiscardTimeChanges}
                    disabled={isSavingTime}
                    className="flex-1 sm:flex-none px-6 py-3 rounded-lg border border-default text-body font-medium transition-all hover:bg-page-secondary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Verwerfen
                  </button>
                  <button
                    onClick={handleSaveTimeChanges}
                    disabled={isSavingTime}
                    className="flex-1 sm:flex-none px-6 py-3 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: 'var(--color-primary)',
                    }}
                    onMouseEnter={(e) => !isSavingTime && (e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary)')}
                  >
                    {isSavingTime ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Speichert...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Änderungen speichern</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Treffpunkte Section */}
            <div
              id="treffpunkte"
              className={`mb-12 ${
                activeSection === 'treffpunkte'
                  ? 'block animate-slide-in-right'
                  : activeSection === null && activeSidebarSection === 'treffpunkte'
                  ? 'block'
                  : 'hidden'
              }`}
            >
              <h2 className="text-xl font-bold text-heading mb-6 pt-6 lg:pt-0">Treffpunkte</h2>
              <p className="text-muted text-sm mb-4">Wähle alle Orte aus, an denen du dich treffen möchtest.</p>
              <MeetingPointsSelector
                selectedPoints={formData.meetingPoints || []}
                onChange={(points) => {
                  const newData = { ...formData, meetingPoints: points };
                  setFormData(newData);
                  debouncedSave(newData);
                }}
              />
            </div>

            {/* Preise Section */}
            <div
              id="preise"
              className={`mb-12 ${
                activeSection === 'preise'
                  ? 'block animate-slide-in-right'
                  : activeSection === null && activeSidebarSection === 'preise'
                  ? 'block'
                  : 'hidden'
              }`}
            >
              <h2 className="text-xl font-bold text-heading mb-6 pt-6 lg:pt-0">Preise</h2>

              {/* 30 Minuten */}
              <div className="mb-4 lg:flex lg:items-center lg:gap-1">
                <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0  text-muted">
                  30 Minuten
                </label>
                <div className="lg:flex-1">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={formData.price30Min || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                        const newData = { ...formData, price30Min: value };
                        setFormData(newData);
                        debouncedSave(newData);
                      }}
                      className="w-full px-4 py-2 pr-10 rounded-lg border-depth bg-input text-body focus:outline-none focus:ring-2 focus:ring-action-primary"
                      placeholder="z.B. 150"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-sm">€</span>
                  </div>
                </div>
              </div>

              {/* 1 Stunde */}
              <div className="mb-4 lg:flex lg:items-center lg:gap-1">
                <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0  text-muted">
                  1 Stunde
                </label>
                <div className="lg:flex-1">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={formData.price1Hour || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                        const newData = { ...formData, price1Hour: value };
                        setFormData(newData);
                        debouncedSave(newData);
                      }}
                      className="w-full px-4 py-2 pr-10 rounded-lg border-depth bg-input text-body focus:outline-none focus:ring-2 focus:ring-action-primary"
                      placeholder="z.B. 250"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-sm">€</span>
                  </div>
                </div>
              </div>

              {/* 2 Stunden */}
              <div className="mb-4 lg:flex lg:items-center lg:gap-1">
                <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0  text-muted">
                  2 Stunden
                </label>
                <div className="lg:flex-1">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={formData.price2Hours || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                        const newData = { ...formData, price2Hours: value };
                        setFormData(newData);
                        debouncedSave(newData);
                      }}
                      className="w-full px-4 py-2 pr-10 rounded-lg border-depth bg-input text-body focus:outline-none focus:ring-2 focus:ring-action-primary"
                      placeholder="z.B. 450"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-sm">€</span>
                  </div>
                </div>
              </div>

              {/* 3 Stunden */}
              <div className="mb-4 lg:flex lg:items-center lg:gap-1">
                <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0  text-muted">
                  3 Stunden
                </label>
                <div className="lg:flex-1">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={formData.price3Hours || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                        const newData = { ...formData, price3Hours: value };
                        setFormData(newData);
                        debouncedSave(newData);
                      }}
                      className="w-full px-4 py-2 pr-10 rounded-lg border-depth bg-input text-body focus:outline-none focus:ring-2 focus:ring-action-primary"
                      placeholder="z.B. 600"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-sm">€</span>
                  </div>
                </div>
              </div>

              {/* 6 Stunden */}
              <div className="mb-4 lg:flex lg:items-center lg:gap-1">
                <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0  text-muted">
                  6 Stunden
                </label>
                <div className="lg:flex-1">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={formData.price6Hours || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                        const newData = { ...formData, price6Hours: value };
                        setFormData(newData);
                        debouncedSave(newData);
                      }}
                      className="w-full px-4 py-2 pr-10 rounded-lg border-depth bg-input text-body focus:outline-none focus:ring-2 focus:ring-action-primary"
                      placeholder="z.B. 1000"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-sm">€</span>
                  </div>
                </div>
              </div>

              {/* 12 Stunden */}
              <div className="mb-4 lg:flex lg:items-center lg:gap-1">
                <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0  text-muted">
                  12 Stunden
                </label>
                <div className="lg:flex-1">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={formData.price12Hours || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                        const newData = { ...formData, price12Hours: value };
                        setFormData(newData);
                        debouncedSave(newData);
                      }}
                      className="w-full px-4 py-2 pr-10 rounded-lg border-depth bg-input text-body focus:outline-none focus:ring-2 focus:ring-action-primary"
                      placeholder="z.B. 1800"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-sm">€</span>
                  </div>
                </div>
              </div>

              {/* 24 Stunden */}
              <div className="mb-4 lg:flex lg:items-center lg:gap-1">
                <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0  text-muted">
                  24 Stunden
                </label>
                <div className="lg:flex-1">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={formData.price24Hours || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                        const newData = { ...formData, price24Hours: value };
                        setFormData(newData);
                        debouncedSave(newData);
                      }}
                      className="w-full px-4 py-2 pr-10 rounded-lg border-depth bg-input text-body focus:outline-none focus:ring-2 focus:ring-action-primary"
                      placeholder="z.B. 3000"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-sm">€</span>
                  </div>
                </div>
              </div>

              {/* Übernachtung */}
              <div className="mb-4 lg:flex lg:items-center lg:gap-1">
                <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0  text-muted">
                  Übernachtung
                </label>
                <div className="lg:flex-1">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={formData.priceOvernight || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                        const newData = { ...formData, priceOvernight: value };
                        setFormData(newData);
                        debouncedSave(newData);
                      }}
                      className="w-full px-4 py-2 pr-10 rounded-lg border-depth bg-input text-body focus:outline-none focus:ring-2 focus:ring-action-primary"
                      placeholder="z.B. 2500"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-sm">€</span>
                  </div>
                </div>
              </div>

              {/* Wochenende */}
              <div className="mb-4 lg:flex lg:items-center lg:gap-1">
                <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0  text-muted">
                  Wochenende
                </label>
                <div className="lg:flex-1">
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={formData.priceWeekend || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                        const newData = { ...formData, priceWeekend: value };
                        setFormData(newData);
                        debouncedSave(newData);
                      }}
                      className="w-full px-4 py-2 pr-10 rounded-lg border-depth bg-input text-body focus:outline-none focus:ring-2 focus:ring-action-primary"
                      placeholder="z.B. 5000"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-sm">€</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div
              id="beschreibung"
              className={`mb-12 ${
                activeSection === 'beschreibung'
                  ? 'block animate-slide-in-right'
                  : activeSection === null && activeSidebarSection === 'beschreibung'
                  ? 'block'
                  : 'hidden'
              }`}
            >
              <h2 className="text-xl font-bold text-heading mb-6 pt-6 lg:pt-0">Beschreibung</h2>

              <div className="lg:flex lg:gap-1">
                <label className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0 lg:pt-3  text-muted">
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

            {/* Verifizierung Section */}
            <div
              id="verifizierung"
              className={`${
                activeSection === 'verifizierung'
                  ? 'block animate-slide-in-right'
                  : activeSection === null && activeSidebarSection === 'verifizierung'
                  ? 'block'
                  : 'hidden'
              }`}
            >
              <h2 className="text-xl font-bold text-heading mb-6 pt-6 lg:pt-0">Verifizierung</h2>
              <p className="text-muted text-sm">Verifizierungs-Felder werden hier hinzugefügt.</p>
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
              className="flex-shrink-0 text-muted hover:text-heading transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Profile Picture Upload Modal */}
      {showProfilePictureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-page-primary border border-[#2f3336] rounded-lg shadow-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            {/* Hidden File Input */}
            <input
              ref={profilePictureInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="hidden"
            />

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-heading">
                {modalView === 'choice' ? 'Profilbild ändern' : modalView === 'upload' ? 'Neues Foto hochladen' : 'Aus Galerie wählen'}
              </h2>
              <button
                onClick={() => {
                  setShowProfilePictureModal(false);
                  setProfilePicture(null);
                  setModalView('choice');
                }}
                className="text-muted hover:text-heading transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Choice View - Two Buttons */}
            {modalView === 'choice' && (
              <div className="space-y-4">
                <button
                  onClick={() => profilePictureInputRef.current?.click()}
                  className="w-full px-6 py-8 border-2 border-default rounded-lg hover:border-primary hover:bg-page-secondary transition-all cursor-pointer flex flex-col items-center gap-3"
                >
                  <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="text-center">
                    <p className="text-heading font-semibold text-lg">Neues Foto hochladen</p>
                    <p className="text-muted text-sm mt-1">Lade ein neues Bild von deinem Gerät hoch</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setModalView('gallery');
                    loadGalleryPhotos();
                  }}
                  className="w-full px-6 py-8 border-2 border-default rounded-lg hover:border-primary hover:bg-page-secondary transition-all cursor-pointer flex flex-col items-center gap-3"
                >
                  <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <div className="text-center">
                    <p className="text-heading font-semibold text-lg">Aus Galerie wählen</p>
                    <p className="text-muted text-sm mt-1">Wähle ein Foto aus deiner bestehenden Galerie</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowProfilePictureModal(false);
                    setModalView('choice');
                  }}
                  className="w-full btn-base btn-secondary cursor-pointer"
                >
                  Abbrechen
                </button>
              </div>
            )}

            {/* Upload View */}
            {modalView === 'upload' && (
              <div>
                <button
                  onClick={() => setModalView('choice')}
                  className="mb-4 text-action-primary hover:underline flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Zurück
                </button>

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
                      setModalView('choice');
                      setProfilePicture(null);
                    }}
                    className="flex-1 btn-base btn-secondary cursor-pointer"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="button"
                    onClick={handleUploadProfilePicture}
                    disabled={!profilePicture || uploadingPicture}
                    className="flex-1 btn-base btn-primary cursor-pointer"
                  >
                    {uploadingPicture ? 'Lädt hoch...' : 'Hochladen'}
                  </button>
                </div>
              </div>
            )}

            {/* Gallery View */}
            {modalView === 'gallery' && (
              <div>
                <button
                  onClick={() => setModalView('choice')}
                  className="mb-4 text-action-primary hover:underline flex items-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Zurück
                </button>

                {loadingGallery ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : galleryPhotos.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted">Keine Fotos in der Galerie</p>
                    <p className="text-sm text-muted mt-2">Lade zuerst Fotos in deine Galerie hoch</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {galleryPhotos.map((photo) => (
                      <button
                        key={photo.id}
                        onClick={() => handleSelectGalleryPhoto(photo.photoUrl)}
                        disabled={uploadingPicture}
                        className="aspect-square rounded-lg overflow-hidden border-2 border-default hover:border-primary transition cursor-pointer disabled:opacity-50 relative group"
                      >
                        <img
                          src={`http://localhost:4000${photo.photoUrl}`}
                          alt="Galerie Foto"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                          <Check className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {error && (
                  <div className="mt-4 p-3 rounded-lg bg-error-light border border-error">
                    <p className="text-error text-sm">{error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}