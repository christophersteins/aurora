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
        const username = params.id as string;
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
      <main className="min-h-screen p-8" style={{ background: 'var(--background-primary)' }}>
        <div className="max-w-4xl mx-auto">
          <p style={{ color: 'var(--text-secondary)' }}>Lädt...</p>
        </div>
      </main>
    );
  }

  if (error || !escort) {
    return (
      <main className="min-h-screen p-8" style={{ background: 'var(--background-primary)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="p-4 rounded-lg mb-4 border-depth" style={{ background: 'var(--background-secondary)', borderColor: 'var(--color-primary)' }}>
            <p style={{ color: 'var(--color-primary)' }}>{error || 'Profil nicht gefunden'}</p>
          </div>
          <button
            onClick={() => router.push('/members')}
            className="btn-base btn-primary"
          >
            Zurück zur Übersicht
          </button>
        </div>
      </main>
    );
  }

  const age = calculateAge(escort.birthDate);

  return (
    <main className="min-h-screen p-8" style={{ background: 'var(--background-primary)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/members')}
          className="mb-6 btn-base btn-secondary"
        >
          ← Zurück
        </button>

        {/* Profile Card */}
        <div className="rounded-lg overflow-hidden border-depth" style={{ background: 'var(--background-secondary)' }}>
          {/* Header with Profile Picture */}
          <div className="relative h-96" style={{ 
            background: 'linear-gradient(135deg, var(--gradient-cyan) 0%, var(--gradient-blue) 50%, var(--gradient-purple) 100%)'
          }}>
            {escort.profilePicture ? (
              <img
                src={escort.profilePicture}
                alt={escort.username || 'Profilbild'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-9xl font-bold gradient-text">
                  {escort.firstName?.[0]?.toUpperCase() || escort.username?.[0]?.toUpperCase() || '?'}
                </div>
              </div>
            )}
          </div>

          {/* Profile Details */}
          <div className="p-8">
            {/* Name and Basic Info */}
            <div className="mb-6">
              <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-heading)' }}>
                {escort.firstName && escort.lastName
                  ? `${escort.firstName} ${escort.lastName}`
                  : escort.username || 'Unbekannt'}
              </h1>
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>@{escort.username}</p>
            </div>

            {/* Basic Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-3">
                <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-heading)' }}>
                  Basis-Informationen
                </h2>
                
                {age && (
                  <div className="flex items-center gap-2">
                    <span style={{ color: 'var(--text-secondary)' }}>🎂 Alter:</span>
                    <span className="font-medium" style={{ color: 'var(--text-regular)' }}>{age} Jahre</span>
                  </div>
                )}

                {escort.nationalities && escort.nationalities.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span style={{ color: 'var(--text-secondary)' }}>🌍 Nationalität:</span>
                    <span className="font-medium" style={{ color: 'var(--text-regular)' }}>
                      {escort.nationalities.join(', ')}
                    </span>
                  </div>
                )}

                {escort.languages && escort.languages.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span style={{ color: 'var(--text-secondary)' }}>💬 Sprachen:</span>
                    <span className="font-medium" style={{ color: 'var(--text-regular)' }}>
                      {escort.languages.join(', ')}
                    </span>
                  </div>
                )}

                {escort.type && (
                  <div className="flex items-center gap-2">
                    <span style={{ color: 'var(--text-secondary)' }}>✨ Typ:</span>
                    <span className="font-medium" style={{ color: 'var(--text-regular)' }}>{escort.type}</span>
                  </div>
                )}
              </div>

              {/* Physical Attributes */}
              <div className="space-y-3">
                <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-heading)' }}>
                  Aussehen
                </h2>

                {escort.height && (
                  <div className="flex items-center gap-2">
                    <span style={{ color: 'var(--text-secondary)' }}>📏 Größe:</span>
                    <span className="font-medium" style={{ color: 'var(--text-regular)' }}>{escort.height} cm</span>
                  </div>
                )}

                {escort.weight && (
                  <div className="flex items-center gap-2">
                    <span style={{ color: 'var(--text-secondary)' }}>⚖️ Gewicht:</span>
                    <span className="font-medium" style={{ color: 'var(--text-regular)' }}>{escort.weight} kg</span>
                  </div>
                )}

                {escort.bodyType && (
                  <div className="flex items-center gap-2">
                    <span style={{ color: 'var(--text-secondary)' }}>💃 Figur:</span>
                    <span className="font-medium" style={{ color: 'var(--text-regular)' }}>{escort.bodyType}</span>
                  </div>
                )}

                {escort.cupSize && (
                  <div className="flex items-center gap-2">
                    <span style={{ color: 'var(--text-secondary)' }}>👗 Oberweite:</span>
                    <span className="font-medium" style={{ color: 'var(--text-regular)' }}>{escort.cupSize}</span>
                  </div>
                )}

                {escort.hairColor && (
                  <div className="flex items-center gap-2">
                    <span style={{ color: 'var(--text-secondary)' }}>💇 Haarfarbe:</span>
                    <span className="font-medium" style={{ color: 'var(--text-regular)' }}>{escort.hairColor}</span>
                  </div>
                )}

                {escort.hairLength && (
                  <div className="flex items-center gap-2">
                    <span style={{ color: 'var(--text-secondary)' }}>✂️ Haarlänge:</span>
                    <span className="font-medium" style={{ color: 'var(--text-regular)' }}>{escort.hairLength}</span>
                  </div>
                )}

                {escort.eyeColor && (
                  <div className="flex items-center gap-2">
                    <span style={{ color: 'var(--text-secondary)' }}>👁️ Augenfarbe:</span>
                    <span className="font-medium" style={{ color: 'var(--text-regular)' }}>{escort.eyeColor}</span>
                  </div>
                )}

                {escort.intimateHair && (
                  <div className="flex items-center gap-2">
                    <span style={{ color: 'var(--text-secondary)' }}>🌸 Intimbereich:</span>
                    <span className="font-medium" style={{ color: 'var(--text-regular)' }}>{escort.intimateHair}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="mb-8 space-y-3">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-heading)' }}>
                Weitere Informationen
              </h2>

              <div className="flex flex-wrap gap-3">
                {escort.hasTattoos && (
                  <span className="px-4 py-2 rounded-full text-sm font-medium border-depth" 
                    style={{ 
                      background: 'var(--background-primary)', 
                      color: 'var(--color-primary)',
                      borderColor: 'var(--color-primary)'
                    }}>
                    🎨 Tattoos
                  </span>
                )}

                {escort.hasPiercings && (
                  <span className="px-4 py-2 rounded-full text-sm font-medium border-depth" 
                    style={{ 
                      background: 'var(--background-primary)', 
                      color: 'var(--color-secondary)',
                      borderColor: 'var(--color-secondary)'
                    }}>
                    💎 Piercings
                  </span>
                )}

                {escort.isSmoker && (
                  <span className="px-4 py-2 rounded-full text-sm font-medium border-depth" 
                    style={{ 
                      background: 'var(--background-primary)', 
                      color: 'var(--color-tertiary)',
                      borderColor: 'var(--color-tertiary)'
                    }}>
                    🚬 Raucher/in
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {escort.description && (
              <div>
                <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-heading)' }}>
                  Über mich
                </h2>
                <p className="leading-relaxed" style={{ color: 'var(--text-regular)' }}>
                  {escort.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}