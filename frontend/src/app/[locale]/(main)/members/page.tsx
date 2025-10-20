'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { escortService } from '@/services/escortService';
import { User } from '@/types/auth.types';
import MemberFilterSidebar from '@/components/MemberFilterSidebar';
import { ListFilter, MapPin, LayoutGrid, Grid3x3, ArrowUpDown, X } from 'lucide-react';

// Filter-Interface
interface Filters {
  searchQuery: string;
  ageMin: number | null;
  ageMax: number | null;
  nationalities: string[];
  languages: string[];
  types: string[];
  heightMin: number | null;
  heightMax: number | null;
  weightMin: number | null;
  weightMax: number | null;
  bodyTypes: string[];
  cupSizes: string[];
  hairColors: string[];
  hairLengths: string[];
  eyeColors: string[];
  intimateHair: string[];
  hasTattoos: 'all' | 'yes' | 'no';
  hasPiercings: 'all' | 'yes' | 'no';
  isSmoker: 'all' | 'yes' | 'no';
  useRadius: boolean;
  radiusKm: number;
  userLatitude: number | null;
  userLongitude: number | null;
}

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

const initialFilters: Filters = {
  searchQuery: '',
  ageMin: null,
  ageMax: null,
  nationalities: [],
  languages: [],
  types: [],
  heightMin: null,
  heightMax: null,
  weightMin: null,
  weightMax: null,
  bodyTypes: [],
  cupSizes: [],
  hairColors: [],
  hairLengths: [],
  eyeColors: [],
  intimateHair: [],
  hasTattoos: 'all',
  hasPiercings: 'all',
  isSmoker: 'all',
  useRadius: false,
  radiusKm: 20,
  userLatitude: null,
  userLongitude: null,
};

const FILTER_STORAGE_KEY = 'aurora_member_filters';

type GridView = 'compact' | 'comfortable';

