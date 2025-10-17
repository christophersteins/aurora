'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function Header() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Links */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">Aurora</span>
            </Link>
          </div>

          {/* Navigation - Mitte */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-purple-600 font-medium transition"
            >
              Home
            </Link>
            <Link
              href="/members"
              className="text-gray-700 hover:text-purple-600 font-medium transition"
            >
              Members
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-purple-600 font-medium transition"
                >
                  Dashboard
                </Link>
                <Link
                  href="/escort-profile"
                  className="text-gray-700 hover:text-purple-600 font-medium transition"
                >
                  Mein Profil
                </Link>
              </>
            )}
          </nav>

          {/* Buttons - Rechts */}
          <div className="flex items-center space-x-3">
            {!isAuthenticated ? (
              <>
                <Link href="/login">
                  <button className="px-4 py-2 text-gray-700 font-medium hover:text-purple-600 transition">
                    Anmelden
                  </button>
                </Link>
                <Link href="/register">
                  <button className="px-5 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition shadow-sm">
                    Registrieren
                  </button>
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="px-5 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition shadow-sm"
              >
                Abmelden
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}