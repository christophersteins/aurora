export interface TimeSlot {
  start: string;
  end: string;
}

export interface AvailabilitySchedule {
  monday?: TimeSlot[];
  tuesday?: TimeSlot[];
  wednesday?: TimeSlot[];
  thursday?: TimeSlot[];
  friday?: TimeSlot[];
  saturday?: TimeSlot[];
  sunday?: TimeSlot[];
}

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
  name?: string;
  showNameInProfile?: boolean;
  birthDate?: string;
  gender?: string;
  nationalities?: string[];
  languages?: string[];
  type?: string;
  height?: number;
  weight?: number;
  clothingSize?: string;
  bodyType?: string;
  cupSize?: string;
  hairColor?: string;
  hairLength?: string;
  eyeColor?: string;
  intimateHair?: string;
  hasTattoos?: boolean;
  hasPiercings?: boolean;
  isSmoker?: boolean;
  services?: string[];
  description?: string;
  availability?: AvailabilitySchedule;
  isOnline?: boolean;
  lastSeen?: string;
  readReceipts?: boolean;
  // Preise
  price30Min?: number;
  price1Hour?: number;
  price2Hours?: number;
  price3Hours?: number;
  price6Hours?: number;
  price12Hours?: number;
  price24Hours?: number;
  priceOvernight?: number;
  priceWeekend?: number;
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
  name?: string;
  showNameInProfile?: boolean;
  birthDate?: string;
  gender?: string;
  nationalities?: string[];
  languages?: string[];
  type?: string;
  height?: number;
  weight?: number;
  clothingSize?: string;
  bodyType?: string;
  cupSize?: string;
  hairColor?: string;
  hairLength?: string;
  eyeColor?: string;
  intimateHair?: string;
  hasTattoos?: boolean;
  hasPiercings?: boolean;
  isSmoker?: boolean;
  services?: string[];
  description?: string;
  availability?: AvailabilitySchedule;
  // Preise
  price30Min?: number;
  price1Hour?: number;
  price2Hours?: number;
  price3Hours?: number;
  price6Hours?: number;
  price12Hours?: number;
  price24Hours?: number;
  priceOvernight?: number;
  priceWeekend?: number;
}