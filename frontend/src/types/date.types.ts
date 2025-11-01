export type DateStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface DateBooking {
  id: string;
  customerId: string;
  escortId: string;
  escortName: string;
  escortUsername: string;
  escortProfilePicture?: string;
  date: string;
  time: string;
  duration: number; // in minutes
  location: string;
  price: number;
  status: DateStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateDateBookingDto {
  escortId: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  price: number;
  notes?: string;
}

export interface UpdateDateBookingDto {
  date?: string;
  time?: string;
  duration?: number;
  location?: string;
  price?: number;
  status?: DateStatus;
  notes?: string;
}
