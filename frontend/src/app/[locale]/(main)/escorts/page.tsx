'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { escortService } from '@/services/escortService';
import { User } from '@/types/auth.types';
import MemberFilterSidebar from '@/components/MemberFilterSidebar';
import CustomSelect, { CustomSelectOption } from '@/components/CustomSelect';
import {
  ListFilter,
  MapPin,
  LayoutGrid,
  Grid3x3,
  ArrowUpDown,
  Check,
  Crown,
  Search,
  Star,
  Gem,
  RotateCcw,
  Navigation,
  Minus,
  Plus,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { scrollPositionUtil } from '@/utils/scrollPosition';

// Filter-Interface
interface Filters {
  searchQuery: string;
  // Nur anzeigen
  availableNow: boolean;
  onlineNow: boolean;
  verified: boolean;
  withPhoto: boolean;
  newProfile: boolean;
  showsPrices: boolean;
  withReviews: boolean;
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
  // Nur anzeigen
  availableNow: false,
  onlineNow: false,
  verified: false,
  withPhoto: false,
  newProfile: false,
  showsPrices: false,
  withReviews: false,
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
  useRadius: false,
  radiusKm: 100,
  userLatitude: null,
  userLongitude: null,
};

const FILTER_STORAGE_KEY = 'aurora_member_filters';
const LOCATION_SEARCH_KEY = 'aurora_location_search';
const SORT_STORAGE_KEY = 'aurora_member_sort';
const LAST_LOCATION_KEY = 'aurora_last_location';
const FIRST_VISIT_KEY = 'aurora_escorts_first_visit';

type GridView = 'compact' | 'comfortable';

export default function MembersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const t = useTranslations('members');
  const [escorts, setEscorts] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);

  // Initialize filters with lazy initialization from localStorage
  const [filters, setFilters] = useState<Filters>(() => {
    // Check if we have URL parameters (they take precedence)
    if (typeof window !== 'undefined') {
      try {
        const savedFilters = localStorage.getItem(FILTER_STORAGE_KEY);
        if (savedFilters) {
          const parsedFilters = JSON.parse(savedFilters);
          // Migrate old radius value: if saved radius is 50, update to new default of 100
          if (parsedFilters.radiusKm === 50) {
            parsedFilters.radiusKm = 100;
          }
          return { ...initialFilters, ...parsedFilters };
        }
      } catch (error) {
        console.error('Error loading filters during initialization:', error);
      }
    }
    return initialFilters;
  });

  type SortOption =
    | 'distance'
    | 'age-desc'
    | 'age-asc'
    | 'cupSize-desc'
    | 'cupSize-asc'
    | 'height-desc'
    | 'height-asc'
    | 'weight-desc'
    | 'weight-asc';

  // Initialize sortBy from localStorage
  const [sortBy, setSortBy] = useState<SortOption>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedSort = localStorage.getItem(SORT_STORAGE_KEY);
        if (savedSort) {
          return savedSort as SortOption;
        }
      } catch (error) {
        console.error('Error loading sort preference during initialization:', error);
      }
    }
    return 'distance';
  });

  const [gridView, setGridView] = useState<GridView>('comfortable');

  // Location search states - also initialize from localStorage
  const [locationSearch, setLocationSearch] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedLocationSearch = localStorage.getItem(LOCATION_SEARCH_KEY);
        return savedLocationSearch || '';
      } catch (error) {
        console.error('Error loading location search during initialization:', error);
      }
    }
    return '';
  });

  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [lastValidLocationSearch, setLastValidLocationSearch] = useState('');
  const [showGpsSuggestion, setShowGpsSuggestion] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Mobile sort dropdown state
  const [showMobileSortDropdown, setShowMobileSortDropdown] = useState(false);

  // Track if toolbar is stuck/fixed
  const [isToolbarStuck, setIsToolbarStuck] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const mobileSortButtonRef = useRef<HTMLButtonElement>(null);
  const mobileSortDropdownRef = useRef<HTMLDivElement>(null);

  // Track initial mount to prevent saving on first render
  const isInitialMount = useRef(true);

  // Save location to localStorage
  const saveLocationToStorage = (latitude: number, longitude: number) => {
    try {
      localStorage.setItem(LAST_LOCATION_KEY, JSON.stringify({ latitude, longitude }));
    } catch (error) {
      console.error('Error saving location to localStorage:', error);
    }
  };

  // Automatically detect location on first visit (using IP only, no GPS prompt)
  const detectLocationOnFirstVisit = async () => {
    // Use IP-based location without prompting for GPS permission
    // GPS will only be requested when user clicks the location icon
    console.info('First visit: detecting location via IP (no GPS prompt)');
    getLocationFromIP(true); // Show in search field
  };

  // Get location from IP address
  const getLocationFromIP = async (updateSearchField: boolean = false) => {
    const fallbackCoords = { latitude: 51.1657, longitude: 10.4515 }; // Center of Germany

    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();

      const latitude = data.latitude || fallbackCoords.latitude;
      const longitude = data.longitude || fallbackCoords.longitude;

      // Save location for future use
      saveLocationToStorage(latitude, longitude);

      // Update search field if requested (manual GPS button click)
      if (updateSearchField) {
        if (data.latitude && data.longitude) {
          const cityName = data.city || 'Ungefährer Standort';
          const postcode = data.postal || '';
          const displayName = postcode ? `${postcode} ${cityName}` : cityName;
          setLocationSearch(displayName);
          setLastValidLocationSearch(displayName);
        } else {
          setLocationSearch('Deutschland');
          setLastValidLocationSearch('Deutschland');
        }
      }

      // Update coordinates for distance calculation
      setFilters((prev) => ({
        ...prev,
        useRadius: updateSearchField, // Only enable radius filter if user manually requested
        userLatitude: latitude,
        userLongitude: longitude,
      }));
    } catch (error) {
      console.error('Error getting location from IP:', error);

      // Fallback to center of Germany
      if (updateSearchField) {
        setLocationSearch('Deutschland');
        setLastValidLocationSearch('Deutschland');
      }

      saveLocationToStorage(fallbackCoords.latitude, fallbackCoords.longitude);

      setFilters((prev) => ({
        ...prev,
        useRadius: updateSearchField,
        userLatitude: fallbackCoords.latitude,
        userLongitude: fallbackCoords.longitude,
      }));
    } finally {
      if (updateSearchField) {
        setIsLoadingLocation(false);
        setShowSuggestions(false);
      }
    }
  };

  // Process URL parameters from home page search and handle first visit
  useEffect(() => {
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const radius = searchParams.get('radius');

    if (lat && lon) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);
      const radiusKm = radius ? parseInt(radius) : 100;

      // Save location
      saveLocationToStorage(latitude, longitude);

      // Mark as visited (not first visit anymore)
      try {
        localStorage.setItem(FIRST_VISIT_KEY, 'false');
      } catch (error) {
        console.error('Error saving first visit flag:', error);
      }

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
    } else {
      // No URL parameters - check if first visit
      try {
        const isFirstVisit = localStorage.getItem(FIRST_VISIT_KEY) !== 'false';
        const savedLocationSearch = localStorage.getItem(LOCATION_SEARCH_KEY);

        if (isFirstVisit && !savedLocationSearch) {
          // First visit and no saved location search - automatically detect location
          console.info('First visit detected - automatically detecting location');
          detectLocationOnFirstVisit();

          // Mark as visited
          localStorage.setItem(FIRST_VISIT_KEY, 'false');
        } else if (savedLocationSearch && !locationSearch) {
          // Not first visit but search field is empty - restore from localStorage
          // This happens on page reload
          try {
            const savedLocation = localStorage.getItem(LAST_LOCATION_KEY);
            if (savedLocation) {
              const { latitude, longitude } = JSON.parse(savedLocation);
              setFilters((prev) => ({
                ...prev,
                userLatitude: latitude,
                userLongitude: longitude,
              }));
            } else {
              // No saved coordinates - get IP-based location silently
              getLocationFromIP(false);
            }
          } catch (error) {
            console.error('Error loading saved location:', error);
            getLocationFromIP(false);
          }
        } else if (!filters.userLatitude && !filters.userLongitude) {
          // No coordinates yet - load saved location or get IP-based
          try {
            const savedLocation = localStorage.getItem(LAST_LOCATION_KEY);
            if (savedLocation) {
              const { latitude, longitude } = JSON.parse(savedLocation);
              setFilters((prev) => ({
                ...prev,
                userLatitude: latitude,
                userLongitude: longitude,
              }));
            } else {
              // No saved location - get IP-based location silently
              getLocationFromIP(false);
            }
          } catch (error) {
            console.error('Error loading saved location:', error);
            getLocationFromIP(false);
          }
        }
      } catch (error) {
        console.error('Error checking first visit:', error);
        // Fallback to IP-based location
        getLocationFromIP(false);
      }
    }
  }, [searchParams]);

  // Save filters to LocalStorage on changes (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    try {
      localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error('Error saving filters to LocalStorage:', error);
    }
  }, [filters]);

  // Restore scroll position on mount
  useEffect(() => {
    scrollPositionUtil.restoreScrollPosition(pathname);
  }, [pathname]);

  // Save scroll position before navigating away
  useEffect(() => {
    const handleBeforeUnload = () => {
      scrollPositionUtil.saveScrollPosition(pathname);
    };

    // Save on window unload
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Save on route change (when clicking on profile cards)
    const handleRouteChange = () => {
      scrollPositionUtil.saveScrollPosition(pathname);
    };

    // Listen for link clicks
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link && link.href.includes('/profile/')) {
        handleRouteChange();
      }
    });

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pathname]);

  // Initialize lastValidLocationSearch when locationSearch is first loaded
  useEffect(() => {
    if (locationSearch && !lastValidLocationSearch) {
      setLastValidLocationSearch(locationSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Save location search to LocalStorage on changes
  useEffect(() => {
    try {
      if (locationSearch) {
        localStorage.setItem(LOCATION_SEARCH_KEY, locationSearch);
      } else {
        localStorage.removeItem(LOCATION_SEARCH_KEY);
      }
    } catch (error) {
      console.error('Error saving location search to LocalStorage:', error);
    }
  }, [locationSearch]);

  // Save sort preference to LocalStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(SORT_STORAGE_KEY, sortBy);
    } catch (error) {
      console.error('Error saving sort preference to LocalStorage:', error);
    }
  }, [sortBy]);

  // Save filters to LocalStorage on changes
  useEffect(() => {
    // Skip saving on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

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

  // Detect when toolbar becomes stuck/fixed
  useEffect(() => {
    if (!toolbarRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsToolbarStuck(!entry.isIntersecting);
      },
      { threshold: [1], rootMargin: '-1px 0px 0px 0px' }
    );

    const sentinelEl = document.createElement('div');
    sentinelEl.style.position = 'absolute';
    sentinelEl.style.top = '0';
    sentinelEl.style.height = '1px';
    sentinelEl.style.width = '100%';
    sentinelEl.style.pointerEvents = 'none';

    toolbarRef.current.parentElement?.insertBefore(sentinelEl, toolbarRef.current);
    observer.observe(sentinelEl);

    return () => {
      observer.disconnect();
      sentinelEl.remove();
    };
  }, []);

  // Close mobile sort dropdown on scroll
  useEffect(() => {
    if (!showMobileSortDropdown) return;

    const handleScroll = () => {
      setShowMobileSortDropdown(false);
    };

    // Close on scroll
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [showMobileSortDropdown]);

  // Close mobile sort dropdown when clicking outside
  useEffect(() => {
    if (!showMobileSortDropdown) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileSortDropdownRef.current &&
        !mobileSortDropdownRef.current.contains(event.target as Node) &&
        mobileSortButtonRef.current &&
        !mobileSortButtonRef.current.contains(event.target as Node)
      ) {
        setShowMobileSortDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMobileSortDropdown]);

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

  // Get user's current location (manual click on location button)
  const handleUseCurrentLocation = () => {
    setIsLoadingLocation(true);
    setShowGpsSuggestion(false); // Hide GPS suggestion when clicked

    // Mark as not first visit (user manually requested location)
    try {
      localStorage.setItem(FIRST_VISIT_KEY, 'false');
    } catch (error) {
      console.error('Error saving first visit flag:', error);
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Save location for future use
          saveLocationToStorage(latitude, longitude);

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
            setLastValidLocationSearch(displayName);
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
            setLastValidLocationSearch('Aktueller Standort');
          }

          setIsLoadingLocation(false);
        },
        (error) => {
          console.info('GPS location not available, using IP-based location');
          // Fallback to IP-based location WITH display
          getLocationFromIP(true); // Manual mode: update search field
        }
      );
    } else {
      // Browser doesn't support geolocation, use IP-based fallback
      console.log('Geolocation not supported, using IP-based fallback');
      getLocationFromIP(true); // Manual mode: update search field
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    const cityName =
      suggestion.address?.city ||
      suggestion.address?.town ||
      suggestion.address?.village ||
      suggestion.display_name;

    const latitude = parseFloat(suggestion.lat);
    const longitude = parseFloat(suggestion.lon);

    // Save location for future use
    saveLocationToStorage(latitude, longitude);

    // Mark as not first visit (user manually selected location)
    try {
      localStorage.setItem(FIRST_VISIT_KEY, 'false');
    } catch (error) {
      console.error('Error saving first visit flag:', error);
    }

    setLocationSearch(cityName);
    setLastValidLocationSearch(cityName); // Save as last valid value
    setFilters({
      ...filters,
      useRadius: true,
      userLatitude: latitude,
      userLongitude: longitude,
    });
    setShowSuggestions(false);
  };

  // Handle location search focus - clear the field for new input
  const handleLocationSearchFocus = () => {
    // Save the current value before clearing
    if (locationSearch) {
      setLastValidLocationSearch(locationSearch);
    }
    setLocationSearch('');
    setShowSuggestions(true);
    setShowGpsSuggestion(true); // Show GPS suggestion on focus
  };

  // Handle location search blur - restore if nothing was entered
  const handleLocationSearchBlur = () => {
    // Hide GPS suggestion immediately
    setShowGpsSuggestion(false);

    // Delay the restore to allow suggestion clicks to complete first
    setTimeout(() => {
      // If the field is empty and we have a last valid value, restore it
      if (!locationSearch && lastValidLocationSearch) {
        setLocationSearch(lastValidLocationSearch);
      }
    }, 200);
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
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
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
      const hasMatchingLanguage = escort.languages.some((lang) => filters.languages.includes(lang));
      if (!hasMatchingLanguage) return false;
    }

    // Type
    if (filters.types.length > 0) {
      if (!escort.type || !filters.types.includes(escort.type)) return false;
    }

    // Height
    if (
      filters.heightMin !== null &&
      (escort.height === null || escort.height === undefined || escort.height < filters.heightMin)
    )
      return false;
    if (
      filters.heightMax !== null &&
      (escort.height === null || escort.height === undefined || escort.height > filters.heightMax)
    )
      return false;

    // Weight
    if (
      filters.weightMin !== null &&
      (escort.weight === null || escort.weight === undefined || escort.weight < filters.weightMin)
    )
      return false;
    if (
      filters.weightMax !== null &&
      (escort.weight === null || escort.weight === undefined || escort.weight > filters.weightMax)
    )
      return false;

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

    // Nur anzeigen filters
    if (filters.onlineNow && !escort.isOnline) return false;
    if (filters.withPhoto && !escort.profilePicture) return false;

    // New profile (< 90 days old)
    if (filters.newProfile) {
      if (!escort.createdAt) return false;
      const createdDate = new Date(escort.createdAt);
      const daysSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreation >= 90) return false;
    }

    return true;
  });

  // Helper function to calculate distance for secondary sorting
  const getDistance = (escort: User) => {
    if (!filters.useRadius || !filters.userLatitude || !filters.userLongitude) {
      return Infinity;
    }
    const coords = escort.location?.coordinates;
    if (!coords || coords.length !== 2) return Infinity;
    const [lon, lat] = coords;
    return calculateDistance(filters.userLatitude, filters.userLongitude, lat, lon);
  };

  // Helper function to calculate age from birthdate
  const getAge = (birthDate: string | undefined): number => {
    if (!birthDate) return 0;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Helper function to convert cup size to numeric value for sorting
  const cupSizeToNumber = (cupSize: string | undefined): number => {
    if (!cupSize) return 0;
    const sizes = ['A', 'B', 'C', 'D', 'DD', 'E', 'F', 'G', 'H'];
    const index = sizes.indexOf(cupSize.toUpperCase());
    return index >= 0 ? index : 0;
  };

  // Sort escorts
  const sortedEscorts = [...filteredEscorts].sort((a, b) => {
    let primaryComparison = 0;

    switch (sortBy) {
      case 'distance':
        primaryComparison = getDistance(a) - getDistance(b);
        break;

      case 'age-desc':
        primaryComparison = getAge(b.birthDate) - getAge(a.birthDate);
        break;

      case 'age-asc':
        primaryComparison = getAge(a.birthDate) - getAge(b.birthDate);
        break;

      case 'cupSize-desc':
        primaryComparison = cupSizeToNumber(b.cupSize) - cupSizeToNumber(a.cupSize);
        break;

      case 'cupSize-asc':
        primaryComparison = cupSizeToNumber(a.cupSize) - cupSizeToNumber(b.cupSize);
        break;

      case 'height-desc':
        primaryComparison = (b.height || 0) - (a.height || 0);
        break;

      case 'height-asc':
        primaryComparison = (a.height || 0) - (b.height || 0);
        break;

      case 'weight-desc':
        primaryComparison = (b.weight || 0) - (a.weight || 0);
        break;

      case 'weight-asc':
        primaryComparison = (a.weight || 0) - (b.weight || 0);
        break;

      default:
        primaryComparison = 0;
    }

    // If primary comparison is equal, sort by distance (secondary sort)
    if (primaryComparison === 0) {
      return getDistance(a) - getDistance(b);
    }

    return primaryComparison;
  });

  // Navigate to profile
  const handleProfileClick = (username?: string) => {
    if (username) {
      router.push(`/profile/${username}`);
    }
  };

  // Reset filters (keep location search and radius)
  const handleResetFilters = () => {
    const resetFilters = {
      ...initialFilters,
      useRadius: filters.useRadius,
      radiusKm: filters.radiusKm,
      userLatitude: filters.userLatitude,
      userLongitude: filters.userLongitude,
    };

    setFilters(resetFilters);

    // Save the reset state with preserved location/radius to localStorage
    try {
      localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(resetFilters));
    } catch (error) {
      console.error('Error saving reset filters to LocalStorage:', error);
    }
  };

  // Handle radius increment
  const handleRadiusIncrement = () => {
    const newRadius = Math.min((filters.radiusKm || 0) + 5, 500);
    setFilters({ ...filters, radiusKm: newRadius });
  };

  // Handle radius decrement
  const handleRadiusDecrement = () => {
    const newRadius = Math.max((filters.radiusKm || 0) - 5, 5);
    setFilters({ ...filters, radiusKm: newRadius });
  };

  // Handle mobile sort dropdown toggle
  const handleMobileSortToggle = () => {
    setShowMobileSortDropdown(!showMobileSortDropdown);
  };

  // Check if filters are active (excluding location search and radius)
  const hasActiveFilters = () => {
    return (
      filters.searchQuery.trim() !== '' ||
      filters.availableNow ||
      filters.onlineNow ||
      filters.verified ||
      filters.withPhoto ||
      filters.newProfile ||
      filters.showsPrices ||
      filters.withReviews ||
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
      filters.hasPiercings !== 'all'
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
        <p className="text-xl text-muted">{t('loading')}</p>
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
            className="btn-base btn-primary cursor-pointer"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-8 pb-8 lg:pt-4">
      <div
        className="mx-auto px-4 sm:px-6 lg:px-0"
        style={{ maxWidth: 'var(--max-content-width)' }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl text-heading">{t('title')}</h1>
        </div>

        {/* Toolbar - Sticky on scroll */}
        <div
          ref={toolbarRef}
          className="mb-6 relative z-[100] bg-[#000000]/80 backdrop-blur-md transition-all duration-300"
        >
          <div>
            {/* Mobile Layout (Smartphone) */}
            <div className="block lg:hidden space-y-4">
              {/* First Row: Location Search + Radius */}
              <div className="flex gap-3 items-center">
                {/* Location Search Field */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted pointer-events-none z-10" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={locationSearch}
                    onChange={(e) => {
                      const value = e.target.value;
                      setLocationSearch(value);
                      setShowSuggestions(true);

                      // Hide GPS suggestion when user starts typing
                      if (value.length > 0) {
                        setShowGpsSuggestion(false);
                      }

                      // Disable radius filter when search field is cleared, but keep coordinates
                      if (value === '') {
                        setFilters(prev => ({
                          ...prev,
                          radiusKm: 100,
                          useRadius: false,
                          // Keep userLatitude and userLongitude for distance display
                        }));
                      }
                    }}
                    onFocus={handleLocationSearchFocus}
                    onBlur={handleLocationSearchBlur}
                    placeholder={t('searchPlaceholder')}
                    className="w-full pl-10 pr-10 py-2 border border-default rounded-lg bg-page-primary text-body focus:outline-none focus:border-primary"
                  />

                  {/* GPS Location Icon (hidden when GPS suggestion is shown) */}
                  {!showGpsSuggestion && (
                    !isLoadingLocation ? (
                      <button
                        onClick={handleUseCurrentLocation}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded transition cursor-pointer z-10"
                        style={{ color: 'var(--color-primary)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--background-secondary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '';
                        }}
                        title="Meinen Standort verwenden"
                      >
                        <Navigation className="w-5 h-5" />
                      </button>
                    ) : (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5">
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    )
                  )}

                  {/* GPS Location Suggestion */}
                  {showGpsSuggestion && (
                    <div className="absolute z-[9999] w-full mt-1 bg-page-secondary border border-default rounded-lg shadow-lg">
                      <button
                        onClick={handleUseCurrentLocation}
                        className="w-full text-left px-4 py-3 hover:bg-page-primary transition cursor-pointer flex items-center gap-3"
                      >
                        <Navigation className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                        <span className="text-body">Aktuellen Standort verwenden</span>
                      </button>
                    </div>
                  )}

                  {/* Autocomplete Suggestions */}
                  {showSuggestions && locationSuggestions.length > 0 && (
                    <div
                      ref={suggestionsRef}
                      className="absolute z-[9999] w-full mt-1 bg-page-secondary border border-default rounded-lg shadow-lg max-h-60 overflow-y-auto"
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
                            className="w-full text-left px-4 py-3 hover:bg-page-primary border-b border-default last:border-b-0 transition cursor-pointer"
                          >
                            <div className="text-body">{cityName}</div>
                            {postcode && <div className="text-sm text-muted">{postcode}</div>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Radius Field */}
                <div className="flex items-center gap-2 relative group">
                  <div className="relative w-24">
                    {/* Minus Button */}
                    <button
                      onClick={handleRadiusDecrement}
                      disabled={!locationSearch || filters.radiusKm <= 5}
                      className="absolute left-1.5 top-1/2 transform -translate-y-1/2 p-0.5 text-primary disabled:opacity-30 disabled:cursor-not-allowed transition z-10"
                      type="button"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    {/* Input Field */}
                    <input
                      type="number"
                      value={filters.radiusKm || ''}
                      onChange={(e) =>
                        setFilters({ ...filters, radiusKm: parseInt(e.target.value) || 0 })
                      }
                      onBlur={() => {
                        if (filters.radiusKm < 5) {
                          setFilters({ ...filters, radiusKm: 5 });
                        } else if (filters.radiusKm > 500) {
                          setFilters({ ...filters, radiusKm: 500 });
                        }
                      }}
                      min="5"
                      max="500"
                      step="5"
                      disabled={!locationSearch}
                      className="w-full pl-7 pr-8 py-2 border border-default rounded-lg bg-page-primary text-body text-center focus:outline-none focus:border-primary [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="km"
                    />

                    {/* Plus Button */}
                    <button
                      onClick={handleRadiusIncrement}
                      disabled={!locationSearch || filters.radiusKm >= 500}
                      className="absolute right-1.5 top-1/2 transform -translate-y-1/2 p-0.5 text-primary disabled:opacity-30 disabled:cursor-not-allowed transition z-10"
                      type="button"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {!locationSearch && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-page-secondary border border-default rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      <span className="text-sm text-body">{t('radiusTooltip')}</span>
                    </div>
                  )}
                  <span className="text-muted text-sm whitespace-nowrap">{t('km')}</span>
                </div>
              </div>

              {/* Second Row: Filter + Reset + Sort + View Switcher */}
              <div className="flex items-center justify-between gap-3">
                {/* Left Side: Filter Button + Reset Icon */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilterSidebarOpen(true)}
                    className="btn-base btn-primary flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ListFilter className="w-5 h-5" />
                    {t('filter')}
                    {hasActiveFilters() && (
                      <span
                        className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: '#eff3f4', color: '#8b5cf6' }}
                      >
                        {t('active')}
                      </span>
                    )}
                  </button>

                  {/* Reset Filters Icon */}
                  {hasActiveFilters() && (
                    <button
                      onClick={handleResetFilters}
                      className="p-2 rounded-lg border border-default bg-page-secondary text-muted hover:border-primary hover:text-primary transition cursor-pointer"
                      title={t('resetFilters')}
                      aria-label={t('resetFilters')}
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Right Side: Sort Dropdown + View Switcher */}
                <div className="flex items-center gap-2">
                  {/* Sort Dropdown (Mobile) */}
                  <div className="relative">
                    <button
                      ref={mobileSortButtonRef}
                      onClick={handleMobileSortToggle}
                      className="p-2 rounded-lg border bg-page-secondary transition-all duration-200 cursor-pointer"
                      style={{
                        borderColor: showMobileSortDropdown ? 'var(--color-primary)' : 'var(--border)',
                        color: showMobileSortDropdown ? 'var(--text-primary)' : 'var(--text-secondary)',
                      }}
                      onMouseEnter={(e) => {
                        if (!showMobileSortDropdown) {
                          e.currentTarget.style.color = 'var(--color-primary)';
                          e.currentTarget.style.borderColor = 'var(--color-primary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!showMobileSortDropdown) {
                          e.currentTarget.style.color = 'var(--text-secondary)';
                          e.currentTarget.style.borderColor = 'var(--border)';
                        }
                      }}
                      title={t('sorting')}
                    >
                      <ArrowUpDown className="w-5 h-5" />
                    </button>

                    {showMobileSortDropdown && (
                      <>
                        <div
                          ref={mobileSortDropdownRef}
                          className="absolute right-0 top-full mt-2 w-64 bg-page-secondary border border-default rounded-lg shadow-xl z-[9999] overflow-hidden"
                          style={{
                            animation: 'slideDown 0.2s ease-out',
                          }}
                        >
                            {[
                              { value: 'distance', label: t('sortDistanceAsc') },
                              { value: 'age-desc', label: t('sortAgeDesc') },
                              { value: 'age-asc', label: t('sortAgeAsc') },
                              { value: 'cupSize-desc', label: t('sortCupSizeDesc') },
                              { value: 'cupSize-asc', label: t('sortCupSizeAsc') },
                              { value: 'height-desc', label: t('sortHeightDesc') },
                              { value: 'height-asc', label: t('sortHeightAsc') },
                              { value: 'weight-desc', label: t('sortWeightDesc') },
                              { value: 'weight-asc', label: t('sortWeightAsc') },
                            ].map((option, index, array) => {
                              const isSelected = sortBy === option.value;
                              return (
                                <button
                                  key={option.value}
                                  onClick={() => {
                                    setSortBy(option.value as SortOption);
                                    setShowMobileSortDropdown(false);
                                  }}
                                  className={`w-full text-left px-4 py-3.5 transition-all duration-150 cursor-pointer text-sm ${
                                    index !== array.length - 1 ? 'border-b border-default' : ''
                                  } ${
                                    isSelected
                                      ? 'bg-action-primary/10 text-primary'
                                      : 'hover:bg-page-primary text-body'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className={isSelected ? 'font-medium' : ''}>{option.label}</span>
                                    {isSelected && (
                                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20">
                                        <Check className="w-3.5 h-3.5 text-primary" strokeWidth={3} />
                                      </div>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                        </div>

                        {/* Keyframes for animations */}
                        <style jsx>{`
                          @keyframes slideDown {
                            from {
                              opacity: 0;
                              transform: translateY(-8px);
                            }
                            to {
                              opacity: 1;
                              transform: translateY(0);
                            }
                          }
                        `}</style>
                      </>
                    )}
                  </div>

                  {/* View Switcher */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setGridView('compact')}
                      className={`p-2 rounded-lg border transition cursor-pointer ${
                        gridView === 'compact'
                          ? 'bg-action-primary text-button-primary border-primary'
                          : 'bg-page-secondary text-muted border-default hover:border-primary hover:text-action-primary'
                      }`}
                      title={t('compactView')}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setGridView('comfortable')}
                      className={`p-2 rounded-lg border transition cursor-pointer ${
                        gridView === 'comfortable'
                          ? 'bg-action-primary text-button-primary border-primary'
                          : 'bg-page-secondary text-muted border-default hover:border-primary hover:text-action-primary'
                      }`}
                      title={t('comfortableView')}
                    >
                      <Grid3x3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop/Tablet Layout */}
            <div className="hidden lg:flex items-end gap-4">
                {/* Filter Button (ganz links) */}
                <button
                  onClick={() => setFilterSidebarOpen(true)}
                  className="btn-base btn-primary flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  <ListFilter className="w-5 h-5" />
                  {t('filter')}
                  {hasActiveFilters() && (
                    <span
                      className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ backgroundColor: '#eff3f4', color: '#8b5cf6' }}
                    >
                      {t('active')}
                    </span>
                  )}
                </button>

                {/* Reset Filters Icon */}
                {hasActiveFilters() && (
                  <button
                    onClick={handleResetFilters}
                    className="p-2 rounded-lg border border-default bg-page-secondary text-muted hover:border-primary hover:text-primary transition cursor-pointer"
                    title={t('resetFilters')}
                    aria-label={t('resetFilters')}
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                )}

                {/* Location Search Field */}
                <div className="w-72 flex flex-col gap-1">
                  <label className="text-xs text-muted px-1">Stadt oder PLZ</label>
                  <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted pointer-events-none z-10" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={locationSearch}
                    onChange={(e) => {
                      const value = e.target.value;
                      setLocationSearch(value);
                      setShowSuggestions(true);

                      // Hide GPS suggestion when user starts typing
                      if (value.length > 0) {
                        setShowGpsSuggestion(false);
                      }

                      // Disable radius filter when search field is cleared, but keep coordinates
                      if (value === '') {
                        setFilters(prev => ({
                          ...prev,
                          radiusKm: 100,
                          useRadius: false,
                          // Keep userLatitude and userLongitude for distance display
                        }));
                      }
                    }}
                    onFocus={handleLocationSearchFocus}
                    onBlur={handleLocationSearchBlur}
                    placeholder={t('desktopSearchPlaceholder')}
                    className="w-full pl-10 pr-10 py-2 border border-default rounded-lg bg-page-primary text-body focus:outline-none focus:border-primary"
                  />

                  {/* GPS Location Icon (hidden when GPS suggestion is shown) */}
                  {!showGpsSuggestion && (
                    !isLoadingLocation ? (
                      <button
                        onClick={handleUseCurrentLocation}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded transition cursor-pointer z-10"
                        style={{ color: 'var(--color-primary)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--background-secondary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '';
                        }}
                        title="Meinen Standort verwenden"
                      >
                        <Navigation className="w-5 h-5" />
                      </button>
                    ) : (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5">
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    )
                  )}

                  {/* GPS Location Suggestion */}
                  {showGpsSuggestion && (
                    <div className="absolute z-[9999] w-full mt-1 bg-page-secondary border border-default rounded-lg shadow-lg">
                      <button
                        onClick={handleUseCurrentLocation}
                        className="w-full text-left px-4 py-3 hover:bg-page-primary transition cursor-pointer flex items-center gap-3"
                      >
                        <Navigation className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                        <span className="text-body">Aktuellen Standort verwenden</span>
                      </button>
                    </div>
                  )}

                  {/* Autocomplete Suggestions */}
                  {showSuggestions && locationSuggestions.length > 0 && (
                    <div
                      ref={suggestionsRef}
                      className="absolute z-[9999] w-full mt-1 bg-page-secondary border border-default rounded-lg shadow-lg max-h-60 overflow-y-auto"
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
                            className="w-full text-left px-4 py-3 hover:bg-page-primary border-b border-default last:border-b-0 transition cursor-pointer"
                          >
                            <div className="text-body">{cityName}</div>
                            {postcode && <div className="text-sm text-muted">{postcode}</div>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  </div>
                </div>

                {/* Radius Field */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted px-1">Radius</label>
                  <div className="flex items-center gap-2 relative group">
                    <div className="relative w-24">
                      {/* Minus Button */}
                      <button
                        onClick={handleRadiusDecrement}
                        disabled={!locationSearch || filters.radiusKm <= 5}
                        className="absolute left-1.5 top-1/2 transform -translate-y-1/2 p-0.5 text-primary disabled:opacity-30 disabled:cursor-not-allowed transition z-10"
                        type="button"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      {/* Input Field */}
                      <input
                        type="number"
                        value={filters.radiusKm || ''}
                        onChange={(e) =>
                          setFilters({ ...filters, radiusKm: parseInt(e.target.value) || 0 })
                        }
                        onBlur={() => {
                          if (filters.radiusKm < 5) {
                            setFilters({ ...filters, radiusKm: 5 });
                          } else if (filters.radiusKm > 500) {
                            setFilters({ ...filters, radiusKm: 500 });
                          }
                        }}
                        min="5"
                        max="500"
                        step="5"
                        disabled={!locationSearch}
                        className="w-full pl-7 pr-8 py-2 border border-default rounded-lg bg-page-primary text-body text-center focus:outline-none focus:border-primary [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="km"
                      />

                      {/* Plus Button */}
                      <button
                        onClick={handleRadiusIncrement}
                        disabled={!locationSearch || filters.radiusKm >= 500}
                        className="absolute right-1.5 top-1/2 transform -translate-y-1/2 p-0.5 text-primary disabled:opacity-30 disabled:cursor-not-allowed transition z-10"
                        type="button"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {!locationSearch && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-page-secondary border border-default rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        <span className="text-sm text-body">{t('radiusTooltip')}</span>
                      </div>
                    )}
                    <span className="text-muted text-sm whitespace-nowrap">km</span>
                  </div>
                </div>

                {/* Spacer to push Sort + View Switcher to the right */}
                <div className="flex-grow"></div>

                {/* Sort Select */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-muted px-1">Sortierung</label>
                  <CustomSelect
                  value={sortBy}
                  onChange={(value) => setSortBy(value as SortOption)}
                  icon={<ArrowUpDown className="w-5 h-5" />}
                  options={[
                    { value: 'distance', label: t('sortDistanceAsc') },
                    { value: 'age-desc', label: t('sortAgeDesc') },
                    { value: 'age-asc', label: t('sortAgeAsc') },
                    { value: 'cupSize-desc', label: t('sortCupSizeDesc') },
                    { value: 'cupSize-asc', label: t('sortCupSizeAsc') },
                    { value: 'height-desc', label: t('sortHeightDesc') },
                    { value: 'height-asc', label: t('sortHeightAsc') },
                    { value: 'weight-desc', label: t('sortWeightDesc') },
                    { value: 'weight-asc', label: t('sortWeightAsc') },
                  ]}
                  className="min-w-[220px]"
                />
                </div>

                {/* View Switcher (ganz rechts) */}
                <div className="flex flex-col gap-1">
                  <div className="flex gap-2">
                  <button
                    onClick={() => setGridView('compact')}
                    className={`p-2 rounded-lg border transition cursor-pointer ${
                      gridView === 'compact'
                        ? 'bg-action-primary text-button-primary border-primary'
                        : 'bg-page-secondary text-muted border-default hover:border-primary hover:text-action-primary'
                    }`}
                    title={t('compactView')}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setGridView('comfortable')}
                    className={`p-2 rounded-lg border transition cursor-pointer ${
                      gridView === 'comfortable'
                        ? 'bg-action-primary text-button-primary border-primary'
                        : 'bg-page-secondary text-muted border-default hover:border-primary hover:text-action-primary'
                    }`}
                    title={t('comfortableView')}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </button>
                  </div>
                </div>
            </div>
          </div>
        </div>

        {/* Escorts Grid */}
        {sortedEscorts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted text-lg mb-4">
              {hasActiveFilters() ? t('noResultsWithFilters') : t('noResults')}
            </p>
            {hasActiveFilters() && (
              <button onClick={handleResetFilters} className="btn-base btn-primary cursor-pointer">
                {t('resetFilters')}
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
                  <div className="aspect-square bg-page-secondary flex items-center justify-center relative">
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

                    {/* Premium Badge */}
                    <div
                      className="absolute top-2 right-2 flex items-center justify-center w-7 h-7 rounded-full backdrop-blur-sm"
                      style={{
                        backgroundColor: 'var(--color-primary)',
                        opacity: 0.85,
                      }}
                    >
                      <Gem
                        className="w-3.5 h-3.5"
                        style={{
                          color: 'var(--color-link-secondary)',
                          fill: 'none',
                          strokeWidth: 2,
                        }}
                      />
                    </div>
                  </div>

                  {/* Information */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3 min-w-0">
                      <h3 className="text-base font-normal text-body truncate">
                        {escort.username || t('unknown')}
                      </h3>
                      {/* Verified Badge - only show if verified */}
                      {escort.isVerified && (
                        <div
                          className="flex items-center justify-center w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: 'var(--color-secondary)' }}
                        >
                          <Check
                            className="w-2.5 h-2.5"
                            style={{ color: 'var(--text-button)', strokeWidth: 3 }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted">
                      {/* Show distance */}
                      {filters.userLatitude && filters.userLongitude && escort.location ? (
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

                            return `${Math.round(distance)} km`;
                          })()}
                        </span>
                      ) : (
                        <span></span>
                      )}

                      {/* Star Rating (2.5 for testing) */}
                      <div className="flex items-center gap-1">
                        <Star
                          className="w-3.5 h-3.5"
                          style={{ color: 'var(--color-primary)', fill: 'var(--color-primary)' }}
                        />
                        <span className="text-sm text-body font-normal">2.5</span>
                      </div>
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
