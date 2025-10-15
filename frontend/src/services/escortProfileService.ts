import apiClient from '@/lib/api-client';
import { UpdateEscortProfileDto, User } from '@/types/auth.types';

export const escortProfileService = {
  async updateProfile(data: UpdateEscortProfileDto): Promise<User> {
    const response = await apiClient.patch('/users/escort-profile', data);
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get('/auth/profile');
    return response.data.user;
  },
};