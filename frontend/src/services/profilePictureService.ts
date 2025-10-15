import apiClient from '@/lib/api-client';

export const profilePictureService = {
  async uploadProfilePicture(file: File): Promise<{ profilePicture: string }> {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const response = await apiClient.post('/users/upload-profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  getProfilePictureUrl(path: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    return `${baseUrl}${path}`;
  },
};