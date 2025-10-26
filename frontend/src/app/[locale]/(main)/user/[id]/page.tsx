'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { escortService } from '@/services/escortService';

export default function UserRedirectPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const redirectToProfile = async () => {
      try {
        const userId = params.id as string;

        // Fetch user by ID to get their username
        const user = await escortService.getEscortById(userId);

        if (user && user.username) {
          // Redirect to the username-based profile page
          router.replace(`/profile/${user.username.toLowerCase()}`);
        } else {
          // If no username, stay on error page or redirect to home
          console.error('User not found or has no username');
          router.replace('/');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        router.replace('/');
      }
    };

    redirectToProfile();
  }, [params.id, router]);

  // Show loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen bg-page-primary">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-muted text-lg">Lade Profil...</p>
      </div>
    </div>
  );
}