export default function MembersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [escorts, setEscorts] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [sortBy, setSortBy] = useState<'distance'>('distance');
  const [gridView, setGridView] = useState<GridView>('comfortable');

  // Location search states
  const [locationSearch, setLocationSearch] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Mobile sort dropdown state
  const [showMobileSortDropdown, setShowMobileSortDropdown] = useState(false);

  // Process URL parameters from home page search
  useEffect(() => {
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const radius = searchParams.get('radius');

    if (lat && lon) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);
      const radiusKm = radius ? parseInt(radius) : 20;

      // Reverse geocoding to get location name
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      )
        .then((response) => response.json())
        .then((data) => {
          const cityName =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            'Gewählter Standort';

          const postcode = data.address?.postcode || '';
          const displayName = postcode ? `${postcode} ${cityName}` : cityName;

          setLocationSearch(displayName);
        })
        .catch((error) => {
          console.error('Error reverse geocoding:', error);
          setLocationSearch('Gewählter Standort');
        });

      // Set filters with location data
      setFilters((prev) => ({
        ...prev,
        useRadius: true,
        userLatitude: latitude,
        userLongitude: longitude,
        radiusKm: radiusKm,
      }));
    }
  }, [searchParams]);

  // Load filters from LocalStorage on mount
  useEffect(() => {
    // Don't load from localStorage if we have URL parameters
    const lat = searchParams.get('lat');
    if (lat) return;

    try {
      const savedFilters = localStorage.getItem(FILTER_STORAGE_KEY);
      if (savedFilters) {
        const parsed = JSON.parse(savedFilters);
        setFilters({ ...initialFilters, ...parsed });
      }
    } catch (error) {
      console.error('Error loading filters from LocalStorage:', error);
    }
  }, [searchParams]);

  // Save filters to LocalStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error('Error saving filters to LocalStorage:', error);
    }
  }, [filters]);

  // Load all escorts on mount
  useEffect(() => {
    const fetchEscorts = async () => {
      try {
        setLoading(true);
        const data = await escortService.getAllEscorts();
        setEscorts(data);
      } catch (err) {
        setError('Fehler beim Laden der Escorts');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEscorts();
  }, []);

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
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Reverse geocoding to get location name
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            
            const cityName = 
              data.address?.city || 
              data.address?.town || 
              data.address?.village || 
              'Aktueller Standort';
            
            const postcode = data.address?.postcode || '';
            
            // Display with postcode if available
            const displayName = postcode ? `${postcode} ${cityName}` : cityName;
            
            setLocationSearch(displayName);
            setFilters({
              ...filters,
              useRadius: true,
              userLatitude: latitude,
              userLongitude: longitude,
            });
            setShowSuggestions(false);
          } catch (error) {
            console.error('Error reverse geocoding:', error);
            setFilters({
              ...filters,
              useRadius: true,
              userLatitude: latitude,
              userLongitude: longitude,
            });
            setLocationSearch('Aktueller Standort');
          }
          
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
    const cityName = 
      suggestion.address?.city || 
      suggestion.address?.town || 
      suggestion.address?.village || 
      suggestion.display_name;
    
    setLocationSearch(cityName);
    setFilters({
      ...filters,
      useRadius: true,
      userLatitude: parseFloat(suggestion.lat),
      userLongitude: parseFloat(suggestion.lon),
    });
    setShowSuggestions(false);
  };

  // Clear location search
  const handleClearLocationSearch = () => {
    setLocationSearch('');
    setFilters({
      ...filters,
      useRadius: false,
      userLatitude: null,
      userLongitude: null,
    });
    setLocationSuggestions([]);
    setShowSuggestions(false);
  };

  // Calculate age from birth date
  const calculateAge = (birthDate: string | undefined): number | null => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Filtered escorts
  const filteredEscorts = escorts.filter((escort) => {
    // Name search filter (from sidebar)
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      const firstName = escort.firstName?.toLowerCase() || '';
      const lastName = escort.lastName?.toLowerCase() || '';
      const username = escort.username?.toLowerCase() || '';
      const fullName = `${firstName} ${lastName}`.trim();

      const matchesSearch =
        firstName.includes(query) ||
        lastName.includes(query) ||
        username.includes(query) ||
        fullName.includes(query);

      if (!matchesSearch) return false;
    }

    // Radius filter
    if (filters.useRadius && filters.userLatitude && filters.userLongitude) {
      if (!escort.location) return false;
      
      const coords = escort.location.coordinates;
      if (!coords || coords.length !== 2) return false;
      
      const [escortLon, escortLat] = coords;
      const distance = calculateDistance(
        filters.userLatitude,
        filters.userLongitude,
        escortLat,
        escortLon
      );
      
      if (distance > filters.radiusKm) return false;
    }

    // Age
    const age = calculateAge(escort.birthDate);
    if (filters.ageMin !== null && (age === null || age < filters.ageMin)) return false;
    if (filters.ageMax !== null && (age === null || age > filters.ageMax)) return false;

    // Nationality
    if (filters.nationalities.length > 0) {
      if (!escort.nationalities || escort.nationalities.length === 0) return false;
      const hasMatchingNationality = escort.nationalities.some((nat) =>
        filters.nationalities.includes(nat)
      );
      if (!hasMatchingNationality) return false;
    }

    // Languages
    if (filters.languages.length > 0) {
      if (!escort.languages || escort.languages.length === 0) return false;
      const hasMatchingLanguage = escort.languages.some((lang) =>
        filters.languages.includes(lang)
      );
      if (!hasMatchingLanguage) return false;
    }

    // Type
    if (filters.types.length > 0) {
      if (!escort.type || !filters.types.includes(escort.type)) return false;
    }

    // Height
    if (filters.heightMin !== null && (escort.height === null || escort.height === undefined || escort.height < filters.heightMin)) return false;
    if (filters.heightMax !== null && (escort.height === null || escort.height === undefined || escort.height > filters.heightMax)) return false;

    // Weight
    if (filters.weightMin !== null && (escort.weight === null || escort.weight === undefined || escort.weight < filters.weightMin)) return false;
    if (filters.weightMax !== null && (escort.weight === null || escort.weight === undefined || escort.weight > filters.weightMax)) return false;

    // Body type
    if (filters.bodyTypes.length > 0) {
      if (!escort.bodyType || !filters.bodyTypes.includes(escort.bodyType)) return false;
    }

    // Cup size
    if (filters.cupSizes.length > 0) {
      if (!escort.cupSize || !filters.cupSizes.includes(escort.cupSize)) return false;
    }

    // Hair color
    if (filters.hairColors.length > 0) {
      if (!escort.hairColor || !filters.hairColors.includes(escort.hairColor)) return false;
    }

    // Hair length
    if (filters.hairLengths.length > 0) {
      if (!escort.hairLength || !filters.hairLengths.includes(escort.hairLength)) return false;
    }

    // Eye color
    if (filters.eyeColors.length > 0) {
      if (!escort.eyeColor || !filters.eyeColors.includes(escort.eyeColor)) return false;
    }

    // Intimate hair
    if (filters.intimateHair.length > 0) {
      if (!escort.intimateHair || !filters.intimateHair.includes(escort.intimateHair)) return false;
    }

    // Tattoos
    if (filters.hasTattoos !== 'all') {
      const hasTattoos = escort.hasTattoos === true;
      if (filters.hasTattoos === 'yes' && !hasTattoos) return false;
      if (filters.hasTattoos === 'no' && hasTattoos) return false;
    }

    // Piercings
    if (filters.hasPiercings !== 'all') {
      const hasPiercings = escort.hasPiercings === true;
      if (filters.hasPiercings === 'yes' && !hasPiercings) return false;
      if (filters.hasPiercings === 'no' && hasPiercings) return false;
    }

    // Smoker
    if (filters.isSmoker !== 'all') {
      const isSmoker = escort.isSmoker === true;
      if (filters.isSmoker === 'yes' && !isSmoker) return false;
      if (filters.isSmoker === 'no' && isSmoker) return false;
    }

    return true;
  });

  // Sort by distance (ascending - nearest first)
  const sortedEscorts = [...filteredEscorts].sort((a, b) => {
    if (sortBy === 'distance' && filters.useRadius && filters.userLatitude && filters.userLongitude) {
      const aCoords = a.location?.coordinates;
      const bCoords = b.location?.coordinates;

      if (!aCoords || aCoords.length !== 2) return 1;
      if (!bCoords || bCoords.length !== 2) return -1;

      const [aLon, aLat] = aCoords;
      const [bLon, bLat] = bCoords;

      const distanceA = calculateDistance(
        filters.userLatitude,
        filters.userLongitude,
        aLat,
        aLon
      );

      const distanceB = calculateDistance(
        filters.userLatitude,
        filters.userLongitude,
        bLat,
        bLon
      );

      return distanceA - distanceB;
    }

    return 0;
  });

  // Navigate to profile
  const handleProfileClick = (username?: string) => {
    if (username) {
      router.push(`/profile/${username}`);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters(initialFilters);
    setLocationSearch('');
    try {
      localStorage.removeItem(FILTER_STORAGE_KEY);
    } catch (error) {
      console.error('Error removing filters from LocalStorage:', error);
    }
  };

  // Check if filters are active
  const hasActiveFilters = () => {
    return (
      filters.searchQuery.trim() !== '' ||
      filters.ageMin !== null ||
      filters.ageMax !== null ||
      filters.nationalities.length > 0 ||
      filters.languages.length > 0 ||
      filters.types.length > 0 ||
      filters.heightMin !== null ||
      filters.heightMax !== null ||
      filters.weightMin !== null ||
      filters.weightMax !== null ||
      filters.bodyTypes.length > 0 ||
      filters.cupSizes.length > 0 ||
      filters.hairColors.length > 0 ||
      filters.hairLengths.length > 0 ||
      filters.eyeColors.length > 0 ||
      filters.intimateHair.length > 0 ||
      filters.hasTattoos !== 'all' ||
      filters.hasPiercings !== 'all' ||
      filters.isSmoker !== 'all' ||
      filters.useRadius
    );
  };

  // Grid classes based on view selection
  const getGridClasses = () => {
    if (gridView === 'compact') {
      return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
    } else {
      return 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-muted">Lädt...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-error mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-base btn-primary"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: 'var(--max-content-width)' }}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl text-heading">Escorts</h1>
        </div>

        {/* Toolbar */}
        <div className="mb-6">
          {/* Mobile Layout (Smartphone) */}
          <div className="block lg:hidden space-y-4">
            {/* First Row: Location Search + Radius */}
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
                  placeholder="Stadt oder PLZ..."
                  className="w-full pl-4 pr-10 py-2 border border-default rounded-lg bg-page-primary text-body focus:outline-none focus:border-primary"
                />
                
                {/* Clear or Location Icon */}
                <button
                  onClick={locationSearch ? handleClearLocationSearch : handleUseCurrentLocation}
                  disabled={isLoadingLocation}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-page-secondary rounded transition"
                  title={locationSearch ? 'Suche löschen' : 'Aktuellen Standort verwenden'}
                >
                  {isLoadingLocation ? (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : locationSearch ? (
                    <X className="w-5 h-5 text-muted" />
                  ) : (
                    <MapPin className="w-5 h-5 text-primary" />
                  )}
                </button>

                {/* Autocomplete Suggestions */}
                {showSuggestions && locationSuggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute z-50 w-full mt-1 bg-page-secondary border border-default rounded-lg shadow-lg max-h-60 overflow-y-auto"
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
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full text-left px-4 py-3 hover:bg-page-primary border-b border-default last:border-b-0 transition"
                        >
                          <div className="text-body">{cityName}</div>
                          {postcode && (
                            <div className="text-sm text-muted">{postcode}</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Radius Field */}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={filters.radiusKm || ''}
                  onChange={(e) => setFilters({ ...filters, radiusKm: parseInt(e.target.value) || 0 })}
                  onBlur={() => {
                    if (filters.radiusKm < 5) {
                      setFilters({ ...filters, radiusKm: 5 });
                    } else if (filters.radiusKm > 500) {
                      setFilters({ ...filters, radiusKm: 500 });
                    }
                  }}
                  min="5"
                  max="500"
                  className="w-20 px-3 py-2 border border-default rounded-lg bg-page-primary text-body text-center focus:outline-none focus:border-primary [&::-webkit-inner-spin-button]:opacity-100 [&::-webkit-outer-spin-button]:opacity-100"
                  style={{ colorScheme: 'dark', accentColor: '#71767b' }}
                  placeholder="km"
                />
                <span className="text-muted text-sm whitespace-nowrap">km</span>
              </div>
            </div>

            {/* Second Row: Filter + Sort + View Switcher */}
            <div className="flex items-center justify-between gap-3">
              {/* Left Side: Filter Button */}
              <button
                onClick={() => setFilterSidebarOpen(true)}
                className="btn-base btn-primary flex items-center justify-center gap-2"
              >
                <ListFilter className="w-5 h-5" />
                Filter
                {hasActiveFilters() && (
                  <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: '#eff3f4', color: '#8b5cf6' }}>
                    Aktiv
                  </span>
                )}
              </button>

              {/* Right Side: Sort Dropdown + View Switcher */}
              <div className="flex items-center gap-2">
                {/* Sort Dropdown (Mobile) */}
                <div className="relative">
                  <button
                    onClick={() => setShowMobileSortDropdown(!showMobileSortDropdown)}
                    className="p-2 rounded-lg border border-default bg-page-secondary text-body hover:border-primary transition"
                    title="Sortierung"
                  >
                    <ArrowUpDown className="w-5 h-5" />
                  </button>

                  {showMobileSortDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-page-secondary border border-default rounded-lg shadow-lg z-50">
                      <button
                        onClick={() => {
                          setSortBy('distance');
                          setShowMobileSortDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-page-primary transition border-b border-default"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-body">Entfernung aufsteigend</span>
                          {sortBy === 'distance' && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* View Switcher */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setGridView('compact')}
                    className={`p-2 rounded-lg border transition ${
                      gridView === 'compact'
                        ? 'bg-action-primary text-button-primary border-primary'
                        : 'bg-page-secondary text-muted border-default hover:border-primary hover:text-action-primary'
                    }`}
                    title="Kompakte Ansicht"
                  >
                    <LayoutGrid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setGridView('comfortable')}
                    className={`p-2 rounded-lg border transition ${
                      gridView === 'comfortable'
                        ? 'bg-action-primary text-button-primary border-primary'
                        : 'bg-page-secondary text-muted border-default hover:border-primary hover:text-action-primary'
                    }`}
                    title="Komfortable Ansicht"
                  >
                    <Grid3x3 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop/Tablet Layout */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Filter Button (ganz links) */}
            <button
              onClick={() => setFilterSidebarOpen(true)}
              className="btn-base btn-primary flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <ListFilter className="w-5 h-5" />
              Filter
              {hasActiveFilters() && (
                <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: '#eff3f4', color: '#8b5cf6' }}>
                  Aktiv
                </span>
              )}
            </button>

            {/* Location Search Field */}
            <div className="flex-1 max-w-md relative">
              <input
                ref={searchInputRef}
                type="text"
                value={locationSearch}
                onChange={(e) => {
                  setLocationSearch(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Stadt oder PLZ suchen..."
                className="w-full pl-4 pr-10 py-2 border border-default rounded-lg bg-page-primary text-body focus:outline-none focus:border-primary"
              />
              
              {/* Clear or Location Icon */}
              <button
                onClick={locationSearch ? handleClearLocationSearch : handleUseCurrentLocation}
                disabled={isLoadingLocation}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-page-secondary rounded transition"
                title={locationSearch ? 'Suche löschen' : 'Aktuellen Standort verwenden'}
              >
                {isLoadingLocation ? (
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : locationSearch ? (
                  <X className="w-5 h-5 text-muted" />
                ) : (
                  <MapPin className="w-5 h-5 text-primary" />
                )}
              </button>

              {/* Autocomplete Suggestions */}
              {showSuggestions && locationSuggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-50 w-full mt-1 bg-page-secondary border border-default rounded-lg shadow-lg max-h-60 overflow-y-auto"
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
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-page-primary border-b border-default last:border-b-0 transition"
                      >
                        <div className="text-body">{cityName}</div>
                        {postcode && (
                          <div className="text-sm text-muted">{postcode}</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Radius Field */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={filters.radiusKm || ''}
                onChange={(e) => setFilters({ ...filters, radiusKm: parseInt(e.target.value) || 0 })}
                onBlur={() => {
                  if (filters.radiusKm < 5) {
                    setFilters({ ...filters, radiusKm: 5 });
                  } else if (filters.radiusKm > 500) {
                    setFilters({ ...filters, radiusKm: 500 });
                  }
                }}
                min="5"
                max="500"
                className="w-20 px-3 py-2 border border-default rounded-lg bg-page-primary text-body text-center focus:outline-none focus:border-primary [&::-webkit-inner-spin-button]:opacity-100 [&::-webkit-outer-spin-button]:opacity-100"
                style={{ colorScheme: 'dark', accentColor: '#71767b' }}
                placeholder="km"
              />
              <span className="text-muted text-sm whitespace-nowrap">km</span>
            </div>

            {/* Spacer to push Sort + View Switcher to the right */}
            <div className="flex-grow"></div>

            {/* Sort Select */}
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'distance')}
                className="pl-10 pr-4 py-2 border border-default rounded-lg focus:outline-none bg-page-primary text-muted appearance-none cursor-pointer"
              >
                <option value="distance">Entfernung aufsteigend</option>
              </select>
            </div>

            {/* View Switcher (ganz rechts) */}
            <div className="flex gap-2">
              <button
                onClick={() => setGridView('compact')}
                className={`p-2 rounded-lg border transition ${
                  gridView === 'compact'
                    ? 'bg-action-primary text-button-primary border-primary'
                    : 'bg-page-secondary text-muted border-default hover:border-primary hover:text-action-primary'
                }`}
                title="Kompakte Ansicht"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setGridView('comfortable')}
                className={`p-2 rounded-lg border transition ${
                  gridView === 'comfortable'
                    ? 'bg-action-primary text-button-primary border-primary'
                    : 'bg-page-secondary text-muted border-default hover:border-primary hover:text-action-primary'
                }`}
                title="Komfortable Ansicht"
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Reset filters (if active) */}
        {hasActiveFilters() && (
          <div className="mb-6">
            <button
              onClick={handleResetFilters}
              className="text-sm link-primary"
            >
              Alle Filter zurücksetzen
            </button>
          </div>
        )}

        {/* Escorts Grid */}
        {sortedEscorts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted text-lg mb-4">
              {hasActiveFilters()
                ? 'Keine Escorts mit den ausgewählten Filtern gefunden'
                : 'Keine Escorts gefunden'}
            </p>
            {hasActiveFilters() && (
              <button
                onClick={handleResetFilters}
                className="btn-base btn-primary"
              >
                Filter zurücksetzen
              </button>
            )}
          </div>
        ) : (
          <div className={getGridClasses()}>
            {sortedEscorts.map((escort) => {
              const age = calculateAge(escort.birthDate);

              return (
                <div
                  key={escort.id}
                  onClick={() => handleProfileClick(escort.username)}
                  className="bg-page-primary border-depth rounded-lg overflow-hidden cursor-pointer transition-all"
                >
                  {/* Profile Picture */}
                  <div className="aspect-square bg-page-secondary flex items-center justify-center">
                    {escort.profilePicture ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${
                          escort.profilePicture
                        }`}
                        alt={escort.username || 'Profilbild'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-muted text-6xl">
                        {(
                          escort.firstName?.[0] ||
                          escort.username?.[0] ||
                          escort.email[0]
                        ).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Information */}
                  <div className="p-4">
                    <h3 className="text-xl mb-3 text-heading">
                      {escort.username || 'Unbekannt'}
                    </h3>

                    <div className="flex items-center gap-3 text-sm text-muted">
                      {/* Show distance */}
                      {filters.useRadius && filters.userLatitude && filters.userLongitude && escort.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {(() => {
                            const coords = escort.location.coordinates;
                            if (!coords || coords.length !== 2) return 'N/A';
                            
                            const [escortLon, escortLat] = coords;
                            const distance = calculateDistance(
                              filters.userLatitude,
                              filters.userLongitude,
                              escortLat,
                              escortLon
                            );
                            
                            return `${Math.round(distance)}km`;
                          })()}
                        </span>
                      )}

                      {/* Age */}
                      {age && <span>{age} Jahre</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Filter Sidebar */}
      <MemberFilterSidebar
        isOpen={filterSidebarOpen}
        onClose={() => setFilterSidebarOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        onResetFilters={handleResetFilters}
      />
    </div>
  );
}