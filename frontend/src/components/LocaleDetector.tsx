'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { detectLocaleFromGeolocation, getStoredLocale, setStoredLocale } from '@/utils/localeDetection';

/**
 * Client component that detects user's locale on first visit
 * and redirects to the appropriate language version
 */
export default function LocaleDetector() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  useEffect(() => {
    async function detectAndSetLocale() {
      // Check if user has a stored preference
      const storedLocale = getStoredLocale();

      if (storedLocale) {
        // User has already chosen a language, respect that choice
        return;
      }

      // Check if this is the first visit (no locale preference stored)
      const isFirstVisit = !localStorage.getItem('visited-before');

      if (!isFirstVisit) {
        // User has visited before but hasn't explicitly chosen a language
        // Use current locale (which was detected by browser or default)
        return;
      }

      // Mark that user has visited
      localStorage.setItem('visited-before', 'true');

      try {
        // Try to detect locale from geolocation
        const detectedLocale = await detectLocaleFromGeolocation();

        // Store the detected locale
        setStoredLocale(detectedLocale);

        // If detected locale is different from current, redirect
        if (detectedLocale !== currentLocale) {
          const newPathname = pathname.replace(`/${currentLocale}`, `/${detectedLocale}`);
          router.replace(newPathname);
        }
      } catch (error) {
        console.error('Error detecting locale:', error);
        // On error, just stay with current locale
      }
    }

    detectAndSetLocale();
  }, [currentLocale, pathname, router]);

  // This component doesn't render anything
  return null;
}
