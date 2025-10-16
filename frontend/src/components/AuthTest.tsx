'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';

export default function AuthTest() {
  const { user, token, isAuthenticated, setAuth, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = await authService.getProfile();
      console.log('Profil geladen:', profile);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Fehler beim Laden des Profils';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Auth Test</h2>
      
      <div className="mb-4">
        <p className="font-semibold">Status:</p>
        <p className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
          {isAuthenticated ? 'Eingeloggt ✓' : 'Nicht eingeloggt ✗'}
        </p>
      </div>

      {user && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="font-semibold">User:</p>
          <pre className="text-sm">{JSON.stringify(user, null, 2)}</pre>
        </div>
      )}

      {token && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="font-semibold">Token:</p>
          <p className="text-xs break-all">{token.substring(0, 50)}...</p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="space-x-2">
        <button
          onClick={handleLoadProfile}
          disabled={!isAuthenticated || loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Lädt...' : 'Profil laden'}
        </button>

        <button
          onClick={logout}
          disabled={!isAuthenticated}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
        >
          Logout
        </button>
      </div>
    </div>
  );
}