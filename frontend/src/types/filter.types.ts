export interface MemberFilters {
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
  // Radius-Filter
  useRadius: boolean;
  radiusKm: number;
  userLatitude: number | null;
  userLongitude: number | null;
}

export const initialFilters: MemberFilters = {
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
  // Radius-Filter Defaults
  useRadius: false,
  radiusKm: 50,
  userLatitude: null,
  userLongitude: null,
};