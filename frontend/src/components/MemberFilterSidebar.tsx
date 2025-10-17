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
        className={`fixed top-0 left-0 h-full w-96 bg-bg-primary shadow-xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-bg-primary z-10">
          <h2 className="text-xl">Filter</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onResetFilters}
              className="p-2 hover:bg-bg-secondary rounded-full transition"
              aria-label="Filter zurücksetzen"
              title="Alle Filter zurücksetzen"
            >
              <RotateCcw className="w-5 h-5 text-text-secondary" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-bg-secondary rounded-full transition"
              aria-label="Schließen"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Suchfeld */}
          <div>
            <label className="block text-sm font-medium text-text-heading mb-2">
              Suche
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => updateFilter('searchQuery', e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Name oder Benutzername..."
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-bg-primary text-text-regular"
              />
            </div>
          </div>

          {/* Umkreissuche */}
          <div className="pt-4 border-t border-border">
            <label className="block text-sm font-medium text-text-heading mb-3">
              Umkreissuche
            </label>
            
            <div className="space-y-3">
              {/* Toggle */}
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.useRadius}
                  onChange={(e) => updateFilter('useRadius', e.target.checked)}
                  className="mr-2 w-4 h-4 rounded"
                  style={{ accentColor: '#00d4ff' }}
                />
                <span className="text-sm text-text-regular">Umkreissuche aktivieren</span>
              </label>

              {/* Radius Slider */}
              {filters.useRadius && (
                <>
                  <div>
                    <label className="block text-sm text-text-secondary mb-2">
                      Radius: {filters.radiusKm} km
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={filters.radiusKm}
                      onChange={(e) => updateFilter('radiusKm', parseInt(e.target.value))}
                      className="w-full"
                      style={{ accentColor: '#00d4ff' }}
                    />
                  </div>

                  {/* Standort Button */}
                  <button
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            updateFilter('userLatitude', position.coords.latitude);
                            updateFilter('userLongitude', position.coords.longitude);
                          },
                          (error) => {
                            console.error('Fehler beim Abrufen des Standorts:', error);
                            alert('Standort konnte nicht ermittelt werden');
                          }
                        );
                      }
                    }}
                    className="btn-base btn-secondary w-full flex items-center justify-center gap-2"
                  >
                    <MapPin className="w-4 h-4" />
                    Meinen Standort verwenden
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Alter */}
          <div className="pt-4 border-t border-border">
            <label className="block text-sm font-medium text-text-heading mb-3">
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
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-bg-primary text-text-regular"
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
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-bg-primary text-text-regular"
                  min="18"
                  max="99"
                />
              </div>
            </div>
          </div>

          {/* Nationalität */}
          <div className="pt-4 border-t border-border">
            <label className="block text-sm font-medium text-text-heading mb-3">
              Nationalität
            </label>
            <div className="max-h-48 overflow-y-auto border border-border rounded-lg p-3 space-y-2">
              {NATIONALITIES.map((nat) => (
                <label key={nat} className="flex items-center cursor-pointer hover:bg-bg-secondary p-1 rounded">
                  <input
                    type="checkbox"
                    checked={filters.nationalities.includes(nat)}
                    onChange={() => toggleArrayItem('nationalities', nat)}
                    className="mr-2 w-4 h-4 rounded"
                    style={{ accentColor: '#00d4ff' }}
                  />
                  <span className="text-sm text-text-regular">{nat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sprachen */}
          <div className="pt-4 border-t border-border">
            <label className="block text-sm font-medium text-text-heading mb-3">
              Sprachen
            </label>
            <div className="max-h-48 overflow-y-auto border border-border rounded-lg p-3 space-y-2">
              {LANGUAGES.map((lang) => (
                <label key={lang} className="flex items-center cursor-pointer hover:bg-bg-secondary p-1 rounded">
                  <input
                    type="checkbox"
                    checked={filters.languages.includes(lang)}
                    onChange={() => toggleArrayItem('languages', lang)}
                    className="mr-2 w-4 h-4 rounded"
                    style={{ accentColor: '#00d4ff' }}
                  />
                  <span className="text-sm text-text-regular">{lang}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Typ */}
          <div className="pt-4 border-t border-border">
            <label className="block text-sm font-medium text-text-heading mb-3">
              Typ
            </label>
            <div className="space-y-2">
              {TYPES.map((type) => (
                <label key={type} className="flex items-center cursor-pointer hover:bg-bg-secondary p-2 rounded">
                  <input
                    type="checkbox"
                    checked={filters.types.includes(type)}
                    onChange={() => toggleArrayItem('types', type)}
                    className="mr-2 w-4 h-4 rounded"
                    style={{ accentColor: '#00d4ff' }}
                  />
                  <span className="text-sm text-text-regular">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Größe */}
          <div className="pt-4 border-t border-border">
            <label className="block text-sm font-medium text-text-heading mb-3">
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
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-bg-primary text-text-regular"
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
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-bg-primary text-text-regular"
                  min="140"
                  max="220"
                />
              </div>
            </div>
          </div>

          {/* Gewicht */}
          <div className="pt-4 border-t border-border">
            <label className="block text-sm font-medium text-text-heading mb-3">
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
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-bg-primary text-text-regular"
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
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-bg-primary text-text-regular"
                  min="40"
                  max="200"
                />
              </div>
            </div>
          </div>

          {/* Figur */}
          <div className="pt-4 border-t border-border">
            <label className="block text-sm font-medium text-text-heading mb-3">
              Figur
            </label>
            <div className="space-y-2">
              {BODY_TYPES.map((type) => (
                <label key={type} className="flex items-center cursor-pointer hover:bg-bg-secondary p-2 rounded">
                  <input
                    type="checkbox"
                    checked={filters.bodyTypes.includes(type)}
                    onChange={() => toggleArrayItem('bodyTypes', type)}
                    className="mr-2 w-4 h-4 rounded"
                    style={{ accentColor: '#00d4ff' }}
                  />
                  <span className="text-sm text-text-regular">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Oberweite */}
          <div className="pt-4 border-t border-border">
            <label className="block text-sm font-medium text-text-heading mb-3">
              Oberweite
            </label>
            <div className="grid grid-cols-5 gap-2">
              {CUP_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => toggleArrayItem('cupSizes', size)}
                  className={`px-3 py-2 text-sm rounded-lg border transition ${
                    filters.cupSizes.includes(size)
                      ? 'text-black border-primary'
                      : 'bg-bg-primary text-text-regular border-border hover:border-primary'
                  }`}
                  style={filters.cupSizes.includes(size) ? { backgroundColor: '#00d4ff' } : {}}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Haarfarbe */}
          <div className="pt-4 border-t border-border">
            <label className="block text-sm font-medium text-text-heading mb-3">
              Haarfarbe
            </label>
            <div className="flex flex-wrap gap-2">
              {HAIR_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => toggleArrayItem('hairColors', color)}
                  className={`px-3 py-2 text-sm rounded-lg border transition ${
                    filters.hairColors.includes(color)
                      ? 'text-black border-primary'
                      : 'bg-bg-primary text-text-regular border-border hover:border-primary'
                  }`}
                  style={filters.hairColors.includes(color) ? { backgroundColor: '#00d4ff' } : {}}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Haarlänge */}
          <div className="pt-4 border-t border-border">
            <label className="block text-sm font-medium text-text-heading mb-3">
              Haarlänge
            </label>
            <div className="flex flex-wrap gap-2">
              {HAIR_LENGTHS.map((length) => (
                <button
                  key={length}
                  onClick={() => toggleArrayItem('hairLengths', length)}
                  className={`px-3 py-2 text-sm rounded-lg border transition ${
                    filters.hairLengths.includes(length)
                      ? 'text-black border-primary'
                      : 'bg-bg-primary text-text-regular border-border hover:border-primary'
                  }`}
                  style={filters.hairLengths.includes(length) ? { backgroundColor: '#00d4ff' } : {}}
                >
                  {length}
                </button>
              ))}
            </div>
          </div>

          {/* Augenfarbe */}
          <div className="pt-4 border-t border-border">
            <label className="block text-sm font-medium text-text-heading mb-3">
              Augenfarbe
            </label>
            <div className="flex flex-wrap gap-2">
              {EYE_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => toggleArrayItem('eyeColors', color)}
                  className={`px-3 py-2 text-sm rounded-lg border transition ${
                    filters.eyeColors.includes(color)
                      ? 'text-black border-primary'
                      : 'bg-bg-primary text-text-regular border-border hover:border-primary'
                  }`}
                  style={filters.eyeColors.includes(color) ? { backgroundColor: '#00d4ff' } : {}}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Intimbereich */}
          <div className="pt-4 border-t border-border">
            <label className="block text-sm font-medium text-text-heading mb-3">
              Intimbereich
            </label>
            <div className="flex flex-wrap gap-2">
              {INTIMATE_HAIR.map((option) => (
                <button
                  key={option}
                  onClick={() => toggleArrayItem('intimateHair', option)}
                  className={`px-3 py-2 text-sm rounded-lg border transition ${
                    filters.intimateHair.includes(option)
                      ? 'text-black border-primary'
                      : 'bg-bg-primary text-text-regular border-border hover:border-primary'
                  }`}
                  style={filters.intimateHair.includes(option) ? { backgroundColor: '#00d4ff' } : {}}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Tattoos */}
          <div className="pt-4 border-t border-border">
            <label className="block text-sm font-medium text-text-heading mb-3">
              Tattoos
            </label>
            <div className="flex gap-2">
              {['all', 'yes', 'no'].map((option) => (
                <button
                  key={option}
                  onClick={() => updateFilter('hasTattoos', option)}
                  className={`flex-1 px-4 py-2 text-sm rounded-lg border transition ${
                    filters.hasTattoos === option
                      ? 'text-black border-primary'
                      : 'bg-bg-primary text-text-regular border-border hover:border-primary'
                  }`}
                  style={filters.hasTattoos === option ? { backgroundColor: '#00d4ff' } : {}}
                >
                  {option === 'all' ? 'Egal' : option === 'yes' ? 'Ja' : 'Nein'}
                </button>
              ))}
            </div>
          </div>

          {/* Piercings */}
          <div className="pt-4 border-t border-border">
            <label className="block text-sm font-medium text-text-heading mb-3">
              Piercings
            </label>
            <div className="flex gap-2">
              {['all', 'yes', 'no'].map((option) => (
                <button
                  key={option}
                  onClick={() => updateFilter('hasPiercings', option)}
                  className={`flex-1 px-4 py-2 text-sm rounded-lg border transition ${
                    filters.hasPiercings === option
                      ? 'text-black border-primary'
                      : 'bg-bg-primary text-text-regular border-border hover:border-primary'
                  }`}
                  style={filters.hasPiercings === option ? { backgroundColor: '#00d4ff' } : {}}
                >
                  {option === 'all' ? 'Egal' : option === 'yes' ? 'Ja' : 'Nein'}
                </button>
              ))}
            </div>
          </div>

          {/* Raucher/in */}
          <div className="pt-4 border-t border-border">
            <label className="block text-sm font-medium text-text-heading mb-3">
              Raucher/in
            </label>
            <div className="flex gap-2">
              {['all', 'yes', 'no'].map((option) => (
                <button
                  key={option}
                  onClick={() => updateFilter('isSmoker', option)}
                  className={`flex-1 px-4 py-2 text-sm rounded-lg border transition ${
                    filters.isSmoker === option
                      ? 'text-black border-primary'
                      : 'bg-bg-primary text-text-regular border-border hover:border-primary'
                  }`}
                  style={filters.isSmoker === option ? { backgroundColor: '#00d4ff' } : {}}
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