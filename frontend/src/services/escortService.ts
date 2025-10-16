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
};