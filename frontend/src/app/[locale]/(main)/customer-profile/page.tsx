'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from '@/i18n/routing';
import { useEffect, useState } from 'react';
import { User, Mail, Camera, Save, X } from 'lucide-react';
import apiClient from '@/lib/api-client';
import ProfileAvatar from '@/components/ProfileAvatar';

export default function CustomerProfilePage() {
  const { isAuthenticated, user, _hasHydrated, setUser } = useAuthStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: ''
  });

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Update profile via API
      const response = await apiClient.patch('/users/profile', {
        username: formData.username,
        firstName: formData.firstName,
        lastName: formData.lastName
      });

      // Update local user state
      if (user) {
        setUser({
          ...user,
          username: formData.username,
          firstName: formData.firstName,
          lastName: formData.lastName
        });
      }

      setSuccessMessage('Profil erfolgreich aktualisiert!');
      setIsEditing(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Fehler beim Speichern des Profils');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to user data
    if (user) {
      setFormData({
        username: user.username || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      });
    }
    setIsEditing(false);
    setErrorMessage('');
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
    <div className="min-h-screen py-8">
      <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: 'var(--max-content-width)' }}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-heading mb-2">Mein Profil</h1>
          <p className="text-muted">Verwalte deine persönlichen Informationen</p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500">
            {errorMessage}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Picture */}
          <div className="lg:col-span-1">
            <div className="bg-page-secondary border border-default rounded-xl p-6">
              <h2 className="text-xl font-semibold text-heading mb-6">Profilbild</h2>

              {/* Profile Picture */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-40 h-40 rounded-full bg-gradient-to-r from-primary via-secondary to-primary p-1">
                    <div className="w-full h-full rounded-full bg-page-primary flex items-center justify-center overflow-hidden">
                      <ProfileAvatar
                        profilePicture={user?.profilePicture}
                        role={user?.role}
                        username={user?.username}
                        size="xl"
                        className="!w-full !h-full"
                      />
                    </div>
                  </div>

                  {/* Upload Button Overlay */}
                  <button className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <Camera className="w-8 h-8 text-white" />
                  </button>
                </div>

                <p className="text-sm text-muted mt-4 text-center">
                  Klicke auf das Bild, um es zu ändern
                </p>
              </div>

              {/* Account Info */}
              <div className="mt-8 pt-6 border-t border-default space-y-3">
                <div>
                  <p className="text-sm text-muted mb-1">Account-Typ</p>
                  <p className="text-body font-medium">Kunde</p>
                </div>
                <div>
                  <p className="text-sm text-muted mb-1">Mitglied seit</p>
                  <p className="text-body font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('de-DE') : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-page-secondary border border-default rounded-xl p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-heading">Persönliche Informationen</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-base btn-primary px-4 py-2 text-sm cursor-pointer"
                  >
                    Bearbeiten
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Username */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-body mb-2">
                    Benutzername
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-default rounded-lg bg-page-primary text-body focus:outline-none focus:border-primary transition disabled:opacity-60 disabled:cursor-not-allowed"
                    placeholder="Dein Benutzername"
                  />
                  <p className="text-sm text-muted mt-1">
                    Dein öffentlicher Benutzername auf der Plattform
                  </p>
                </div>

                {/* First Name */}
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-body mb-2">
                    Vorname
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-default rounded-lg bg-page-primary text-body focus:outline-none focus:border-primary transition disabled:opacity-60 disabled:cursor-not-allowed"
                    placeholder="Vorname"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-body mb-2">
                    Nachname
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-default rounded-lg bg-page-primary text-body focus:outline-none focus:border-primary transition disabled:opacity-60 disabled:cursor-not-allowed"
                    placeholder="Nachname"
                  />
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-body mb-2">
                    E-Mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full pl-11 pr-4 py-3 border border-default rounded-lg bg-page-primary text-body opacity-60 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-sm text-muted mt-1">
                    E-Mail-Adresse kann nicht geändert werden
                  </p>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="flex-1 btn-base btn-secondary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="w-4 h-4 mr-2 inline" />
                      Abbrechen
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 btn-base btn-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 mr-2 inline-block border-2 border-button-primary border-t-transparent rounded-full animate-spin" />
                          Speichern...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2 inline" />
                          Speichern
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Sections */}
            <div className="mt-6 bg-page-secondary border border-default rounded-xl p-6 md:p-8">
              <h2 className="text-xl font-semibold text-heading mb-4">Sicherheit</h2>
              <div className="space-y-4">
                <button className="w-full md:w-auto btn-base btn-secondary cursor-pointer">
                  Passwort ändern
                </button>
                <div className="pt-4 border-t border-default">
                  <p className="text-sm text-muted mb-3">
                    Möchtest du deinen Account löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                  </p>
                  <button className="btn-base bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20 cursor-pointer">
                    Account löschen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
