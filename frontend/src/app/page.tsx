'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/auth.service';

export default function HomePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        try {
          await authService.getProfile();
          // User ist eingeloggt, weiterleiten zum Dashboard
          router.push('/dashboard');
          return;
        } catch (error) {
          // Token ist ungültig, entfernen
          localStorage.removeItem('auth_token');
        }
      }
      
      setChecking(false);
    };

    checkAuth();
  }, [router]);

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
          <p className="text-2xl mb-12 text-indigo-100">
            Deine moderne, schnelle und sichere Web App
          </p>

          <div className="flex gap-6 justify-center mb-16">
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