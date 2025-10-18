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
    <div className="p-6 rounded-lg bg-page-secondary border-depth">
      <h2 className="text-2xl font-bold mb-4 text-heading">Benutzer in deiner Nähe</h2>

      <div className="mb-4">
        <p className="text-sm text-muted mb-2">
          Deine Position: {latitude && longitude 
            ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` 
            : 'Wird ermittelt...'}
        </p>

        <label className="block text-sm font-medium text-body mb-2">
          Radius: {radius} km
        </label>
        <div className="flex gap-2">
          {[1, 5, 10, 25, 50].map((r) => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className={`px-3 py-1 rounded transition ${
                radius === r
                  ? 'bg-action-primary text-button-primary'
                  : 'bg-page-primary text-body hover:bg-page-secondary'
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
        className="btn-base btn-success mb-4"
      >
        {loading ? 'Suche...' : 'Benutzer suchen'}
      </button>

      {error && (
        <div className="p-3 bg-error-light border border-error rounded mb-4">
          <p className="text-error">{error}</p>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-3 text-heading">
          {nearbyUsers.length} Benutzer gefunden
        </h3>
        
        {nearbyUsers.length === 0 && !loading && (
          <p className="text-muted">Keine Benutzer in diesem Umkreis gefunden.</p>
        )}

        <div className="space-y-3">
          {nearbyUsers.map((user) => (
            <div
              key={user.id}
              className="p-4 border border-default rounded-lg hover:bg-page-primary transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-action-primary rounded-full flex items-center justify-center text-white font-bold">
                  {user.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </div>
                
                <div>
                  <p className="font-semibold text-body">
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.username || 'Unbekannt'}
                  </p>
                  <p className="text-sm text-muted">@{user.username || user.email}</p>
                  {user.location && (
                    <p className="text-xs text-muted">
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