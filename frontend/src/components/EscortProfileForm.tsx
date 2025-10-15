'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { escortProfileService } from '@/services/escortProfileService';
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

  const [formData, setFormData] = useState<UpdateEscortProfileDto>({
    birthDate: user?.birthDate || '',
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
    description: user?.description || '',
  });

  const [age, setAge] = useState<number | null>(null);

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

  const toggleNationality = (nationality: string) => {
    setFormData((prev) => {
      const current = prev.nationalities || [];
      if (current.includes(nationality)) {
        return { ...prev, nationalities: current.filter((n) => n !== nationality) };
      } else {
        return { ...prev, nationalities: [...current, nationality] };
      }
    });
  };

  const toggleLanguage = (language: string) => {
    setFormData((prev) => {
      const current = prev.languages || [];
      if (current.includes(language)) {
        return { ...prev, languages: current.filter((l) => l !== language) };
      } else {
        return { ...prev, languages: [...current, language] };
      }
    });
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

        {/* Nationalitäten (Mehrfachauswahl) */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Nationalitäten (Mehrfachauswahl)
          </label>
          <div className="border rounded p-3 max-h-48 overflow-y-auto">
            {NATIONALITIES.map((nationality) => (
              <label key={nationality} className="flex items-center mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.nationalities?.includes(nationality)}
                  onChange={() => toggleNationality(nationality)}
                  className="mr-2"
                />
                <span>{nationality}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Sprachen (Mehrfachauswahl) */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Sprachen (Mehrfachauswahl)
          </label>
          <div className="border rounded p-3 max-h-48 overflow-y-auto">
            {LANGUAGES.map((language) => (
              <label key={language} className="flex items-center mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.languages?.includes(language)}
                  onChange={() => toggleLanguage(language)}
                  className="mr-2"
                />
                <span>{language}</span>
              </label>
            ))}
          </div>
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

        {/* Tattoos */}
        <div className="flex items-center">
          <label className="flex items-center cursor-pointer">
            <span className="mr-3 text-sm font-medium">Tattoos</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={formData.hasTattoos}
                onChange={(e) => setFormData({ ...formData, hasTattoos: e.target.checked })}
                className="sr-only"
              />
              <div
                className={`block w-14 h-8 rounded-full ${
                  formData.hasTattoos ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              ></div>
              <div
                className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${
                  formData.hasTattoos ? 'transform translate-x-6' : ''
                }`}
              ></div>
            </div>
          </label>
        </div>

        {/* Piercings */}
        <div className="flex items-center">
          <label className="flex items-center cursor-pointer">
            <span className="mr-3 text-sm font-medium">Piercings</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={formData.hasPiercings}
                onChange={(e) => setFormData({ ...formData, hasPiercings: e.target.checked })}
                className="sr-only"
              />
              <div
                className={`block w-14 h-8 rounded-full ${
                  formData.hasPiercings ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              ></div>
              <div
                className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${
                  formData.hasPiercings ? 'transform translate-x-6' : ''
                }`}
              ></div>
            </div>
          </label>
        </div>

        {/* Beschreibung */}
        <div>
          <label className="block text-sm font-medium mb-2">Beschreibung</label>
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