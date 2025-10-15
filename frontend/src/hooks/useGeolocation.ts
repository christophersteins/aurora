import { useState, useEffect } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
  permissionStatus: 'prompt' | 'granted' | 'denied' | null;
}

export const useGeolocation = (autoRequest: boolean = false) => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
    permissionStatus: null,
  });

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'Geolocation wird von diesem Browser nicht unterstützt',
      }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
          permissionStatus: 'granted',
        });
      },
      (error) => {
        let errorMessage = 'Standort konnte nicht abgerufen werden';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Standortzugriff wurde verweigert';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Standort ist nicht verfügbar';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Zeitüberschreitung beim Abrufen des Standorts';
        }

        setState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
          permissionStatus: 'denied',
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    if (autoRequest) {
      requestLocation();
    }
  }, [autoRequest]);

  return {
    ...state,
    requestLocation,
  };
};