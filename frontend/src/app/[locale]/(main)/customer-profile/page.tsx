'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from '@/i18n/routing';
import { useEffect, useState, useCallback, useRef } from 'react';
import { User, Mail, ArrowLeft } from 'lucide-react';
import apiClient from '@/lib/api-client';
import ProfileAvatar from '@/components/ProfileAvatar';
import { profilePictureService } from '@/services/profilePictureService';

export default function CustomerProfilePage() {
  const { isAuthenticated, user, _hasHydrated, setUser } = useAuthStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const profilePictureInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: ''
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

  // Define sections array
  const sections = [
    { id: 'persoenliche-daten', label: 'Persönliche Daten', icon: User },
    { id: 'kontakt', label: 'Kontaktinformationen', icon: Mail },
  ];

  useEffect(() => {
    if (!_hasHydrated) {
      return;
    }

    if (!isAuthenticated) {
      router.push('/login');
    } else {
      setIsChecking(false);
      // Initialize form data with user data
      if (user) {
        setFormData({
          username: user.username || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || ''
        });
      }
    }
  }, [isAuthenticated, _hasHydrated, router, user]);

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

  // Auto-save function with debouncing
  const autoSave = useCallback(async (dataToSave: any) => {
    setIsSaving(true);
    setErrorMessage('');

    try {
      // Filter out empty strings and undefined values
      const cleanedData: any = {};

      Object.entries(dataToSave).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          cleanedData[key] = value;
        }
      });

      const response = await apiClient.patch('/users/profile', cleanedData);

      // Update local user state
      if (user) {
        setUser({
          ...user,
          ...cleanedData
        });
      }

      setSuccessMessage('Profil erfolgreich gespeichert!');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Fehler beim Speichern des Profils');
    } finally {
      setIsSaving(false);
    }
  }, [user, setUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedData = {
      ...formData,
      [name]: value
    };
    setFormData(updatedData);

    // Debounce auto-save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      autoSave(updatedData);
    }, 1000);
  };

  const handleTabClick = (sectionId: string) => {
    setActiveSidebarSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfilePicture(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicturePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload immediately
    setUploadingPicture(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/users/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (user) {
        setUser({
          ...user,
          profilePicture: response.data.profilePicture,
        });
      }

      setShowProfilePictureModal(false);
      setSuccessMessage('Profilbild erfolgreich hochgeladen!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Fehler beim Hochladen des Profilbilds');
    } finally {
      setUploadingPicture(false);
    }
  };

  if (!_hasHydrated || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-body">Lädt...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto px-4 sm:px-6 lg:px-0 py-8" style={{ maxWidth: 'var(--max-content-width)' }}>
        {/* Überschrift mit Button - Desktop Layout */}
        <div className="hidden lg:flex lg:items-center lg:justify-between mb-6">
          <h1 className="text-3xl font-bold text-heading">Profil bearbeiten</h1>
        </div>

        {/* Überschrift - Mobile/Tablet */}
        <h1 className="text-3xl font-bold text-heading mb-6 lg:hidden">Profil bearbeiten</h1>

      {/* Profile Picture Section - Mobile/Tablet only, shown above menu */}
      <div className="mb-6 lg:hidden">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div
              className="cursor-pointer transition-opacity hover:opacity-80 flex-shrink-0"
              onClick={() => setShowProfilePictureModal(true)}
            >
              <ProfileAvatar
                profilePicture={user?.profilePicture}
                role={user?.role}
                username={user?.username}
                size="lg"
              />
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

      <div className="lg:flex lg:gap-6">
        {/* Sidebar Navigation - Desktop only - Sticky Position */}
        <aside className="hidden lg:block lg:w-64 lg:flex-shrink-0 lg:sticky lg:top-24 lg:self-start border border-[#2f3336] shadow-md bg-page-primary rounded-lg lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
          <nav>
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSidebarSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => handleTabClick(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-4 text-sm font-medium transition-colors cursor-pointer group text-body ${
                    isActive
                      ? 'bg-page-secondary'
                      : 'hover:bg-page-secondary/50'
                  }`}
                  style={{
                    borderRadius: 0
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
          <div className={`bg-page-primary border border-[#2f3336] shadow-md rounded-lg ${activeSection !== null ? 'p-0 border-0 shadow-none rounded-none lg:p-6 lg:border lg:shadow-md lg:rounded-lg' : 'p-6'}`}>
            {/* Saving indicator - only shown while saving */}
            {isSaving && (
              <div className="flex items-center justify-end mb-6">
                <span className="flex items-center gap-2 text-sm text-muted">
                  <span className="w-4 h-4 border-2 border-muted border-t-transparent rounded-full animate-spin"></span>
                  Speichert...
                </span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500">
                {successMessage}
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500">
                {errorMessage}
              </div>
            )}

            {/* Profile Picture Section - Desktop only */}
            <div
              id="profilbild"
              className="mb-8 scroll-mt-8 hidden lg:block"
            >
              <div className="flex items-center gap-4">
                <div
                  className="cursor-pointer transition-opacity hover:opacity-80 flex-shrink-0"
                  onClick={() => setShowProfilePictureModal(true)}
                >
                  <ProfileAvatar
                    profilePicture={user?.profilePicture}
                    role={user?.role}
                    username={user?.username}
                    size="lg"
                  />
                </div>
                <div>
                  <p className="text-heading text-base font-medium mb-1">
                    {user?.username || user?.email}
                  </p>
                  <button
                    onClick={() => setShowProfilePictureModal(true)}
                    className="text-sm text-action-primary hover:text-action-primary-hover transition-colors cursor-pointer"
                  >
                    Profilbild ändern
                  </button>
                </div>
              </div>
            </div>

            {/* Persönliche Daten Section */}
            {(activeSection === 'persoenliche-daten' || activeSection === null) && (
              <div id="persoenliche-daten" className="scroll-mt-8 mb-12">
                <h2 className="text-xl font-bold text-heading mb-6 pt-6 lg:pt-0">Persönliche Daten</h2>

                <div className="space-y-4">
                  {/* Username */}
                  <div className="mb-4 lg:flex lg:items-center lg:gap-1">
                    <label htmlFor="username" className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0 text-muted">
                      Benutzername
                    </label>
                    <div className="lg:flex-1">
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg border bg-page-primary text-body border-default focus:outline-none"
                        placeholder="Dein Benutzername"
                      />
                      <p className="text-sm text-muted mt-1">
                        Dein öffentlicher Benutzername auf der Plattform
                      </p>
                    </div>
                  </div>

                  {/* First Name */}
                  <div className="mb-4 lg:flex lg:items-center lg:gap-1">
                    <label htmlFor="firstName" className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0 text-muted">
                      Vorname
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full lg:flex-1 px-4 py-3 rounded-lg border bg-page-primary text-body border-default focus:outline-none"
                      placeholder="Vorname"
                    />
                  </div>

                  {/* Last Name */}
                  <div className="mb-4 lg:flex lg:items-center lg:gap-1">
                    <label htmlFor="lastName" className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0 text-muted">
                      Nachname
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full lg:flex-1 px-4 py-3 rounded-lg border bg-page-primary text-body border-default focus:outline-none"
                      placeholder="Nachname"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Kontaktinformationen Section */}
            {(activeSection === 'kontakt' || activeSection === null) && (
              <div id="kontakt" className="scroll-mt-8 mb-12">
                <h2 className="text-xl font-bold text-heading mb-6 pt-6 lg:pt-0">Kontaktinformationen</h2>

                <div className="space-y-4">
                  {/* Email (Read-only) */}
                  <div className="mb-4 lg:flex lg:items-center lg:gap-1">
                    <label htmlFor="email" className="block text-sm mb-2 lg:mb-0 lg:w-48 lg:flex-shrink-0 text-muted">
                      E-Mail
                    </label>
                    <div className="lg:flex-1">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted" />
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          disabled
                          className="w-full pl-11 pr-4 py-3 rounded-lg border bg-page-primary text-body border-default opacity-60 cursor-not-allowed"
                        />
                      </div>
                      <p className="text-sm text-muted mt-1">
                        E-Mail-Adresse kann nicht geändert werden
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Picture Upload Modal */}
      {showProfilePictureModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setShowProfilePictureModal(false)}
        >
          <div
            className="bg-page-primary border border-default rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold text-heading mb-4">Profilbild ändern</h3>

            <div className="space-y-4">
              <button
                onClick={() => profilePictureInputRef.current?.click()}
                className="w-full btn-base btn-primary"
                disabled={uploadingPicture}
              >
                {uploadingPicture ? 'Lädt hoch...' : 'Foto hochladen'}
              </button>

              <button
                onClick={() => setShowProfilePictureModal(false)}
                className="w-full btn-base btn-secondary"
              >
                Abbrechen
              </button>
            </div>

            <input
              ref={profilePictureInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="hidden"
            />
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
