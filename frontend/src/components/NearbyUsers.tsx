'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';

interface User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
}

export default function NearbyUsers() {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [radius, setRadius] = useState<number>(5);
  const [nearbyUsers, setNearbyUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (err) => {
          setError(`Fehler beim Abrufen der Position: ${err.message}`);
        }
      );
    } else {
      setError('Geolocation wird von diesem Browser nicht unterstützt');
    }
  }, []);

  const searchNearbyUsers = async () => {
    if (!latitude || !longitude) {
      setError('Position nicht verfügbar');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/users/nearby', {
        params: {
          latitude,
          longitude,
          radius,
        },
      });
      setNearbyUsers(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Fehler beim Suchen der Benutzer';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Benutzer in deiner Nähe</h2>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Deine Position: {latitude && longitude 
            ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` 
            : 'Wird ermittelt...'}
        </p>

        <label className="block text-sm font-medium text-gray-700 mb-2">
          Radius: {radius} km
        </label>
        <div className="flex gap-2">
          {[1, 5, 10, 25, 50].map((r) => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className={`px-3 py-1 rounded ${
                radius === r
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {r} km
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={searchNearbyUsers}
        disabled={loading || !latitude || !longitude}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 mb-4"
      >
        {loading ? 'Suche...' : 'Benutzer suchen'}
      </button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-3">
          {nearbyUsers.length} Benutzer gefunden
        </h3>
        
        {nearbyUsers.length === 0 && !loading && (
          <p className="text-gray-500">Keine Benutzer in diesem Umkreis gefunden.</p>
        )}

        <div className="space-y-3">
          {nearbyUsers.map((user) => (
            <div
              key={user.id}
              className="p-4 border rounded-lg hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                  {user.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </div>
                
                <div>
                  <p className="font-semibold">
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.username || 'Unbekannt'}
                  </p>
                  <p className="text-sm text-gray-600">@{user.username || user.email}</p>
                  {user.location && (
                    <p className="text-xs text-gray-500">
                      📍 {user.location.coordinates[1].toFixed(4)}, {user.location.coordinates[0].toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}