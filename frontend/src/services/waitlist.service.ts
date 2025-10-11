import apiClient from '@/lib/api-client';

export interface JoinWaitlistData {
  email: string;
}

export const waitlistService = {
  async join(data: JoinWaitlistData): Promise<{ message: string; email: string }> {
    const response = await apiClient.post('/waitlist/join', data);
    return response.data;
  },

  async getCount(): Promise<{ count: number }> {
    const response = await apiClient.get('/waitlist/count');
    return response.data;
  },
};