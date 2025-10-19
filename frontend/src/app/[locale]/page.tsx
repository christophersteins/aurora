'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import GeolocationTest from '@/components/GeolocationTest';
import NearbyUsers from '@/components/NearbyUsers';

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-heading">Aurora</h1>
            <p className="text-muted mt-1">
              Willkommen, {user?.username || user?.email}!
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-base btn-error"
          >
            Logout
          </button>
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