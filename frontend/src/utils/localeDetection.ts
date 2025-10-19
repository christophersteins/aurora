/**
 * Detects the user's preferred locale based on geolocation
 * Returns 'de' for users in Germany, Austria, or Switzerland
 * Returns 'en' for all other locations or if detection fails
 */
export async function detectLocaleFromGeolocation(): Promise<'en' | 'de'> {
  try {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      return 'en'; // Default to English if geolocation not supported
    }

    // Get user's coordinates
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 5000,
        maximumAge: 60000, // Cache for 1 minute
      });
    });

    const { latitude, longitude } = position.coords;

    // Use Nominatim (OpenStreetMap) reverse geocoding to get country
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`,
      {
        headers: {
          'User-Agent': 'Aurora App'
        }
      }
    );

    if (!response.ok) {
      return 'en';
    }

    const data = await response.json();
    const countryCode = data.address?.country_code?.toUpperCase();

    // Return 'de' for Germany, Austria, and Switzerland
    // Return 'en' for all other countries
    if (countryCode === 'DE' || countryCode === 'AT' || countryCode === 'CH') {
      return 'de';
    }

    return 'en';
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
