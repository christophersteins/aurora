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
  const [showPasswordField, setShowPasswordField] = useState(false);

  const handleEmailSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (email.trim()) {
      setShowPasswordField(true);
    }
  };

  const handleEmailBlur = () => {
    if (email.trim() && !showPasswordField) {
      setShowPasswordField(true);
    }
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleEmailSubmit();
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
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

  const handleSocialLogin = (provider: string) => {
    console.log(`${provider} Login - wird später implementiert`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-page-primary">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-heading mb-2">Aurora</h1>
          <p className="text-muted">Melde dich an, um fortzufahren</p>
        </div>

        {/* Login Card */}
        <div className="bg-page-secondary border-depth rounded-lg p-8">
          <h2 className="text-2xl mb-6 text-heading">Anmelden</h2>

          {error && (
            <div className="mb-6 p-4 bg-error-light border border-error rounded-lg">
              <p className="text-error text-sm">{error}</p>
            </div>
          )}

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            {/* X (Twitter) */}
            <button
              type="button"
              onClick={() => handleSocialLogin('X')}
              className="w-full btn-base btn-secondary flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span>Mit X anmelden</span>
            </button>

            {/* Google */}
            <button
              type="button"
              onClick={() => handleSocialLogin('Google')}
              className="w-full btn-base btn-secondary flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Mit Google anmelden</span>
            </button>

            {/* Apple */}
            <button
              type="button"
              onClick={() => handleSocialLogin('Apple')}
              className="w-full btn-base btn-secondary flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span>Mit Apple anmelden</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-default"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-page-secondary text-muted">oder</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={showPasswordField ? handleFinalSubmit : handleEmailSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleEmailBlur}
                onKeyDown={handleEmailKeyDown}
                required
                placeholder="Email"
                className="w-full px-4 py-3 bg-page-secondary border border-default rounded-lg focus:outline-none text-body"
              />
            </div>

            {/* Password (shown after email) */}
            {showPasswordField && (
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Passwort"
                  autoFocus
                  className="w-full px-4 py-3 bg-page-secondary border border-default rounded-lg focus:outline-none text-body"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-base btn-primary mt-6"
            >
              {loading ? 'Lädt...' : 'Anmelden'}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-muted">
              Noch kein Konto?{' '}
              <Link href="/register" className="link-default">
                Jetzt registrieren
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}