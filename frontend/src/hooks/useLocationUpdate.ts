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

  const { 
    latitude, 
    longitude, 
    accuracy, // NEU: Genauigkeit auch hier verfügbar machen
    error, 
    loading, 
    requestLocation 
  } = useGeolocation(autoRequest);

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
      
      // Log für Debugging
      console.log('✅ Standort im Backend aktualisiert:', {
        lat: latitude.toFixed(6),
        lng: longitude.toFixed(6),
        accuracy: accuracy ? `${accuracy.toFixed(0)}m` : 'unbekannt'
      });
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Fehler beim Aktualisieren des Standorts';
      setUpdateError(errorMessage);
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
      await new Promise<void>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation wird nicht unterstützt'));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const acc = position.coords.accuracy;

            console.log('📍 GPS-Position für Update erhalten:', {
              lat: lat.toFixed(6),
              lng: lng.toFixed(6),
              accuracy: `${acc.toFixed(0)}m`,
              timestamp: new Date(position.timestamp).toLocaleString('de-DE'),
            });

            try {
              await geolocationService.updateLocation(userId, lat, lng, token);
              setUpdateSuccess(true);
              
              // Warnung bei ungenauer Position
              if (acc > 1000) {
                console.warn('⚠️ Ungenauer Standort gespeichert:', `${(acc / 1000).toFixed(1)} km Genauigkeit`);
              }
            } catch (err) {
              const errorMessage = err instanceof Error 
                ? err.message 
                : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Fehler beim Aktualisieren des Standorts';
              setUpdateError(errorMessage);
            }
            resolve();
          },
          (error) => {
            let errorMessage = 'Standort konnte nicht abgerufen werden';
            if (error.code === error.PERMISSION_DENIED) {
              errorMessage = 'Standortzugriff wurde verweigert';
            } else if (error.code === error.POSITION_UNAVAILABLE) {
              errorMessage = 'Standort nicht verfügbar - GPS aktivieren';
            } else if (error.code === error.TIMEOUT) {
              errorMessage = 'Zeitüberschreitung - schwaches GPS-Signal';
            }
            
            console.error('❌ GPS-Fehler:', error);
            reject(new Error(errorMessage));
          },
          {
            enableHighAccuracy: true, // WICHTIG: Konsistent mit anderen Stellen
            timeout: 30000, // 30 Sekunden statt 10
            maximumAge: 0, // Keine gecachten Werte
          }
        );
      });
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Fehler beim Abrufen des Standorts';
      setUpdateError(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    latitude,
    longitude,
    accuracy, // NEU: Genauigkeit zurückgeben
    error: error || updateError,
    loading: loading || isUpdating,
    updateSuccess,
    requestLocation,
    updateLocationInBackend,
    requestAndUpdate,
  };
};