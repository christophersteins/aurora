'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('http://localhost:4000/waitlist/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setEmail('');
      } else {
        setError(data.message || 'Ein Fehler ist aufgetreten');
      }
    } catch (err) {
      setError('Verbindungsfehler. Bitte versuche es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700">
      {/* Navigation */}
      <nav className="bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-bold text-xl">A</span>
              </div>
              <span className="text-2xl font-bold text-white">Aurora</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-white hover:text-purple-200 transition-colors"
              >
                Anmelden
              </Link>
              <Link
                href="/register"
                className="px-6 py-2 bg-white text-purple-600 rounded-full font-medium hover:bg-purple-50 transition-colors"
              >
                Registrieren
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Willkommen bei Aurora
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-4">
            Die moderne Plattform für Video-Content und Live-Chat
          </p>
          <p className="text-lg text-white/80 mb-12">
            Wir launchen bald! Trage dich jetzt in die Warteliste ein und sei einer der Ersten, die Zugang erhalten.
          </p>

          {/* Waitlist Form */}
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Zur Warteliste anmelden
              </h2>

              {success ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 font-medium">
                    ✓ Erfolgreich angemeldet!
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    Wir benachrichtigen dich per E-Mail, sobald Aurora verfügbar ist.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="deine@email.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Wird gespeichert...' : 'Jetzt anmelden'}
                  </button>
                </form>
              )}

              <p className="text-sm text-gray-600 mt-4">
                Bereits Zugang? <Link href="/login" className="text-purple-600 hover:underline font-medium">Hier anmelden</Link>
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="text-white">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📹</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Video-Feed</h3>
              <p className="text-white/80">
                Nahtlose Wiedergabe von Kurzvideos wie bei TikTok
              </p>
            </div>

            <div className="text-white">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Live-Chat</h3>
              <p className="text-white/80">
                Echtzeit-Kommunikation mit anderen Benutzern
              </p>
            </div>

            <div className="text-white">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📍</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Geolocation</h3>
              <p className="text-white/80">
                Finde Benutzer in deiner Nähe basierend auf deinem Standort
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-white/80">
          <p>&copy; 2025 Aurora. Alle Rechte vorbehalten.</p>
        </div>
      </footer>
    </div>
  );
}