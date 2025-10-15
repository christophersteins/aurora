import axios from 'axios';
import { LoginDto, RegisterDto, AuthResponse } from '@/types/auth.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const authService = {
  async login(credentials: LoginDto): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(
      `${API_URL}/auth/login`,
      credentials
    );
    return response.data;
  },

  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(
      `${API_URL}/auth/register`,
      data
    );
    return response.data;
  },

  async getProfile(token: string): Promise<any> {
    const response = await axios.get(`${API_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};