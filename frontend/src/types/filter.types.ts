export interface MemberFilters {
  searchQuery: string;
  ageMin: number | null;
  ageMax: number | null;
  nationalities: string[];
  languages: string[];
  heightMin: number | null;
  heightMax: number | null;
  weightMin: number | null;
  weightMax: number | null;
  bodyTypes: string[];
  cupSizes: string[];
  hairColors: string[];
  hairLengths: string[];
  eyeColors: string[];
  hasTattoos: 'all' | 'yes' | 'no';
  hasPiercings: 'all' | 'yes' | 'no';
  isSmoker: 'all' | 'yes' | 'no';
}

export const initialFilters: MemberFilters = {
  searchQuery: '',
  ageMin: null,
  ageMax: null,
  nationalities: [],
  languages: [],
  heightMin: null,
  heightMax: null,
  weightMin: null,
  weightMax: null,
  bodyTypes: [],
  cupSizes: [],
  hairColors: [],
  hairLengths: [],
  eyeColors: [],
  hasTattoos: 'all',
  hasPiercings: 'all',
  isSmoker: 'all',
};