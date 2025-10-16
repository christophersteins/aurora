'use client';

import { useEffect, useState } from 'react';
import { escortService } from '@/services/escortService';
import { User } from '@/types/auth.types';
import { useRouter } from 'next/navigation';

export default function MembersPage() {
  const [escorts, setEscorts] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchEscorts = async () => {
      try {
        const data = await escortService.getAllEscorts();
        setEscorts(data);
      } catch (err) {
        setError('Fehler beim Laden der Escorts');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEscorts();
  }, []);

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
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Member Directory</h1>
          <p className="text-gray-600">Lädt...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Member Directory</h1>
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Member Directory</h1>
        
        {escorts.length === 0 ? (
          <p className="text-gray-600">Keine Escorts gefunden.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {escorts.map((escort) => {
              const age = calculateAge(escort.birthDate);
              
              return (
                <div
                  key={escort.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
                  onClick={() => router.push(`/profile/${escort.id}`)}
                >
                  {/* Profilbild */}
                  <div className="h-64 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                    {escort.profilePicture ? (
                      <img
                        src={escort.profilePicture}
                        alt={escort.username || 'Profilbild'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-white text-6xl font-bold">
                        {escort.firstName?.[0]?.toUpperCase() || escort.username?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h2 className="text-xl font-semibold mb-2">
                      {escort.firstName && escort.lastName
                        ? `${escort.firstName} ${escort.lastName}`
                        : escort.username || 'Unbekannt'}
                    </h2>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      {age && (
                        <p>🎂 {age} Jahre</p>
                      )}
                      <p>📍 Stadt unbekannt</p>
                      <p className="text-xs text-gray-400">@{escort.username}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}