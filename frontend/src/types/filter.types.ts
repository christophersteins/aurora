export interface MemberFilters {
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
  // Radius-Filter
  useRadius: boolean;
  radiusKm: number;
  userLatitude: number | null;
  userLongitude: number | null;
}

export const initialFilters: MemberFilters = {
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
  // Radius-Filter Defaults
  useRadius: false,
  radiusKm: 50,
  userLatitude: null,
  userLongitude: null,
};