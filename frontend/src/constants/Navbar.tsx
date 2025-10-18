'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="bg-black text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo und App-Name */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className="text-xl font-bold">Aurora</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link href="/" className="hover:text-purple-400 transition-colors">
                  Home
                </Link>
                <Link href="/members" className="hover:text-purple-400 transition-colors">
                  Members
                </Link>
                <Link href="/dashboard" className="hover:text-purple-400 transition-colors">
                  Dashboard
                </Link>
                <Link href="/profile" className="hover:text-purple-400 transition-colors">
                  Mein Profil
                </Link>
                
                {/* Admin Link - nur für Admins sichtbar */}
                {user?.role === 'admin' && (
                  <Link 
                    href="/admin" 
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-md transition-colors font-medium"
                  >
                    Admin-Panel
                  </Link>
                )}

                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-400">
                    Willkommen, {user?.username || user?.email}!
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 border border-white rounded-full hover:bg-white hover:text-black transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="px-6 py-2 border border-white rounded-full hover:bg-white hover:text-black transition-colors"
              >
                Anmelden
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}