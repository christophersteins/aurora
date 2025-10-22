/**
 * Detects the user's preferred locale based on geolocation
 * Returns 'de' for users in Germany, Austria, or Switzerland
 * Returns 'en' for all other locations or if detection fails
 */
export async function detectLocaleFromGeolocation(): Promise<'en' | 'de'> {
  try {
    // Try IP-based geolocation first (non-intrusive)
    try {
      const ipResponse = await fetch('https://ipapi.co/json/');
      const ipData = await ipResponse.json();

      if (ipData.country_code) {
        const countryCode = ipData.country_code.toUpperCase();
        // Return 'de' for Germany, Austria, and Switzerland
        if (countryCode === 'DE' || countryCode === 'AT' || countryCode === 'CH') {
          return 'de';
        }
        return 'en';
      }
    } catch (ipError) {
      // IP geolocation failed, continue to browser locale detection
      console.log('IP-based locale detection failed, using browser locale');
    }

    // Fallback to browser language detection
    return detectLocaleFromBrowser();
  } catch (error) {
    console.error('Error detecting locale from geolocation:', error);
    return 'en'; // Default to English on error
  }
}

/**
 * Gets the locale from browser settings
 */
export function detectLocaleFromBrowser(): 'en' | 'de' {
  if (typeof window === 'undefined') return 'en';

  const browserLang = navigator.language.toLowerCase();

  // Check if browser language is German
  if (browserLang.startsWith('de')) {
    return 'de';
  }

  return 'en';
}

/**
 * Gets the stored locale preference from localStorage
 */
export function getStoredLocale(): 'en' | 'de' | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem('preferred-locale');
  if (stored === 'en' || stored === 'de') {
    return stored;
  }

  return null;
}

/**
 * Stores the locale preference in localStorage
 */
export function setStoredLocale(locale: 'en' | 'de'): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('preferred-locale', locale);
}
