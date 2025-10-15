'use client';

import { useState } from 'react';
import { useGeolocation } from './useGeolocation';
import { geolocationService } from '@/services/geolocationService';

interface UseLocationUpdateProps {
  userId: string | null;
  token: string | null;
  autoRequest?: boolean;
}

export const useLocationUpdate = ({ 
  userId, 
  token, 
  autoRequest = false 
}: UseLocationUpdateProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const { latitude, longitude, error, loading, requestLocation } = useGeolocation(autoRequest);

  const updateLocationInBackend = async () => {
    if (!userId || !token) {
      setUpdateError('User nicht eingeloggt');
      return;
    }

    if (!latitude || !longitude) {
      setUpdateError('Keine Koordinaten verfügbar');
      return;
    }

    setIsUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      await geolocationService.updateLocation(userId, latitude, longitude, token);
      setUpdateSuccess(true);
    } catch (err: any) {
      setUpdateError(err.response?.data?.message || 'Fehler beim Aktualisieren des Standorts');
    } finally {
      setIsUpdating(false);
    }
  };

  const requestAndUpdate = async () => {
    if (!userId || !token) {
      setUpdateError('User nicht eingeloggt');
      return;
    }

    setIsUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      // Standort abrufen und direkt verarbeiten
      await new Promise<void>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation wird nicht unterstützt'));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            try {
              // Direkt ans Backend senden
              await geolocationService.updateLocation(userId, lat, lng, token);
              setUpdateSuccess(true);
            } catch (err: any) {
              setUpdateError(
                err.response?.data?.message || 'Fehler beim Aktualisieren des Standorts'
              );
            }
            resolve();
          },
          (error) => {
            let errorMessage = 'Standort konnte nicht abgerufen werden';
            if (error.code === error.PERMISSION_DENIED) {
              errorMessage = 'Standortzugriff wurde verweigert';
            }
            reject(new Error(errorMessage));
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      });
    } catch (err: any) {
      setUpdateError(err.message || 'Fehler beim Abrufen des Standorts');
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    latitude,
    longitude,
    error: error || updateError,
    loading: loading || isUpdating,
    updateSuccess,
    requestLocation,
    updateLocationInBackend,
    requestAndUpdate,
  };
};