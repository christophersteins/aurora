'use client';

import EscortProfileForm from '@/components/EscortProfileForm';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EscortProfilePage() {
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Warte bis Store hydratisiert ist
    if (!_hasHydrated) {
      return;
    }

    // Now we can safely check
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      setIsChecking(false);
    }
  }, [isAuthenticated, _hasHydrated, router]);

  // Show loading during hydration or redirect
  if (!_hasHydrated || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-body">Lädt...</p>
      </div>
    );
  }

  // If not authenticated, show nothing (redirect in progress)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: 'var(--max-content-width)' }}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-heading">Mein Escort-Profil</h1>
          <p className="text-muted mt-2">
            Bearbeite deine Profilinformationen
          </p>
        </div>

        <EscortProfileForm />
      </div>
    </div>
  );
}