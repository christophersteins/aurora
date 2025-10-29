'use client';

import SettingsPage from '@/components/SettingsPage';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from '@/i18n/routing';
import { useEffect } from 'react';

export default function Settings() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

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
