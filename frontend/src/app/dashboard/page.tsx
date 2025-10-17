'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-[#e7e9ea]">Lädt...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ maxWidth: 'var(--max-content-width)' }}>
        <div className="bg-[#15202b] border-depth rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-[#e7e9ea]">Willkommen im Dashboard!</h2>

          <div className="space-y-4">
            <div>
              <span className="font-semibold text-[#e7e9ea]">ID:</span>
              <span className="ml-2 text-[#71767b]">{user?.id}</span>
            </div>
            <div>
              <span className="font-semibold text-[#e7e9ea]">Email:</span>
              <span className="ml-2 text-[#71767b]">{user?.email}</span>
            </div>
            <div>
              <span className="font-semibold text-[#e7e9ea]">Username:</span>
              <span className="ml-2 text-[#71767b]">{user?.username}</span>
            </div>
            {user?.firstName && (
              <div>
                <span className="font-semibold text-[#e7e9ea]">Name:</span>
                <span className="ml-2 text-[#71767b]">
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