'use client';

import { useGeolocation } from '@/hooks/useGeolocation';

export default function GeolocationTest() {
  const { latitude, longitude, error, loading, permissionStatus, requestLocation } =
    useGeolocation();

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-4">Geolocation Test</h2>
      
      <button
        onClick={requestLocation}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? 'Lädt...' : 'Standort abrufen'}
      </button>

      <div className="mt-4 space-y-2">
        <p>
          <strong>Status:</strong> {permissionStatus || 'Nicht abgefragt'}
        </p>
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
        {error && (
          <p className="text-red-500">
            <strong>Fehler:</strong> {error}
          </p>
        )}
      </div>
    </div>
  );
}