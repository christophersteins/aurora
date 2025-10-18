'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import GeolocationTest from '@/components/GeolocationTest';
import NearbyUsers from '@/components/NearbyUsers';
import LandingPage from '@/components/LandingPage';

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, logout, _hasHydrated } = useAuthStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Wait for hydration
  if (!isClient || !_hasHydrated) {
    return null;
  }

  // Show landing page for non-authenticated users
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  // Show app for authenticated users
  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Aurora</h1>
            <p className="text-gray-600 mt-1">
              Willkommen, {user?.username || user?.email}!
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Admin-Button - nur für Admins sichtbar */}
            {user?.role === 'admin' && (
              <button
                onClick={() => router.push('/admin')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
              >
                Admin-Panel
              </button>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <GeolocationTest />
        </div>

        <NearbyUsers />
      </div>
    </main>
  );
}