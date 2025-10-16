'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { escortService } from '@/services/escortService';
import { User } from '@/types/auth.types';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [escort, setEscort] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const username = params.id as string; // params.id enthält jetzt den Username
        const data = await escortService.getEscortByUsername(username);
        setEscort(data);
      } catch (err) {
        setError('Fehler beim Laden des Profils');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [params.id]);

  const calculateAge = (birthDate: string | undefined): number | null => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-600">Lädt...</p>
        </div>
      </main>
    );
  }

  if (error || !escort) {
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="p-4 bg-red-50 border border-red-200 rounded mb-4">
            <p className="text-red-700">{error || 'Profil nicht gefunden'}</p>
          </div>
          <button
            onClick={() => router.push('/members')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Zurück zur Übersicht
          </button>
        </div>
      </main>
    );
  }

  const age = calculateAge(escort.birthDate);

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Zurück Button */}
        <button
          onClick={() => router.push('/members')}
          className="mb-6 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
        >
          ← Zurück
        </button>

        {/* Profil Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header mit Profilbild */}
          <div className="relative h-96 bg-gradient-to-br from-purple-400 to-pink-400">
            {escort.profilePicture ? (
              <img
                src={escort.profilePicture}
                alt={escort.username || 'Profilbild'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-white text-9xl font-bold">
                  {escort.firstName?.[0]?.toUpperCase() || escort.username?.[0]?.toUpperCase() || '?'}
                </div>
              </div>
            )}
          </div>

          {/* Profil Details */}
          <div className="p-8">
            {/* Name und Basis-Info */}
            <div className="mb-6">
              <h1 className="text-4xl font-bold mb-2">
                {escort.firstName && escort.lastName
                  ? `${escort.firstName} ${escort.lastName}`
                  : escort.username || 'Unbekannt'}
              </h1>
              <p className="text-gray-600 text-lg">@{escort.username}</p>
            </div>

            {/* Basis-Informationen */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-3">
                <h2 className="text-xl font-semibold mb-4">Basis-Informationen</h2>
                
                {age && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">🎂 Alter:</span>
                    <span className="font-medium">{age} Jahre</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-gray-600">📍 Stadt:</span>
                  <span className="font-medium">Stadt unbekannt</span>
                </div>

                {escort.nationalities && escort.nationalities.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">🌍 Nationalität:</span>
                    <span className="font-medium">{escort.nationalities.join(', ')}</span>
                  </div>
                )}

                {escort.languages && escort.languages.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">💬 Sprachen:</span>
                    <span className="font-medium">{escort.languages.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Aussehen */}
              <div className="space-y-3">
                <h2 className="text-xl font-semibold mb-4">Aussehen</h2>
                
                {escort.height && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">📏 Größe:</span>
                    <span className="font-medium">{escort.height} cm</span>
                  </div>
                )}

                {escort.weight && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">⚖️ Gewicht:</span>
                    <span className="font-medium">{escort.weight} kg</span>
                  </div>
                )}

                {escort.bodyType && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">💪 Körpertyp:</span>
                    <span className="font-medium">{escort.bodyType}</span>
                  </div>
                )}

                {escort.hairColor && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">💇 Haarfarbe:</span>
                    <span className="font-medium">{escort.hairColor}</span>
                  </div>
                )}

                {escort.eyeColor && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">👁️ Augenfarbe:</span>
                    <span className="font-medium">{escort.eyeColor}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Beschreibung */}
            {escort.description && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Über mich</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {escort.description}
                </p>
              </div>
            )}

            {/* Zusätzliche Details */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Weitere Details</h2>
              <div className="flex flex-wrap gap-4">
                {escort.hasTattoos && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    Tattoos
                  </span>
                )}
                {escort.hasPiercings && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    Piercings
                  </span>
                )}
                {escort.isSmoker && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    Raucher
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}