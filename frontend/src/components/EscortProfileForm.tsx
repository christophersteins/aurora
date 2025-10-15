'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { escortProfileService } from '@/services/escortProfileService';
import { profilePictureService } from '@/services/profilePictureService';
import { UpdateEscortProfileDto } from '@/types/auth.types';
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

  // Funktion zum Formatieren des Datums für das Input-Feld
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

  // Profilbild States
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(
    user?.profilePicture ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${user.profilePicture}` : null
  );
  const [uploadingPicture, setUploadingPicture] = useState(false);

  // Berechne Alter basierend auf Geburtsdatum
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
    } catch (err: any) {
      setError(err.response?.data?.message || 'Fehler beim Speichern des Profils');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      
      // Erstelle Vorschau
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
      
      // Aktualisiere User im Store
      if (user) {
        setUser({ ...user, profilePicture: result.profilePicture });
      }
      
      setProfilePicturePreview(fullUrl);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Fehler beim Hochladen des Profilbilds');
    } finally {
      setUploadingPicture(false);
    }
  };

  if (user?.role !== 'escort') {
    return (
      <div className="p-6 border rounded-lg bg-white shadow-sm">
        <p className="text-red-600">Nur Benutzer mit der Rolle "Escort" können dieses Profil bearbeiten.</p>
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Escort-Profil bearbeiten</h2>

      {/* Profilbild Upload */}
      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-4">Profilbild</h3>
        
        <div className="flex items-start gap-6">
          {/* Vorschau */}
          <div className="flex-shrink-0">
            {profilePicturePreview ? (
              <img
                src={profilePicturePreview}
                alt="Profilbild Vorschau"
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 border-4 border-white shadow-lg">
                <span className="text-4xl">👤</span>
              </div>
            )}
          </div>

          {/* Upload Controls */}
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-3"
            />
            
            {profilePicture && (
              <button
                type="button"
                onClick={handleUploadProfilePicture}
                disabled={uploadingPicture}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {uploadingPicture ? 'Wird hochgeladen...' : 'Profilbild hochladen'}
              </button>
            )}
            
            <p className="text-xs text-gray-500 mt-2">
              Erlaubte Formate: JPG, PNG, GIF, WebP (max. 5MB)
            </p>
          </div>
        </div>
      </div>

      {success && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          Profil erfolgreich aktualisiert!
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Geburtsdatum */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Geburtsdatum {age !== null && <span className="text-gray-600">({age} Jahre)</span>}
          </label>
          <input
            type="date"
            value={formData.birthDate}
            onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Nationalität (Mehrfachauswahl mit Select) */}
        <div>
          <label className="block text-sm font-medium mb-2">Nationalität</label>
          <select
            multiple
            value={formData.nationalities || []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              setFormData({ ...formData, nationalities: selected });
            }}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            size={5}
          >
            {NATIONALITIES.map((nationality) => (
              <option key={nationality} value={nationality}>
                {nationality}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Halte Strg (Windows) oder Cmd (Mac) gedrückt, um mehrere auszuwählen
          </p>
        </div>

        {/* Sprachen (Mehrfachauswahl mit Select) */}
        <div>
          <label className="block text-sm font-medium mb-2">Sprachen</label>
          <select
            multiple
            value={formData.languages || []}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, option => option.value);
              setFormData({ ...formData, languages: selected });
            }}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            size={5}
          >
            {LANGUAGES.map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Halte Strg (Windows) oder Cmd (Mac) gedrückt, um mehrere auszuwählen
          </p>
        </div>

        {/* Größe */}
        <div>
          <label className="block text-sm font-medium mb-2">Größe (cm)</label>
          <select
            value={formData.height || ''}
            onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Bitte wählen</option>
            {HEIGHTS.map((height) => (
              <option key={height} value={height}>
                {height} cm
              </option>
            ))}
          </select>
        </div>

        {/* Gewicht */}
        <div>
          <label className="block text-sm font-medium mb-2">Gewicht (kg)</label>
          <select
            value={formData.weight || ''}
            onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Bitte wählen</option>
            {WEIGHTS.map((weight) => (
              <option key={weight} value={weight}>
                {weight} kg
              </option>
            ))}
          </select>
        </div>

        {/* Figur */}
        <div>
          <label className="block text-sm font-medium mb-2">Figur</label>
          <select
            value={formData.bodyType || ''}
            onChange={(e) => setFormData({ ...formData, bodyType: e.target.value })}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Bitte wählen</option>
            {BODY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Körbchengröße */}
        <div>
          <label className="block text-sm font-medium mb-2">Körbchengröße</label>
          <select
            value={formData.cupSize || ''}
            onChange={(e) => setFormData({ ...formData, cupSize: e.target.value })}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Bitte wählen</option>
            {CUP_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* Haarfarbe */}
        <div>
          <label className="block text-sm font-medium mb-2">Haarfarbe</label>
          <select
            value={formData.hairColor || ''}
            onChange={(e) => setFormData({ ...formData, hairColor: e.target.value })}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Bitte wählen</option>
            {HAIR_COLORS.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>

        {/* Haarlänge */}
        <div>
          <label className="block text-sm font-medium mb-2">Haarlänge</label>
          <select
            value={formData.hairLength || ''}
            onChange={(e) => setFormData({ ...formData, hairLength: e.target.value })}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Bitte wählen</option>
            {HAIR_LENGTHS.map((length) => (
              <option key={length} value={length}>
                {length}
              </option>
            ))}
          </select>
        </div>

        {/* Augenfarbe */}
        <div>
          <label className="block text-sm font-medium mb-2">Augenfarbe</label>
          <select
            value={formData.eyeColor || ''}
            onChange={(e) => setFormData({ ...formData, eyeColor: e.target.value })}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Bitte wählen</option>
            {EYE_COLORS.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>

        {/* Raucher/in */}
        <div>
          <label className="block text-sm font-medium mb-2">Raucher/in</label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="isSmoker"
                checked={formData.isSmoker === false}
                onChange={() => setFormData({ ...formData, isSmoker: false })}
                className="mr-2"
              />
              <span>Nein</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="isSmoker"
                checked={formData.isSmoker === true}
                onChange={() => setFormData({ ...formData, isSmoker: true })}
                className="mr-2"
              />
              <span>Ja</span>
            </label>
          </div>
        </div>

        {/* Tattoos */}
        <div>
          <label className="block text-sm font-medium mb-2">Tattoos</label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="hasTattoos"
                checked={formData.hasTattoos === false}
                onChange={() => setFormData({ ...formData, hasTattoos: false })}
                className="mr-2"
              />
              <span>Nein</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="hasTattoos"
                checked={formData.hasTattoos === true}
                onChange={() => setFormData({ ...formData, hasTattoos: true })}
                className="mr-2"
              />
              <span>Ja</span>
            </label>
          </div>
        </div>

        {/* Piercings */}
        <div>
          <label className="block text-sm font-medium mb-2">Piercings</label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="hasPiercings"
                checked={formData.hasPiercings === false}
                onChange={() => setFormData({ ...formData, hasPiercings: false })}
                className="mr-2"
              />
              <span>Nein</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="hasPiercings"
                checked={formData.hasPiercings === true}
                onChange={() => setFormData({ ...formData, hasPiercings: true })}
                className="mr-2"
              />
              <span>Ja</span>
            </label>
          </div>
        </div>

        {/* Über mich */}
        <div>
          <label className="block text-sm font-medium mb-2">Über mich</label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={6}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Erzähle etwas über dich..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Wird gespeichert...' : 'Profil speichern'}
        </button>
      </form>
    </div>
  );
}