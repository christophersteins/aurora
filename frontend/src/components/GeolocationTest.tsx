'use client';

import { useLocationUpdate } from '@/hooks/useLocationUpdate';
import { useState } from 'react';

export default function GeolocationTest() {
  // Mock-Daten für Test - in echter App aus Auth-Context holen
  const [userId] = useState('a9f142bc-3a6a-467c-bd6f-1dfad0c26922'); // test@aurora.com
  const [token] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhOWYxNDJiYy0zYTZhLTQ2N2MtYmQ2Zi0xZGZhZDBjMjY5MjIiLCJlbWFpbCI6Im5ld3VzZXJAYXVyb3JhLmNvbSIsImlhdCI6MTc2MDUzMzE5MCwiZXhwIjoxNzYxMTM3OTkwfQ.thIe1BVkfE2u3NoyQKFwDCMAzBV27B1BBmly-sHxmtw'); // Token aus Login

  const {
    latitude,
    longitude,
    error,
    loading,
    updateSuccess,
    requestAndUpdate,
  } = useLocationUpdate({
    userId,
    token,
  });

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

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-sm text-yellow-800">
          <strong>Hinweis:</strong> Trage oben einen gültigen JWT-Token ein, um den Backend-Test durchzuführen.
        </p>
      </div>
    </div>
  );
}