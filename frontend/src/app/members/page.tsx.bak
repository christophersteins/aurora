'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { escortService } from '@/services/escortService';
import { User } from '@/types/auth.types';
import MemberFilterSidebar from '@/components/MemberFilterSidebar';
import { Filter, MapPin, LayoutGrid, Grid3x3, ArrowUpDown } from 'lucide-react';

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
  radiusKm: 10,
  userLatitude: null,
  userLongitude: null,
};

const FILTER_STORAGE_KEY = 'aurora_member_filters';

type GridView = 'compact' | 'comfortable';

export default function MembersPage() {
  const router = useRouter();
  const [escorts, setEscorts] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSidebarOpen, setFilterSidebarOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [sortBy, setSortBy] = useState<'distance'>('distance');
  const [gridView, setGridView] = useState<GridView>('compact');

  // Lade Filter aus LocalStorage beim Mount
  useEffect(() => {
    try {
      const savedFilters = localStorage.getItem(FILTER_STORAGE_KEY);
      if (savedFilters) {
        const parsed = JSON.parse(savedFilters);
        setFilters({ ...initialFilters, ...parsed });
      }
    } catch (error) {
      console.error('Fehler beim Laden der Filter aus LocalStorage:', error);
    }
  }, []);

  // Speichere Filter in LocalStorage bei Änderungen
  useEffect(() => {
    try {
      localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error('Fehler beim Speichern der Filter in LocalStorage:', error);
    }
  }, [filters]);

  // Lade alle Escorts beim Mount
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

  // Berechne Alter aus Geburtsdatum
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

  // Berechne Distanz zwischen zwei Koordinaten (Haversine-Formel)
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Erdradius in km
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

  // Gefilterte Escorts
  const filteredEscorts = escorts.filter((escort) => {
    // Suchbegriff
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

    // Radius-Filter
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

    // Alter
    const age = calculateAge(escort.birthDate);
    if (filters.ageMin !== null && (age === null || age < filters.ageMin)) return false;
    if (filters.ageMax !== null && (age === null || age > filters.ageMax)) return false;

    // Nationalität
    if (filters.nationalities.length > 0) {
      if (!escort.nationalities || escort.nationalities.length === 0) return false;
      const hasMatchingNationality = escort.nationalities.some((nat) =>
        filters.nationalities.includes(nat)
      );
      if (!hasMatchingNationality) return false;
    }

    // Sprachen
    if (filters.languages.length > 0) {
      if (!escort.languages || escort.languages.length === 0) return false;
      const hasMatchingLanguage = escort.languages.some((lang) =>
        filters.languages.includes(lang)
      );
      if (!hasMatchingLanguage) return false;
    }

    // Typ
    if (filters.types.length > 0) {
      if (!escort.type || !filters.types.includes(escort.type)) return false;
    }

    // Größe
    if (filters.heightMin !== null && (escort.height === null || escort.height === undefined || escort.height < filters.heightMin)) return false;
    if (filters.heightMax !== null && (escort.height === null || escort.height === undefined || escort.height > filters.heightMax)) return false;

    // Gewicht
    if (filters.weightMin !== null && (escort.weight === null || escort.weight === undefined || escort.weight < filters.weightMin)) return false;
    if (filters.weightMax !== null && (escort.weight === null || escort.weight === undefined || escort.weight > filters.weightMax)) return false;

    // Figur
    if (filters.bodyTypes.length > 0) {
      if (!escort.bodyType || !filters.bodyTypes.includes(escort.bodyType)) return false;
    }

    // Oberweite
    if (filters.cupSizes.length > 0) {
      if (!escort.cupSize || !filters.cupSizes.includes(escort.cupSize)) return false;
    }

    // Haarfarbe
    if (filters.hairColors.length > 0) {
      if (!escort.hairColor || !filters.hairColors.includes(escort.hairColor)) return false;
    }

    // Haarlänge
    if (filters.hairLengths.length > 0) {
      if (!escort.hairLength || !filters.hairLengths.includes(escort.hairLength)) return false;
    }

    // Augenfarbe
    if (filters.eyeColors.length > 0) {
      if (!escort.eyeColor || !filters.eyeColors.includes(escort.eyeColor)) return false;
    }

    // Intimbereich
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

    // Raucher/in
    if (filters.isSmoker !== 'all') {
      const isSmoker = escort.isSmoker === true;
      if (filters.isSmoker === 'yes' && !isSmoker) return false;
      if (filters.isSmoker === 'no' && isSmoker) return false;
    }

    return true;
  });

  // Sortierung nach Entfernung (aufsteigend - nächste zuerst)
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

  // Funktion zum Navigieren zum Profil
  const handleProfileClick = (username?: string) => {
    if (username) {
      router.push(`/profile/${username}`);
    }
  };

  // Filter zurücksetzen
  const handleResetFilters = () => {
    setFilters(initialFilters);
    try {
      localStorage.removeItem(FILTER_STORAGE_KEY);
    } catch (error) {
      console.error('Fehler beim Entfernen der Filter aus LocalStorage:', error);
    }
  };

  // Prüfe ob Filter aktiv sind
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

  // Grid-Klassen basierend auf View-Auswahl
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
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl text-heading">Escorts</h1>
        </div>

        {/* Toolbar: Filter, Sortierung, View Switcher */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Linke Seite: Filter Button */}
          <div className="flex items-center">
            {/* Filter Button */}
            <button
              onClick={() => setFilterSidebarOpen(true)}
              className="btn-base btn-secondary flex items-center justify-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filter
              {hasActiveFilters() && (
                <span className="ml-1 px-2 py-0.5 bg-action-primary text-button-primary rounded-full text-xs font-semibold">
                  Aktiv
                </span>
              )}
            </button>
          </div>

          {/* Rechte Seite: Sortierung und View Switcher */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Sortierung Select */}
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'distance')}
                className="pl-10 pr-4 py-2 border border-default rounded-lg focus:outline-none bg-page-secondary text-body appearance-none cursor-pointer"
              >
                <option value="distance">Entfernung aufsteigend</option>
              </select>
            </div>

            {/* View Switcher */}
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setGridView('compact')}
                className={`p-2 rounded-lg border transition ${
                  gridView === 'compact'
                    ? 'bg-action-primary text-button-primary border-primary'
                    : 'bg-page-secondary text-muted border-default hover:border-primary hover:text-action-primary'
                }`}
                title="Kompakte Ansicht (weniger pro Reihe)"
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
                title="Komfortable Ansicht (mehr pro Reihe)"
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter zurücksetzen (wenn aktiv) */}
        {hasActiveFilters() && (
          <div className="mb-6">
            <button
              onClick={handleResetFilters}
              className="text-sm link-default"
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
                  className="bg-page-secondary border-depth rounded-lg overflow-hidden cursor-pointer transition-all hover:scale-105"
                >
                  {/* Profilbild */}
                  <div className="aspect-square bg-page-primary flex items-center justify-center">
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

                  {/* Informationen */}
                  <div className="p-4">
                    <h3 className="text-xl mb-3 text-heading">
                      {escort.username || 'Unbekannt'}
                    </h3>

                    <div className="flex items-center gap-3 text-sm text-muted">
                      {/* Entfernung anzeigen */}
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

                      {/* Alter */}
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