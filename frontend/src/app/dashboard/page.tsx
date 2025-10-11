'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import Link from 'next/link';

interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authService.getProfile();
        setUser(response.user);
      } catch (error) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Lädt...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-indigo-600">Aurora</h1>
              <div className="flex gap-4">
                <Link
                  href="/dashboard"
                  className="text-indigo-600 font-medium border-b-2 border-indigo-600"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/waitlist"
                  className="text-gray-600 hover:text-indigo-600 font-medium"
                >
                  Warteliste
                </Link>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">Willkommen im Dashboard!</h2>

          <div className="space-y-4">
            <div>
              <span className="font-semibold text-gray-700">ID:</span>
              <span className="ml-2 text-gray-600">{user?.id}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Email:</span>
              <span className="ml-2 text-gray-600">{user?.email}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Username:</span>
              <span className="ml-2 text-gray-600">{user?.username}</span>
            </div>
            {user?.firstName && (
              <div>
                <span className="font-semibold text-gray-700">Name:</span>
                <span className="ml-2 text-gray-600">
                  {user.firstName} {user.lastName}
                </span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}