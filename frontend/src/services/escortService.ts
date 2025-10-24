import apiClient from '@/lib/api-client';
import { User } from '@/types/auth.types';

export const escortService = {
  async getAllEscorts(): Promise<User[]> {
    const response = await apiClient.get('/users/escorts');
    return response.data;
  },

  async getEscortById(id: string): Promise<User> {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  async getEscortByUsername(username: string): Promise<User> {
    // Konvertiere zu Kleinbuchstaben für URL
    const lowercaseUsername = username.toLowerCase();
    const response = await apiClient.get(`/users/username/${lowercaseUsername}`);
    return response.data;
  },

  async getSimilarEscorts(
    currentEscortId: string,
    filters: any,
    userLat?: number,
    userLon?: number,
    limit: number = 6
  ): Promise<User[]> {
    const params = new URLSearchParams();
    params.append('currentEscortId', currentEscortId);
    params.append('limit', limit.toString());

    if (userLat !== undefined && userLon !== undefined) {
      params.append('userLat', userLat.toString());
      params.append('userLon', userLon.toString());
    }

    if (filters) {
      params.append('filters', JSON.stringify(filters));
    }

    const response = await apiClient.get(`/users/escorts/similar?${params.toString()}`);
    return response.data;
  },
};