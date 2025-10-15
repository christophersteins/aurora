import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface UpdateLocationDto {
  latitude: number;
  longitude: number;
}

interface User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
}

export const geolocationService = {
  async updateLocation(userId: string, latitude: number, longitude: number, token: string): Promise<User> {
    const response = await axios.put<User>(
      `${API_URL}/users/${userId}/location`,
      {
        latitude,
        longitude,
      } as UpdateLocationDto,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },

  async getNearbyUsers(
    latitude: number,
    longitude: number,
    radius: number,
    token: string,
    excludeUserId?: string
  ): Promise<User[]> {
    const response = await axios.get<User[]>(`${API_URL}/users/nearby`, {
      params: {
        latitude,
        longitude,
        radius,
        excludeUserId,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};