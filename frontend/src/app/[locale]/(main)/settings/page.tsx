'use client';

import SettingsPage from '@/components/SettingsPage';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from '@/i18n/routing';
import { useEffect } from 'react';

export default function Settings() {
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after the store has been hydrated from localStorage
    if (_hasHydrated && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, _hasHydrated, router]);

  // Show loading state while hydrating
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted">Lädt...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto px-4 sm:px-6 lg:px-0 py-8" style={{ maxWidth: 'var(--max-content-width)' }}>
        <SettingsPage />
      </div>
    </div>
  );
}
