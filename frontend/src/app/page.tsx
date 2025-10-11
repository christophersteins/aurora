'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/auth.service';
import { waitlistService } from '@/services/waitlist.service';

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [waitlistCount, setWaitlistCount] = useState<number | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');

      if (token) {
        try {
          await authService.getProfile();
          router.push('/dashboard');
          return;
        } catch (error) {
          localStorage.removeItem('auth_token');
        }
      }

      setChecking(false);
    };

    const fetchCount = async () => {
      try {
        const data = await waitlistService.getCount();
        setWaitlistCount(data.count);
      } catch (error) {
        console.error('Failed to fetch waitlist count');
      }
    };

    checkAuth();
    fetchCount();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await waitlistService.join({ email });
      setSuccess(true);
      setEmail('');
      // Count aktualisieren
      const data = await waitlistService.getCount();
      setWaitlistCount(data.count);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
        <div className="text-white text-xl">Lädt...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-6 animate-fade-in">
            Willkommen bei Aurora
          </h1>
          <p className="text-2xl mb-8 text-indigo-100">
            Deine moderne, schnelle und sichere Social Media App
          </p>
          <p className="text-lg mb-12 text-indigo-100">
            Wir launchen bald! Trage dich auf die Warteliste ein und sei einer der Ersten dabei.
          </p>

          {/* Waitlist Form */}
          <div className="max-w-md mx-auto mb-12">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <h3 className="text-2xl font-semibold mb-4">🚀 Früher Zugang sichern</h3>

              {success ? (
                <div className="bg-green-500 text-white p-4 rounded-lg mb-4">
                  ✅ Erfolgreich! Wir benachrichtigen dich beim Launch.
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-red-500 text-white p-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="deine@email.com"
                    required
                    className="w-full px-4 py-3 rounded-lg text-gray-800 focus:ring-2 focus:ring-white focus:outline-none"
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white text-indigo-600 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Lädt...' : 'Zur Warteliste hinzufügen'}
                  </button>
                </form>
              )}

              {waitlistCount !== null && (
                <p className="mt-4 text-sm text-indigo-100">
                  🎉 {waitlistCount} {waitlistCount === 1 ? 'Person wartet' : 'Personen warten'} bereits
                </p>
              )}
            </div>
          </div>

          {/* Login/Register Buttons */}
          <div className="mb-12">
            <p className="text-indigo-100 mb-4">Bereits registriert?</p>
            <div className="flex gap-6 justify-center">
              <Link
                href="/login"
                className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold text-lg hover:bg-indigo-50 transition shadow-lg"
              >
                Einloggen
              </Link>
              <Link
                href="/register"
                className="px-8 py-4 bg-indigo-600 text-white rounded-lg font-semibold text-lg hover:bg-indigo-700 transition shadow-lg border-2 border-white"
              >
                Registrieren
              </Link>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Sicher</h3>
              <p className="text-indigo-100">
                JWT-Authentication und bcrypt-verschlüsselte Passwörter
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Schnell</h3>
              <p className="text-indigo-100">
                Moderne Technologien: Next.js, Nest.js, PostgreSQL
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-semibold mb-2">Geolocation</h3>
              <p className="text-indigo-100">
                Finde Benutzer in deiner Nähe mit Radius-Filter
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}