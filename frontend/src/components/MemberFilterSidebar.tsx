'use client';

import { X, Search, RotateCcw } from 'lucide-react';
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
  // Prevent body scroll when sidebar is open
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

  // Handler for Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onClose();
    }
  };

  // Helper: Update Filter
  const updateFilter = (key: keyof MemberFilters, value: MemberFilters[keyof MemberFilters]) => {
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
        className={`fixed top-0 left-0 h-full w-96 bg-page-secondary shadow-xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-default sticky top-0 bg-page-secondary z-10">
          <h2 className="text-xl font-bold text-heading">Filter</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onResetFilters}
              className="p-2 hover:bg-page-primary rounded-full transition"
              aria-label="Reset filters"
              title="Reset all filters"
            >
              <RotateCcw className="w-5 h-5 text-muted" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-page-primary rounded-full transition"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-body" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Suchfeld */}
          <div>
            <label className="block text-sm font-medium text-body mb-2">
              Suche
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => updateFilter('searchQuery', e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Name or username..."
                className="w-full pl-10 pr-4 py-2 border border-default rounded-lg focus:outline-none bg-page-primary text-body"
              />
            </div>
          </div>

          {/* Alter */}
          <div className="pt-4 border-t border-default">
            <label className="block text-sm font-medium text-body mb-3">
              Alter
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  placeholder="From"
                  value={filters.ageMin || ''}
                  onChange={(e) =>
                    updateFilter('ageMin', e.target.value ? parseInt(e.target.value) : null)
                  }
                  className="w-full px-3 py-2 border border-default rounded-lg focus:outline-none bg-page-primary text-body"
                  min="18"
                  max="99"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="To"
                  value={filters.ageMax || ''}
                  onChange={(e) =>
                    updateFilter('ageMax', e.target.value ? parseInt(e.target.value) : null)
                  }
                  className="w-full px-3 py-2 border border-default rounded-lg focus:outline-none bg-page-primary text-body"
                  min="18"
                  max="99"
                />
              </div>
            </div>
          </div>

          {/* Nationalität */}
          <div className="pt-4 border-t border-default">
            <label className="block text-sm font-medium text-body mb-3">
              Nationalität
            </label>
            <div className="max-h-48 overflow-y-auto border border-default rounded-lg p-3 space-y-2 bg-page-primary">
              {NATIONALITIES.map((nat) => (
                <label key={nat} className="flex items-center cursor-pointer hover:bg-page-secondary p-1 rounded">
                  <input
                    type="checkbox"
                    checked={filters.nationalities.includes(nat)}
                    onChange={() => toggleArrayItem('nationalities', nat)}
                    className="mr-2 w-4 h-4 rounded"
                    style={{ accentColor: 'var(--color-primary)' }}
                  />
                  <span className="text-sm text-body">{nat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sprachen */}
          <div className="pt-4 border-t border-default">
            <label className="block text-sm font-medium text-body mb-3">
              Sprachen
            </label>
            <div className="max-h-48 overflow-y-auto border border-default rounded-lg p-3 space-y-2 bg-page-primary">
              {LANGUAGES.map((lang) => (
                <label key={lang} className="flex items-center cursor-pointer hover:bg-page-secondary p-1 rounded">
                  <input
                    type="checkbox"
                    checked={filters.languages.includes(lang)}
                    onChange={() => toggleArrayItem('languages', lang)}
                    className="mr-2 w-4 h-4 rounded"
                    style={{ accentColor: 'var(--color-primary)' }}
                  />
                  <span className="text-sm text-body">{lang}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Typ */}
          <div className="pt-4 border-t border-default">
            <label className="block text-sm font-medium text-body mb-3">
              Typ
            </label>
            <div className="space-y-2">
              {TYPES.map((type) => (
                <label key={type} className="flex items-center cursor-pointer hover:bg-page-primary p-2 rounded">
                  <input
                    type="checkbox"
                    checked={filters.types.includes(type)}
                    onChange={() => toggleArrayItem('types', type)}
                    className="mr-2 w-4 h-4 rounded"
                    style={{ accentColor: 'var(--color-primary)' }}
                  />
                  <span className="text-sm text-body">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Größe */}
          <div className="pt-4 border-t border-default">
            <label className="block text-sm font-medium text-body mb-3">
              Größe (cm)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  placeholder="From"
                  value={filters.heightMin || ''}
                  onChange={(e) =>
                    updateFilter('heightMin', e.target.value ? parseInt(e.target.value) : null)
                  }
                  className="w-full px-3 py-2 border border-default rounded-lg focus:outline-none bg-page-primary text-body"
                  min="140"
                  max="220"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="To"
                  value={filters.heightMax || ''}
                  onChange={(e) =>
                    updateFilter('heightMax', e.target.value ? parseInt(e.target.value) : null)
                  }
                  className="w-full px-3 py-2 border border-default rounded-lg focus:outline-none bg-page-primary text-body"
                  min="140"
                  max="220"
                />
              </div>
            </div>
          </div>

          {/* Gewicht */}
          <div className="pt-4 border-t border-default">
            <label className="block text-sm font-medium text-body mb-3">
              Gewicht (kg)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  placeholder="From"
                  value={filters.weightMin || ''}
                  onChange={(e) =>
                    updateFilter('weightMin', e.target.value ? parseInt(e.target.value) : null)
                  }
                  className="w-full px-3 py-2 border border-default rounded-lg focus:outline-none bg-page-primary text-body"
                  min="40"
                  max="150"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="To"
                  value={filters.weightMax || ''}
                  onChange={(e) =>
                    updateFilter('weightMax', e.target.value ? parseInt(e.target.value) : null)
                  }
                  className="w-full px-3 py-2 border border-default rounded-lg focus:outline-none bg-page-primary text-body"
                  min="40"
                  max="150"
                />
              </div>
            </div>
          </div>

          {/* Figur */}
          <div className="pt-4 border-t border-default">
            <label className="block text-sm font-medium text-body mb-3">
              Figur
            </label>
            <div className="space-y-2">
              {BODY_TYPES.map((type) => (
                <label key={type} className="flex items-center cursor-pointer hover:bg-page-primary p-2 rounded">
                  <input
                    type="checkbox"
                    checked={filters.bodyTypes.includes(type)}
                    onChange={() => toggleArrayItem('bodyTypes', type)}
                    className="mr-2 w-4 h-4 rounded"
                    style={{ accentColor: 'var(--color-primary)' }}
                  />
                  <span className="text-sm text-body">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Oberweite */}
          <div className="pt-4 border-t border-default">
            <label className="block text-sm font-medium text-body mb-3">
              Oberweite
            </label>
            <div className="flex flex-wrap gap-2">
              {CUP_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => toggleArrayItem('cupSizes', size)}
                  className={`px-3 py-2 text-sm rounded-lg border transition ${
                    filters.cupSizes.includes(size)
                      ? 'bg-action-primary text-button-primary border-primary'
                      : 'bg-page-primary text-body border-default hover:border-primary'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Haarfarbe */}
          <div className="pt-4 border-t border-default">
            <label className="block text-sm font-medium text-body mb-3">
              Haarfarbe
            </label>
            <div className="space-y-2">
              {HAIR_COLORS.map((color) => (
                <label key={color} className="flex items-center cursor-pointer hover:bg-page-primary p-2 rounded">
                  <input
                    type="checkbox"
                    checked={filters.hairColors.includes(color)}
                    onChange={() => toggleArrayItem('hairColors', color)}
                    className="mr-2 w-4 h-4 rounded"
                    style={{ accentColor: 'var(--color-primary)' }}
                  />
                  <span className="text-sm text-body">{color}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Haarlänge */}
          <div className="pt-4 border-t border-default">
            <label className="block text-sm font-medium text-body mb-3">
              Haarlänge
            </label>
            <div className="space-y-2">
              {HAIR_LENGTHS.map((length) => (
                <label key={length} className="flex items-center cursor-pointer hover:bg-page-primary p-2 rounded">
                  <input
                    type="checkbox"
                    checked={filters.hairLengths.includes(length)}
                    onChange={() => toggleArrayItem('hairLengths', length)}
                    className="mr-2 w-4 h-4 rounded"
                    style={{ accentColor: 'var(--color-primary)' }}
                  />
                  <span className="text-sm text-body">{length}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Augenfarbe */}
          <div className="pt-4 border-t border-default">
            <label className="block text-sm font-medium text-body mb-3">
              Augenfarbe
            </label>
            <div className="space-y-2">
              {EYE_COLORS.map((color) => (
                <label key={color} className="flex items-center cursor-pointer hover:bg-page-primary p-2 rounded">
                  <input
                    type="checkbox"
                    checked={filters.eyeColors.includes(color)}
                    onChange={() => toggleArrayItem('eyeColors', color)}
                    className="mr-2 w-4 h-4 rounded"
                    style={{ accentColor: 'var(--color-primary)' }}
                  />
                  <span className="text-sm text-body">{color}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Intimbereich */}
          <div className="pt-4 border-t border-default">
            <label className="block text-sm font-medium text-body mb-3">
              Intimbereich
            </label>
            <div className="space-y-2">
              {INTIMATE_HAIR.map((option) => (
                <label key={option} className="flex items-center cursor-pointer hover:bg-page-primary p-2 rounded">
                  <input
                    type="checkbox"
                    checked={filters.intimateHair.includes(option)}
                    onChange={() => toggleArrayItem('intimateHair', option)}
                    className="mr-2 w-4 h-4 rounded"
                    style={{ accentColor: 'var(--color-primary)' }}
                  />
                  <span className="text-sm text-body">{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tattoos */}
          <div className="pt-4 border-t border-default">
            <label className="block text-sm font-medium text-body mb-3">
              Tattoos
            </label>
            <div className="flex gap-2">
              {['all', 'yes', 'no'].map((option) => (
                <button
                  key={option}
                  onClick={() => updateFilter('hasTattoos', option)}
                  className={`flex-1 px-4 py-2 text-sm rounded-lg border transition ${
                    filters.hasTattoos === option
                      ? 'bg-action-primary text-button-primary border-primary'
                      : 'bg-page-primary text-body border-default hover:border-primary'
                  }`}
                >
                  {option === 'all' ? 'All' : option === 'yes' ? 'Yes' : 'No'}
                </button>
              ))}
            </div>
          </div>

          {/* Piercings */}
          <div className="pt-4 border-t border-default">
            <label className="block text-sm font-medium text-body mb-3">
              Piercings
            </label>
            <div className="flex gap-2">
              {['all', 'yes', 'no'].map((option) => (
                <button
                  key={option}
                  onClick={() => updateFilter('hasPiercings', option)}
                  className={`flex-1 px-4 py-2 text-sm rounded-lg border transition ${
                    filters.hasPiercings === option
                      ? 'bg-action-primary text-button-primary border-primary'
                      : 'bg-page-primary text-body border-default hover:border-primary'
                  }`}
                >
                  {option === 'all' ? 'All' : option === 'yes' ? 'Yes' : 'No'}
                </button>
              ))}
            </div>
          </div>

          {/* Raucher/in */}
          <div className="pt-4 border-t border-default">
            <label className="block text-sm font-medium text-body mb-3">
              Raucher/in
            </label>
            <div className="flex gap-2">
              {['all', 'yes', 'no'].map((option) => (
                <button
                  key={option}
                  onClick={() => updateFilter('isSmoker', option)}
                  className={`flex-1 px-4 py-2 text-sm rounded-lg border transition ${
                    filters.isSmoker === option
                      ? 'bg-action-primary text-button-primary border-primary'
                      : 'bg-page-primary text-body border-default hover:border-primary'
                  }`}
                >
                  {option === 'all' ? 'All' : option === 'yes' ? 'Yes' : 'No'}
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