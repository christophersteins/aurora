'use client';

import { X, Search, RotateCcw, MapPin } from 'lucide-react';
import { useEffect } from 'react';
import { MemberFilters } from '@/types/filter.types';
import {
  NATIONALITIES,
  LANGUAGES,
  TYPES,
  BODY_TYPES,
  CUP_SIZES,
  HAIR_COLORS,
  HAIR_LENGTHS,
  EYE_COLORS,
  INTIMATE_HAIR,
} from '@/constants/escortProfileOptions';

interface MemberFilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: MemberFilters;
  onFiltersChange: (filters: MemberFilters) => void;
  onResetFilters: () => void;
}

export default function MemberFilterSidebar({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onResetFilters,
}: MemberFilterSidebarProps) {
  // Verhindere Body-Scroll wenn Sidebar offen ist
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handler für Enter-Taste
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onClose();
    }
  };

  // Helper: Update Filter
  const updateFilter = (key: keyof MemberFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  // Helper: Toggle Array Item
  const toggleArrayItem = (key: keyof MemberFilters, item: string) => {
    const currentArray = filters[key] as string[];
    const newArray = currentArray.includes(item)
      ? currentArray.filter((i) => i !== item)
      : [...currentArray, item];
    updateFilter(key, newArray);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">Filter</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onResetFilters}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              aria-label="Filter zurücksetzen"
              title="Alle Filter zurücksetzen"
            >
              <RotateCcw className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
              aria-label="Schließen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Suchfeld */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Suche
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => updateFilter('searchQuery', e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Name oder Benutzername..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Umkreissuche */}
          <div className="pt-4 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Umkreissuche
            </label>
            
            <div className="space-y-4">
              {/* Standort-Button */}
              <button
                onClick={async () => {
                  if ('geolocation' in navigator) {
                    try {
                      console.log('🔍 Standort wird abgerufen (High-Accuracy)...');
                      
                      // Zeige einen Loading-State
                      const button = document.activeElement as HTMLButtonElement;
                      const originalText = button.innerHTML;
                      button.innerHTML = '<svg class="animate-spin h-4 w-4 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>';
                      button.disabled = true;
                      
                      const position = await new Promise<GeolocationPosition>(
                        (resolve, reject) => {
                          navigator.geolocation.getCurrentPosition(
                            resolve,
                            reject,
                            {
                              enableHighAccuracy: true, // GPS verwenden
                              timeout: 30000, // 30 Sekunden warten
                              maximumAge: 0 // Keine gecachten Werte
                            }
                          );
                        }
                      );
                      
                      const lat = position.coords.latitude;
                      const lon = position.coords.longitude;
                      const accuracy = position.coords.accuracy; // Genauigkeit in Metern
                      
                      console.log('✅ Standort erhalten:', { 
                        lat, 
                        lon, 
                        accuracy: `${accuracy.toFixed(0)}m`,
                        timestamp: new Date(position.timestamp).toLocaleString()
                      });
                      
                      // Setze alle drei Werte gleichzeitig
                      onFiltersChange({
                        ...filters,
                        userLatitude: lat,
                        userLongitude: lon,
                        useRadius: true,
                      });
                      
                      button.innerHTML = originalText;
                      button.disabled = false;
                      
                      // Zeige Genauigkeit an
                      if (accuracy > 1000) {
                        alert(
                          `⚠️ Standort erfolgreich gesetzt, aber ungenau!\n\n` +
                          `Genauigkeit: ~${(accuracy / 1000).toFixed(1)} km\n\n` +
                          `Tipp: Auf einem Smartphone mit GPS ist die Position viel genauer.\n\n` +
                          `Koordinaten:\nBreite: ${lat.toFixed(6)}\nLänge: ${lon.toFixed(6)}`
                        );
                      } else {
                        alert(
                          `✅ Standort erfolgreich gesetzt!\n\n` +
                          `Genauigkeit: ${accuracy.toFixed(0)} Meter\n\n` +
                          `Koordinaten:\nBreite: ${lat.toFixed(6)}\nLänge: ${lon.toFixed(6)}`
                        );
                      }
                    } catch (error: any) {
                      console.error('❌ Standort-Fehler:', error);
                      
                      let errorMessage = 'Standort konnte nicht abgerufen werden.\n\n';
                      
                      switch(error.code) {
                        case 1: // PERMISSION_DENIED
                          errorMessage += 'Du hast den Zugriff verweigert.\nBitte erlaube den Standortzugriff in den Browser-Einstellungen.';
                          break;
                        case 2: // POSITION_UNAVAILABLE
                          errorMessage += 'Standort konnte nicht ermittelt werden.\nBist du mit dem Internet verbunden?';
                          break;
                        case 3: // TIMEOUT
                          errorMessage += 'Zeitüberschreitung.\nDas GPS-Signal ist möglicherweise zu schwach.';
                          break;
                        default:
                          errorMessage += `Fehler: ${error.message}`;
                      }
                      
                      alert(errorMessage);
                      
                      // Button zurücksetzen
                      const button = document.activeElement as HTMLButtonElement;
                      if (button) {
                        button.innerHTML = originalText;
                        button.disabled = false;
                      }
                    }
                  } else {
                    alert('❌ Geolocation wird von diesem Browser nicht unterstützt.');
                  }
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MapPin className="w-4 h-4" />
                Mein Standort verwenden
              </button>

              {/* ODER: Manuelle Koordinaten-Eingabe */}
              <div className="text-center text-xs text-gray-500 my-2">oder</div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-700">
                  Manuelle Koordinaten-Eingabe
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="Breitengrad"
                    value={filters.userLatitude || ''}
                    onChange={(e) => {
                      const lat = e.target.value ? parseFloat(e.target.value) : null;
                      onFiltersChange({
                        ...filters,
                        userLatitude: lat,
                        useRadius: lat !== null && filters.userLongitude !== null,
                      });
                    }}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="number"
                    step="0.000001"
                    placeholder="Längengrad"
                    value={filters.userLongitude || ''}
                    onChange={(e) => {
                      const lon = e.target.value ? parseFloat(e.target.value) : null;
                      onFiltersChange({
                        ...filters,
                        userLongitude: lon,
                        useRadius: filters.userLatitude !== null && lon !== null,
                      });
                    }}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  💡 Tipp: Finde deine genauen Koordinaten auf{' '}
                  <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                    Google Maps
                  </a>
                </p>
              </div>

              {/* Standort-Anzeige */}
              {filters.userLatitude && filters.userLongitude && (
                <div className="text-xs space-y-1 bg-green-50 border border-green-200 p-3 rounded">
                  <div className="font-semibold text-green-800 flex items-center gap-1">
                    ✓ Standort aktiv
                  </div>
                  <div className="text-gray-600">
                    📍 Breite: {filters.userLatitude.toFixed(6)}
                  </div>
                  <div className="text-gray-600">
                    📍 Länge: {filters.userLongitude.toFixed(6)}
                  </div>
                  <div className="text-green-700 font-medium mt-1">
                    Suche im Umkreis von {filters.radiusKm} km
                  </div>
                </div>
              )}

              {/* Radius-Slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Radius
                  </label>
                  <span className="text-sm font-semibold text-indigo-600">
                    {filters.radiusKm} km
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="500"
                  step="1"
                  value={filters.radiusKm}
                  onChange={(e) => updateFilter('radiusKm', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 km</span>
                  <span>500 km</span>
                </div>
              </div>

              {/* Quick-Select Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[10, 25, 50, 100].map((km) => (
                  <button
                    key={km}
                    onClick={() => updateFilter('radiusKm', km)}
                    className={`px-2 py-1 text-xs rounded border transition ${
                      filters.radiusKm === km
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                    }`}
                  >
                    {km} km
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Alter */}
          <div className="pt-4 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Alter
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  placeholder="Von"
                  value={filters.ageMin || ''}
                  onChange={(e) =>
                    updateFilter('ageMin', e.target.value ? parseInt(e.target.value) : null)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="18"
                  max="99"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Bis"
                  value={filters.ageMax || ''}
                  onChange={(e) =>
                    updateFilter('ageMax', e.target.value ? parseInt(e.target.value) : null)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="18"
                  max="99"
                />
              </div>
            </div>
          </div>

          {/* Nationalität */}
          <div className="pt-4 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Nationalität
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-2">
              {NATIONALITIES.map((nat) => (
                <label key={nat} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={filters.nationalities.includes(nat)}
                    onChange={() => toggleArrayItem('nationalities', nat)}
                    className="mr-2 w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded"
                  />
                  <span className="text-sm">{nat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sprachen */}
          <div className="pt-4 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Sprachen
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-2">
              {LANGUAGES.map((lang) => (
                <label key={lang} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                  <input
                    type="checkbox"
                    checked={filters.languages.includes(lang)}
                    onChange={() => toggleArrayItem('languages', lang)}
                    className="mr-2 w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded"
                  />
                  <span className="text-sm">{lang}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Typ */}
          <div className="pt-4 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Typ
            </label>
            <div className="space-y-2">
              {TYPES.map((type) => (
                <label key={type} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={filters.types.includes(type)}
                    onChange={() => toggleArrayItem('types', type)}
                    className="mr-2 w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded"
                  />
                  <span className="text-sm">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Größe */}
          <div className="pt-4 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Größe (cm)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  placeholder="Von"
                  value={filters.heightMin || ''}
                  onChange={(e) =>
                    updateFilter('heightMin', e.target.value ? parseInt(e.target.value) : null)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="140"
                  max="220"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Bis"
                  value={filters.heightMax || ''}
                  onChange={(e) =>
                    updateFilter('heightMax', e.target.value ? parseInt(e.target.value) : null)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="140"
                  max="220"
                />
              </div>
            </div>
          </div>

          {/* Gewicht */}
          <div className="pt-4 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Gewicht (kg)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  placeholder="Von"
                  value={filters.weightMin || ''}
                  onChange={(e) =>
                    updateFilter('weightMin', e.target.value ? parseInt(e.target.value) : null)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="40"
                  max="200"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Bis"
                  value={filters.weightMax || ''}
                  onChange={(e) =>
                    updateFilter('weightMax', e.target.value ? parseInt(e.target.value) : null)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  min="40"
                  max="200"
                />
              </div>
            </div>
          </div>

          {/* Figur */}
          <div className="pt-4 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Figur
            </label>
            <div className="space-y-2">
              {BODY_TYPES.map((type) => (
                <label key={type} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={filters.bodyTypes.includes(type)}
                    onChange={() => toggleArrayItem('bodyTypes', type)}
                    className="mr-2 w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded"
                  />
                  <span className="text-sm">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Oberweite */}
          <div className="pt-4 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Oberweite
            </label>
            <div className="grid grid-cols-5 gap-2">
              {CUP_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => toggleArrayItem('cupSizes', size)}
                  className={`px-3 py-2 text-sm rounded-lg border transition ${
                    filters.cupSizes.includes(size)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Haarfarbe */}
          <div className="pt-4 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Haarfarbe
            </label>
            <div className="space-y-2">
              {HAIR_COLORS.map((color) => (
                <label key={color} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={filters.hairColors.includes(color)}
                    onChange={() => toggleArrayItem('hairColors', color)}
                    className="mr-2 w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded"
                  />
                  <span className="text-sm">{color}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Haarlänge */}
          <div className="pt-4 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Haarlänge
            </label>
            <div className="space-y-2">
              {HAIR_LENGTHS.map((length) => (
                <label key={length} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={filters.hairLengths.includes(length)}
                    onChange={() => toggleArrayItem('hairLengths', length)}
                    className="mr-2 w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded"
                  />
                  <span className="text-sm">{length}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Augenfarbe */}
          <div className="pt-4 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Augenfarbe
            </label>
            <div className="space-y-2">
              {EYE_COLORS.map((color) => (
                <label key={color} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={filters.eyeColors.includes(color)}
                    onChange={() => toggleArrayItem('eyeColors', color)}
                    className="mr-2 w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded"
                  />
                  <span className="text-sm">{color}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Intimbereich */}
          <div className="pt-4 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Intimbereich
            </label>
            <div className="space-y-2">
              {INTIMATE_HAIR.map((option) => (
                <label key={option} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={filters.intimateHair.includes(option)}
                    onChange={() => toggleArrayItem('intimateHair', option)}
                    className="mr-2 w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tattoos */}
          <div className="pt-4 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tattoos
            </label>
            <div className="flex gap-2">
              {['all', 'yes', 'no'].map((option) => (
                <button
                  key={option}
                  onClick={() => updateFilter('hasTattoos', option)}
                  className={`flex-1 px-4 py-2 text-sm rounded-lg border transition ${
                    filters.hasTattoos === option
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                  }`}
                >
                  {option === 'all' ? 'Egal' : option === 'yes' ? 'Ja' : 'Nein'}
                </button>
              ))}
            </div>
          </div>

          {/* Piercings */}
          <div className="pt-4 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Piercings
            </label>
            <div className="flex gap-2">
              {['all', 'yes', 'no'].map((option) => (
                <button
                  key={option}
                  onClick={() => updateFilter('hasPiercings', option)}
                  className={`flex-1 px-4 py-2 text-sm rounded-lg border transition ${
                    filters.hasPiercings === option
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                  }`}
                >
                  {option === 'all' ? 'Egal' : option === 'yes' ? 'Ja' : 'Nein'}
                </button>
              ))}
            </div>
          </div>

          {/* Raucher/in */}
          <div className="pt-4 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Raucher/in
            </label>
            <div className="flex gap-2">
              {['all', 'yes', 'no'].map((option) => (
                <button
                  key={option}
                  onClick={() => updateFilter('isSmoker', option)}
                  className={`flex-1 px-4 py-2 text-sm rounded-lg border transition ${
                    filters.isSmoker === option
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                  }`}
                >
                  {option === 'all' ? 'Egal' : option === 'yes' ? 'Ja' : 'Nein'}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Padding */}
          <div className="h-8"></div>
        </div>
      </div>
    </>
  );
}