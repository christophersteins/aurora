import apiClient from '@/lib/api-client';

export interface GalleryPhoto {
  id: string;
  photoUrl: string;
  order: number;
  createdAt: string;
}

export const galleryService = {
  async uploadPhotos(files: File[]): Promise<{ photos: GalleryPhoto[] }> {
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('photos', file);
    });

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

  getPhotoUrl(photoUrl: string): string {
    if (photoUrl.startsWith('http')) {
      return photoUrl;
    }
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${photoUrl}`;
  },
};