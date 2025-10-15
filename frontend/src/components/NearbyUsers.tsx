'use client';

import { useState, useEffect } from 'react';
import { geolocationService } from '@/services/geolocationService';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useAuthStore } from '@/store/authStore';

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
  const { user, token, isAuthenticated } = useAuthStore();
  const [radius, setRadius] = useState(10);
  const [nearbyUsers, setNearbyUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { latitude, longitude, requestLocation } = useGeolocation();

  const searchNearbyUsers = async () => {
    if (!isAuthenticated || !token || !user) {
      setError('Bitte logge dich ein.');
      return;
    }

    if (!latitude || !longitude) {
      setError('Keine Standortdaten verfügbar. Bitte Standort abrufen.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const users = await geolocationService.getNearbyUsers(
        latitude,
        longitude,
        radius,
        token,
        user.id
      );
      setNearbyUsers(users);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Fehler beim Laden der Benutzer');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (latitude && longitude && isAuthenticated) {
      searchNearbyUsers();
    }
  }, [latitude, longitude, radius, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="p-6 border rounded-lg bg-white shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Benutzer in der Nähe</h2>
        <p className="text-gray-600">Bitte logge dich ein, um Benutzer in deiner Nähe zu finden.</p>
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Benutzer in der Nähe</h2>

      {/* Standort abrufen */}
      <div className="mb-4">
        <button
          onClick={requestLocation}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Standort abrufen
        </button>
        {latitude && longitude && (
          <p className="text-sm text-gray-600 mt-2">
            📍 Dein Standort: {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </p>
        )}
      </div>

      {/* Radius-Auswahl */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Umkreis: {radius} km
        </label>
        <div className="flex gap-2 flex-wrap">
          {[5, 10, 20, 50, 100, 500].map((r) => (
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

      {/* Suchen Button */}
      <button
        onClick={searchNearbyUsers}
        disabled={loading || !latitude || !longitude}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 mb-4"
      >
        {loading ? 'Suche...' : 'Benutzer suchen'}
      </button>

      {/* Fehler */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Benutzer-Liste */}
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
                {/* Profilbild Placeholder */}
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