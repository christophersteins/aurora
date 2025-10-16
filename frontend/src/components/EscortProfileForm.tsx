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
      <div className="p-6 border rounded-lg bg-white shadow-sm">
        <p className="text-red-600">Nur Benutzer mit der Rolle &quot;Escort&quot; können dieses Profil bearbeiten.</p>
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Escort-Profil bearbeiten</h2>

      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-4">Profilbild</h3>
        
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            {profilePicturePreview ? (
              <img
                src={profilePicturePreview}
                alt="Profilbild Vorschau"
                className="w-32 h-32 object-cover rounded-full"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-400">Kein Bild</span>
              </div>
            )}
          </div>

          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="mb-3 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-purple-50 file:text-purple-700
                hover:file:bg-purple-100"
            />
            <button
              type="button"
              onClick={handleUploadProfilePicture}
              disabled={!profilePicture || uploadingPicture}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {uploadingPicture ? 'Lädt hoch...' : 'Profilbild hochladen'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700">Profil erfolgreich gespeichert!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Geburtsdatum {age !== null && <span className="text-gray-500">({age} Jahre)</span>}
          </label>
          <input
            type="date"
            value={formData.birthDate || ''}
            onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nationalitäten
          </label>
          <MultiSelectDropdown
            options={NATIONALITIES}
            selectedValues={formData.nationalities || []}
            onChange={(values) => setFormData({ ...formData, nationalities: values })}
            placeholder="Wähle Nationalitäten"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sprachen
          </label>
          <MultiSelectDropdown
            options={LANGUAGES}
            selectedValues={formData.languages || []}
            onChange={(values) => setFormData({ ...formData, languages: values })}
            placeholder="Wähle Sprachen"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Größe (cm)
            </label>
            <select
              value={formData.height || ''}
              onChange={(e) => setFormData({ ...formData, height: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Bitte wählen</option>
              {HEIGHTS.map((h) => (
                <option key={h} value={h}>{h} cm</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gewicht (kg)
            </label>
            <select
              value={formData.weight || ''}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Bitte wählen</option>
              {WEIGHTS.map((w) => (
                <option key={w} value={w}>{w} kg</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Körpertyp
            </label>
            <select
              value={formData.bodyType || ''}
              onChange={(e) => setFormData({ ...formData, bodyType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Bitte wählen</option>
              {BODY_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Körbchengröße
            </label>
            <select
              value={formData.cupSize || ''}
              onChange={(e) => setFormData({ ...formData, cupSize: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Bitte wählen</option>
              {CUP_SIZES.map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Haarfarbe
            </label>
            <select
              value={formData.hairColor || ''}
              onChange={(e) => setFormData({ ...formData, hairColor: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Bitte wählen</option>
              {HAIR_COLORS.map((color) => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Haarlänge
            </label>
            <select
              value={formData.hairLength || ''}
              onChange={(e) => setFormData({ ...formData, hairLength: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Bitte wählen</option>
              {HAIR_LENGTHS.map((length) => (
                <option key={length} value={length}>{length}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Augenfarbe
            </label>
            <select
              value={formData.eyeColor || ''}
              onChange={(e) => setFormData({ ...formData, eyeColor: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Bitte wählen</option>
              {EYE_COLORS.map((color) => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.hasTattoos}
              onChange={(e) => setFormData({ ...formData, hasTattoos: e.target.checked })}
              className="w-4 h-4 text-purple-500 border-gray-300 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Hat Tattoos</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.hasPiercings}
              onChange={(e) => setFormData({ ...formData, hasPiercings: e.target.checked })}
              className="w-4 h-4 text-purple-500 border-gray-300 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Hat Piercings</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isSmoker}
              onChange={(e) => setFormData({ ...formData, isSmoker: e.target.checked })}
              className="w-4 h-4 text-purple-500 border-gray-300 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">Raucher/in</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Beschreibung
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="Beschreibe dich selbst..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
        >
          {loading ? 'Speichert...' : 'Profil speichern'}
        </button>
      </form>
    </div>
  );
}