'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login({ email, password });
      setAuth(response.user, response.access_token);
      router.push('/');
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login fehlgeschlagen';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold gradient-text mb-2">Aurora</h1>
          <p className="text-text-secondary">Melde dich an, um fortzufahren</p>
        </div>

        {/* Login Card */}
        <div className="bg-bg-primary border-depth rounded-lg p-8">
          <h2 className="text-2xl mb-6">Anmelden</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-heading mb-2">
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="deine@email.de"
                className="w-full px-4 py-3 bg-bg-primary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-regular"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-heading mb-2">
                Passwort
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-bg-primary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-text-regular"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-base btn-primary"
            >
              {loading ? 'Lädt...' : 'Anmelden'}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-text-secondary">
              Noch kein Konto?{' '}
              <Link href="/register" className="font-medium hover:opacity-80 transition" style={{ color: '#00d4ff' }}>
                Jetzt registrieren
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}