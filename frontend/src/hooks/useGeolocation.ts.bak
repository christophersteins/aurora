import { useState, useEffect } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null; // NEU: Genauigkeit in Metern
  error: string | null;
  loading: boolean;
  permissionStatus: 'prompt' | 'granted' | 'denied' | null;
}

export const useGeolocation = (autoRequest: boolean = false) => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null, // NEU
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
        const accuracy = position.coords.accuracy;
        
        // Log für Debugging
        console.log('📍 GPS-Position erhalten:', {
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6),
          accuracy: `${accuracy.toFixed(0)}m`,
          timestamp: new Date(position.timestamp).toLocaleString('de-DE'),
        });

        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: accuracy, // NEU: Genauigkeit speichern
          error: null,
          loading: false,
          permissionStatus: 'granted',
        });
      },
      (error) => {
        let errorMessage = 'Standort konnte nicht abgerufen werden';
        
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Standortzugriff wurde verweigert. Bitte erlaube den Zugriff in den Browser-Einstellungen.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Standort ist nicht verfügbar. Stelle sicher, dass GPS/Standortdienste aktiviert sind.';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Zeitüberschreitung beim Abrufen des Standorts. Versuche es erneut.';
        }

        console.error('❌ GPS-Fehler:', error);

        setState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
          permissionStatus: 'denied',
        }));
      },
      {
        enableHighAccuracy: true, // GPS verwenden statt IP/WiFi
        timeout: 30000, // 30 Sekunden warten
        maximumAge: 0, // Keine gecachten Werte verwenden
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