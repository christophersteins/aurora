import apiClient from '@/lib/api-client';

export interface GalleryPhoto {
  id: string;
  photoUrl: string;
  order: number;
  isFsk18: boolean;
  createdAt: string;
}

export const galleryService = {
  async uploadPhotos(files: File[], fsk18Flags?: boolean[]): Promise<{ photos: GalleryPhoto[] }> {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append('photos', file);
    });

    // Add FSK18 flags if provided
    if (fsk18Flags && fsk18Flags.length > 0) {
      formData.append('fsk18Flags', JSON.stringify(fsk18Flags));
    }

    const response = await apiClient.post('/users/upload-gallery-photos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  async getMyPhotos(): Promise<GalleryPhoto[]> {
    const response = await apiClient.get('/users/gallery-photos');
    return response.data;
  },

  async getPublicPhotos(userId: string): Promise<GalleryPhoto[]> {
    const response = await apiClient.get(`/users/gallery-photos/${userId}`);
    return response.data;
  },

  async deletePhoto(photoId: string): Promise<void> {
    await apiClient.delete(`/users/gallery-photos/${photoId}`);
  },

  async reorderPhotos(photoOrders: { id: string; order: number }[]): Promise<void> {
    await apiClient.patch('/users/gallery-photos/reorder', { photoOrders });
  },

  async updatePhotoFlags(
    photoId: string,
    isFsk18?: boolean,
  ): Promise<GalleryPhoto> {
    const response = await apiClient.patch(`/users/gallery-photos/${photoId}/flags`, {
      isFsk18,
    });
    return response.data.photo;
  },

  getPhotoUrl(photoUrl: string): string {
    if (photoUrl.startsWith('http')) {
      return photoUrl;
    }
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${photoUrl}`;
  },
};