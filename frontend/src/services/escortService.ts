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
};