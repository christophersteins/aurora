'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { MapPin, X, Search } from 'lucide-react';

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    postcode?: string;
    country?: string;
  };
}

export default function HomePage() {
  const router = useRouter();
  const [locationSearch, setLocationSearch] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch location suggestions from Nominatim
  const fetchLocationSuggestions = async (query: string) => {
    if (query.trim().length < 3) {
      setLocationSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&countrycodes=de&limit=5&addressdetails=1`
      );
      const data = await response.json();
      setLocationSuggestions(data);
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      setLocationSuggestions([]);
    }
  };

  // Debounce location search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (locationSearch) {
        fetchLocationSuggestions(locationSearch);
      } else {
        setLocationSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [locationSearch]);

  // Get user's current location
  const handleUseCurrentLocation = () => {
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // Redirect to escorts page with coordinates
          router.push(`/escorts?lat=${latitude}&lon=${longitude}&radius=20`);

          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Standortzugriff verweigert oder nicht verfügbar');
          setIsLoadingLocation(false);
        }
      );
    } else {
      alert('Geolocation wird von diesem Browser nicht unterstützt');
      setIsLoadingLocation(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    const latitude = parseFloat(suggestion.lat);
    const longitude = parseFloat(suggestion.lon);

    // Redirect to escorts page with coordinates
    router.push(`/escorts?lat=${latitude}&lon=${longitude}&radius=20`);
  };

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // If there are suggestions, use the first one
    if (locationSuggestions.length > 0) {
      handleSuggestionClick(locationSuggestions[0]);
    }
  };

  // Clear location search
  const handleClearLocationSearch = () => {
    setLocationSearch('');
    setLocationSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-page-primary py-20 md:py-32">
        <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: 'var(--max-content-width)' }}>
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-heading mb-6">
              Finde deine perfekte
              <span className="block gradient-text mt-2">Begleitung</span>
            </h1>
            <p className="text-xl text-muted">
              Entdecke Premium-Escorts in deiner Nähe. Diskret, sicher und professionell.
            </p>
          </div>

          {/* Search Box */}
          <div>
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="flex gap-3">
                {/* Location Search Field */}
                <div className="flex-1 relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={locationSearch}
                    onChange={(e) => {
                      setLocationSearch(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Stadt oder PLZ eingeben..."
                    className="w-full pl-12 pr-12 py-4 border border-default rounded-lg bg-page-secondary text-body text-lg focus:outline-none focus:border-primary"
                  />

                  {/* Search Icon */}
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-muted" />

                  {/* Clear or Location Icon */}
                  <button
                    type="button"
                    onClick={locationSearch ? handleClearLocationSearch : handleUseCurrentLocation}
                    disabled={isLoadingLocation}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 hover:bg-page-primary rounded transition cursor-pointer"
                    title={locationSearch ? 'Suche löschen' : 'Aktuellen Standort verwenden'}
                  >
                    {isLoadingLocation ? (
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : locationSearch ? (
                      <X className="w-6 h-6 text-muted" />
                    ) : (
                      <MapPin className="w-6 h-6 text-primary" />
                    )}
                  </button>

                  {/* Autocomplete Suggestions */}
                  {showSuggestions && locationSuggestions.length > 0 && (
                    <div
                      ref={suggestionsRef}
                      className="absolute z-50 w-full mt-2 bg-page-secondary border border-default rounded-lg shadow-lg max-h-80 overflow-y-auto"
                    >
                      {locationSuggestions.map((suggestion, index) => {
                        const cityName =
                          suggestion.address?.city ||
                          suggestion.address?.town ||
                          suggestion.address?.village ||
                          suggestion.display_name;

                        const postcode = suggestion.address?.postcode || '';

                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full text-left px-6 py-4 hover:bg-page-primary border-b border-default last:border-b-0 transition cursor-pointer"
                          >
                            <div className="text-body font-medium">{cityName}</div>
                            {postcode && (
                              <div className="text-sm text-muted mt-1">{postcode}</div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Search Button */}
                <button
                  type="submit"
                  className="btn-base btn-primary px-8 py-4 text-lg whitespace-nowrap"
                  disabled={!locationSearch && locationSuggestions.length === 0}
                >
                  Suchen
                </button>
              </div>
            </form>

            {/* Quick Tip */}
            <p className="text-center text-sm text-muted mt-4">
              Tipp: Klicke auf das <MapPin className="inline w-4 h-4" /> Symbol, um deinen aktuellen Standort zu verwenden
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-page-secondary">
        <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: 'var(--max-content-width)' }}>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-heading mb-2">100% Diskret</h3>
              <p className="text-muted">Deine Privatsphäre hat oberste Priorität. Alle Daten werden verschlüsselt und sicher gespeichert.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-heading mb-2">Verifizierte Profile</h3>
              <p className="text-muted">Alle Escorts werden sorgfältig geprüft, um höchste Qualität und Sicherheit zu gewährleisten.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-heading mb-2">In deiner Nähe</h3>
              <p className="text-muted">Finde Premium-Escorts in deiner Umgebung mit unserer intelligenten Standortsuche.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
