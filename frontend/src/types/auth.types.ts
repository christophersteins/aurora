export interface User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  profilePicture?: string;
  role?: 'customer' | 'escort' | 'business' | 'admin';
  isPremium?: boolean;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  // Escort-spezifische Felder
  birthDate?: string;
  nationalities?: string[];
  languages?: string[];
  type?: string;
  height?: number;
  weight?: number;
  bodyType?: string;
  cupSize?: string;
  hairColor?: string;
  hairLength?: string;
  eyeColor?: string;
  intimateHair?: string;
  hasTattoos?: boolean;
  hasPiercings?: boolean;
  isSmoker?: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  username: string;
  password: string;
  role?: 'customer' | 'escort' | 'business';
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface UpdateEscortProfileDto {
  birthDate?: string;
  nationalities?: string[];
  languages?: string[];
  type?: string;
  height?: number;
  weight?: number;
  bodyType?: string;
  cupSize?: string;
  hairColor?: string;
  hairLength?: string;
  eyeColor?: string;
  intimateHair?: string;
  hasTattoos?: boolean;
  hasPiercings?: boolean;
  isSmoker?: boolean;
  description?: string;
}