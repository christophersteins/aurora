'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';

export default function AuthTest() {
  const { user, token, isAuthenticated, setAuth, logout } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authService.login({ email, password });
      setAuth(response.user, response.access_token);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Auth Test</h2>

      {!isAuthenticated ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="test@aurora.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              placeholder="********"
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Lädt...' : 'Login'}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-green-600 font-semibold">✅ Eingeloggt als:</p>
          <div className="bg-gray-50 p-3 rounded">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Username:</strong> {user?.username}</p>
            <p><strong>User-ID:</strong> {user?.id}</p>
            <p className="text-xs text-gray-600 mt-2">
              <strong>Token:</strong> {token?.substring(0, 20)}...
            </p>
          </div>
          <button
            onClick={logout}
            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}