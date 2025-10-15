'use client';

import { useLocationUpdate } from '@/hooks/useLocationUpdate';
import { useAuthStore } from '@/store/authStore';

export default function GeolocationTest() {
  const { user, token, isAuthenticated } = useAuthStore();

  const {
    latitude,
    longitude,
    error,
    loading,
    updateSuccess,
    requestAndUpdate,
  } = useLocationUpdate({
    userId: user?.id || null,
    token: token,
  });

  if (!isAuthenticated) {
    return (
      <div className="p-6 border rounded-lg bg-white shadow-sm">
        <h2 className="text-xl font-bold mb-4">Geolocation Test</h2>
        <p className="text-gray-600">Bitte logge dich ein, um diese Funktion zu nutzen.</p>
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-4">Geolocation Test</h2>

      <button
        onClick={requestAndUpdate}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? 'Lädt...' : 'Standort abrufen & speichern'}
      </button>

      <div className="mt-4 space-y-2">
        {latitude && longitude && (
          <>
            <p>
              <strong>Breitengrad:</strong> {latitude.toFixed(6)}
            </p>
            <p>
              <strong>Längengrad:</strong> {longitude.toFixed(6)}
            </p>
          </>
        )}
        {updateSuccess && (
          <p className="text-green-500">
            <strong>✅ Standort erfolgreich im Backend gespeichert!</strong>
          </p>
        )}
        {error && (
          <p className="text-red-500">
            <strong>Fehler:</strong> {error}
          </p>
        )}
      </div>
    </div>
  );
}