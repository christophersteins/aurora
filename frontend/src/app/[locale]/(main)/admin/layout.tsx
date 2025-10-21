'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, _hasHydrated } = useAuthStore();

  useEffect(() => {
    // Wait for store to hydrate before checking auth
    if (!_hasHydrated) {
      return;
    }

    // Now we can safely check if user is admin
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/');
    }
  }, [user, isLoading, _hasHydrated, router]);

  // Show loading while hydrating
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-text-secondary">Lädt...</div>
      </div>
    );
  }

  // Show loading while checking auth after hydration
  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-text-secondary">Authentifizierung wird überprüft...</div>
      </div>
    );
  }

  // Don't render anything if redirecting
  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Admin Navigation */}
      <nav className="bg-bg-secondary border-b border-border">
        <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: 'var(--max-content-width)' }}>
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold gradient-text">Aurora Admin</h1>
              <div className="hidden md:flex space-x-4">
                <Link
                  href="/admin"
                  className="text-text-regular hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/users"
                  className="text-text-regular hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Benutzer
                </Link>
                <Link
                  href="/admin/waitlist"
                  className="text-text-regular hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Warteliste
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-text-secondary">Admin: {user.username || user.email}</span>
              <button
                onClick={() => router.push('/')}
                className="text-sm text-text-regular hover:text-primary transition-colors"
              >
                Zur App
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main>{children}</main>
    </div>
  );
}