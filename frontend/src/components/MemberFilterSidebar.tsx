'use client';

import { X, Search, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect } from 'react';
import React from 'react';
import { useTranslations } from 'next-intl';
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

// Flaggen-Mapping für Nationalitäten
const NATIONALITY_FLAGS: Record<string, string> = {
  'Deutsch': '🇩🇪',
  'Österreichisch': '🇦🇹',
  'Schweizerisch': '🇨🇭',
  'Italienisch': '🇮🇹',
  'Französisch': '🇫🇷',
  'Spanisch': '🇪🇸',
  'Polnisch': '🇵🇱',
  'Russisch': '🇷🇺',
  'Türkisch': '🇹🇷',
  'Griechisch': '🇬🇷',
  'Rumänisch': '🇷🇴',
  'Bulgarisch': '🇧🇬',
  'Ungarisch': '🇭🇺',
  'Tschechisch': '🇨🇿',
  'Amerikanisch': '🇺🇸',
  'Britisch': '🇬🇧',
  'Brasilianisch': '🇧🇷',
  'Kolumbianisch': '🇨🇴',
  'Argentinisch': '🇦🇷',
  'Chinesisch': '🇨🇳',
  'Japanisch': '🇯🇵',
  'Thailändisch': '🇹🇭',
  'Andere': '🌍',
};

// Flaggen-Mapping für Sprachen
const LANGUAGE_FLAGS: Record<string, string> = {
  'Deutsch': '🇩🇪',
  'Englisch': '🇬🇧',
  'Französisch': '🇫🇷',
  'Spanisch': '🇪🇸',
  'Italienisch': '🇮🇹',
  'Polnisch': '🇵🇱',
  'Russisch': '🇷🇺',
  'Türkisch': '🇹🇷',
  'Griechisch': '🇬🇷',
  'Portugiesisch': '🇵🇹',
  'Niederländisch': '🇳🇱',
  'Arabisch': '🇸🇦',
  'Chinesisch': '🇨🇳',
  'Japanisch': '🇯🇵',
  'Thailändisch': '🇹🇭',
};

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
  const t = useTranslations('members.filters');
  const tCommon = useTranslations('members');
  const [showMoreFilters, setShowMoreFilters] = React.useState(false);

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
        className={`fixed inset-0 bg-black/60 transition-opacity duration-300 z-[10000] ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-96 lg:w-auto shadow-xl z-[10001] transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'var(--background-primary)',
          width: 'var(--filter-sidebar-width, 24rem)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-default sticky top-0 z-10"
             style={{ background: 'var(--background-primary)' }}>
          <h2 className="text-xl font-bold text-heading">{t('title')}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onResetFilters}
              className="p-2 hover:bg-page-primary rounded-full transition cursor-pointer"
              aria-label={tCommon('resetFilters')}
              title={tCommon('resetFilters')}
            >
              <RotateCcw className="w-5 h-5 text-muted" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-page-primary rounded-full transition cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-body" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Nur anzeigen */}
          <div>
            <label className="block text-sm font-medium text-body mb-3">
              {t('showOnly')}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateFilter('availableNow', !filters.availableNow)}
                className={`px-3 py-1.5 text-sm rounded-full border transition cursor-pointer ${
                  filters.availableNow
                    ? 'bg-action-primary text-button-primary border-primary'
                    : 'bg-page-secondary text-body border-default hover:border-primary'
                }`}
              >
                {t('availableNow')}
              </button>
              <button
                onClick={() => updateFilter('onlineNow', !filters.onlineNow)}
                className={`px-3 py-1.5 text-sm rounded-full border transition cursor-pointer ${
                  filters.onlineNow
                    ? 'bg-action-primary text-button-primary border-primary'
                    : 'bg-page-secondary text-body border-default hover:border-primary'
                }`}
              >
                {t('onlineNow')}
              </button>
              <button
                onClick={() => updateFilter('verified', !filters.verified)}
                className={`px-3 py-1.5 text-sm rounded-full border transition cursor-pointer ${
                  filters.verified
                    ? 'bg-action-primary text-button-primary border-primary'
                    : 'bg-page-secondary text-body border-default hover:border-primary'
                }`}
              >
                {t('verified')}
              </button>
              <button
                onClick={() => updateFilter('withPhoto', !filters.withPhoto)}
                className={`px-3 py-1.5 text-sm rounded-full border transition cursor-pointer ${
                  filters.withPhoto
                    ? 'bg-action-primary text-button-primary border-primary'
                    : 'bg-page-secondary text-body border-default hover:border-primary'
                }`}
              >
                {t('withPhoto')}
              </button>
              <button
                onClick={() => updateFilter('newProfile', !filters.newProfile)}
                className={`px-3 py-1.5 text-sm rounded-full border transition cursor-pointer ${
                  filters.newProfile
                    ? 'bg-action-primary text-button-primary border-primary'
                    : 'bg-page-secondary text-body border-default hover:border-primary'
                }`}
              >
                {t('newProfile')}
              </button>
              <button
                onClick={() => updateFilter('showsPrices', !filters.showsPrices)}
                className={`px-3 py-1.5 text-sm rounded-full border transition cursor-pointer ${
                  filters.showsPrices
                    ? 'bg-action-primary text-button-primary border-primary'
                    : 'bg-page-secondary text-body border-default hover:border-primary'
                }`}
              >
                {t('showsPrices')}
              </button>
              <button
                onClick={() => updateFilter('withReviews', !filters.withReviews)}
                className={`px-3 py-1.5 text-sm rounded-full border transition cursor-pointer ${
                  filters.withReviews
                    ? 'bg-action-primary text-button-primary border-primary'
                    : 'bg-page-secondary text-body border-default hover:border-primary'
                }`}
              >
                {t('withReviews')}
              </button>
            </div>
          </div>

          {/* Alter */}
          <div className="pt-4 border-t border-default">
            <label className="block text-sm font-medium text-body mb-3">
              {t('age')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <input
                  type="number"
                  placeholder={t('from').toLowerCase()}
                  value={filters.ageMin || ''}
                  onChange={(e) =>
                    updateFilter('ageMin', e.target.value ? parseInt(e.target.value) : null)
                  }
                  className="w-full px-3 py-2 pr-14 border border-default rounded-lg focus:outline-none bg-page-primary text-body"
                  min="18"
                  max="99"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted text-sm">
                  {t('units.age')}
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  placeholder={t('to').toLowerCase()}
                  value={filters.ageMax || ''}
                  onChange={(e) =>
                    updateFilter('ageMax', e.target.value ? parseInt(e.target.value) : null)
                  }
                  className="w-full px-3 py-2 pr-14 border border-default rounded-lg focus:outline-none bg-page-primary text-body"
                  min="18"
                  max="99"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted text-sm">
                  {t('units.age')}
                </span>
              </div>
            </div>
          </div>

          {/* Typ */}
          <div className="pt-4 border-t border-default">
            <label className="block text-sm font-medium text-body mb-3">
              {t('type')}
            </label>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleArrayItem('types', type)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition cursor-pointer ${
                    filters.types.includes(type)
                      ? 'bg-action-primary text-button-primary border-primary'
                      : 'bg-page-secondary text-body border-default hover:border-primary'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Körpertyp */}
          <div className="pt-4 border-t border-default">
            <label className="block text-sm font-medium text-body mb-3">
              {t('bodyType')}
            </label>
            <div className="flex flex-wrap gap-2">
              {BODY_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleArrayItem('bodyTypes', type)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition cursor-pointer ${
                    filters.bodyTypes.includes(type)
                      ? 'bg-action-primary text-button-primary border-primary'
                      : 'bg-page-secondary text-body border-default hover:border-primary'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Oberweite */}
          <div className="pt-4 border-t border-default">
            <label className="block text-sm font-medium text-body mb-3">
              {t('cupSize')}
            </label>
            <div className="flex flex-wrap gap-2">
              {CUP_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => toggleArrayItem('cupSizes', size)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition cursor-pointer ${
                    filters.cupSizes.includes(size)
                      ? 'bg-action-primary text-button-primary border-primary'
                      : 'bg-page-secondary text-body border-default hover:border-primary'
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
              {t('hairColor')}
            </label>
            <div className="flex flex-wrap gap-2">
              {HAIR_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => toggleArrayItem('hairColors', color)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition cursor-pointer ${
                    filters.hairColors.includes(color)
                      ? 'bg-action-primary text-button-primary border-primary'
                      : 'bg-page-secondary text-body border-default hover:border-primary'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Haarlänge */}
          <div className="pt-4 border-t border-default">
            <label className="block text-sm font-medium text-body mb-3">
              {t('hairLength')}
            </label>
            <div className="flex flex-wrap gap-2">
              {HAIR_LENGTHS.map((length) => (
                <button
                  key={length}
                  onClick={() => toggleArrayItem('hairLengths', length)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition cursor-pointer ${
                    filters.hairLengths.includes(length)
                      ? 'bg-action-primary text-button-primary border-primary'
                      : 'bg-page-secondary text-body border-default hover:border-primary'
                  }`}
                >
                  {length}
                </button>
              ))}
            </div>
          </div>

          {/* Nationalität */}
          <div className="pt-4 border-t border-default">
            <label className="block text-sm font-medium text-body mb-3">
              {t('nationality')}
            </label>
            {filters.nationalities.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {filters.nationalities.map((nat) => (
                  <span
                    key={nat}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-action-primary text-button-primary"
                  >
                    {nat}
                    <button
                      onClick={() => toggleArrayItem('nationalities', nat)}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="max-h-40 overflow-y-auto border border-default rounded-lg bg-page-primary"
                 style={{
                   scrollbarWidth: 'thin',
                   scrollbarColor: 'var(--color-muted) var(--background-page-primary)'
                 }}>
              {NATIONALITIES.map((nat) => (
                <button
                  key={nat}
                  onClick={() => toggleArrayItem('nationalities', nat)}
                  className={`w-full text-left px-3 py-2 text-sm transition cursor-pointer border-b border-default last:border-b-0 flex items-center gap-2 ${
                    filters.nationalities.includes(nat)
                      ? 'bg-action-primary/10 text-primary font-medium'
                      : 'text-body hover:bg-page-secondary hover:text-body'
                  }`}
                >
                  <span className="text-lg">{NATIONALITY_FLAGS[nat] || '🏳️'}</span>
                  <span>{nat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sprachen */}
          <div className="pt-4 border-t border-default">
            <label className="block text-sm font-medium text-body mb-3">
              {t('languages')}
            </label>
            {filters.languages.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {filters.languages.map((lang) => (
                  <span
                    key={lang}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-action-primary text-button-primary"
                  >
                    {lang}
                    <button
                      onClick={() => toggleArrayItem('languages', lang)}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="max-h-40 overflow-y-auto border border-default rounded-lg bg-page-primary"
                 style={{
                   scrollbarWidth: 'thin',
                   scrollbarColor: 'var(--color-muted) var(--background-page-primary)'
                 }}>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => toggleArrayItem('languages', lang)}
                  className={`w-full text-left px-3 py-2 text-sm transition cursor-pointer border-b border-default last:border-b-0 flex items-center gap-2 ${
                    filters.languages.includes(lang)
                      ? 'bg-action-primary/10 text-primary font-medium'
                      : 'text-body hover:bg-page-secondary hover:text-body'
                  }`}
                >
                  <span className="text-lg">{LANGUAGE_FLAGS[lang] || '🏳️'}</span>
                  <span>{lang}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Suchfeld */}
          <div className="pt-4 border-t border-default">
            <label className="block text-sm font-medium text-body mb-2">
              {t('search')}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => updateFilter('searchQuery', e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nach Benutzernamen suchen..."
                className="w-full pl-10 pr-4 py-2 border border-default rounded-lg focus:outline-none bg-page-primary text-body"
              />
            </div>
          </div>

          {/* Mehr anzeigen Button */}
          <div className="pt-4 border-t border-default">
            <button
              onClick={() => setShowMoreFilters(!showMoreFilters)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-page-secondary rounded-lg transition cursor-pointer"
            >
              <span>{showMoreFilters ? 'Weniger anzeigen' : 'Mehr anzeigen'}</span>
              {showMoreFilters ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Erweiterte Filter */}
          {showMoreFilters && (
            <>
              {/* Größe */}
              <div className="pt-4 border-t border-default">
                <label className="block text-sm font-medium text-body mb-3">
                  {t('height')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type="number"
                      placeholder={t('from').toLowerCase()}
                      value={filters.heightMin || ''}
                      onChange={(e) =>
                        updateFilter('heightMin', e.target.value ? parseInt(e.target.value) : null)
                      }
                      className="w-full px-3 py-2 pr-10 border border-default rounded-lg focus:outline-none bg-page-primary text-body"
                      min="140"
                      max="220"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted text-sm">
                      {t('units.cm')}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder={t('to').toLowerCase()}
                      value={filters.heightMax || ''}
                      onChange={(e) =>
                        updateFilter('heightMax', e.target.value ? parseInt(e.target.value) : null)
                      }
                      className="w-full px-3 py-2 pr-10 border border-default rounded-lg focus:outline-none bg-page-primary text-body"
                      min="140"
                      max="220"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted text-sm">
                      {t('units.cm')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Gewicht */}
              <div className="pt-4 border-t border-default">
                <label className="block text-sm font-medium text-body mb-3">
                  {t('weight')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type="number"
                      placeholder={t('from').toLowerCase()}
                      value={filters.weightMin || ''}
                      onChange={(e) =>
                        updateFilter('weightMin', e.target.value ? parseInt(e.target.value) : null)
                      }
                      className="w-full px-3 py-2 pr-10 border border-default rounded-lg focus:outline-none bg-page-primary text-body"
                      min="40"
                      max="150"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted text-sm">
                      {t('units.kg')}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder={t('to').toLowerCase()}
                      value={filters.weightMax || ''}
                      onChange={(e) =>
                        updateFilter('weightMax', e.target.value ? parseInt(e.target.value) : null)
                      }
                      className="w-full px-3 py-2 pr-10 border border-default rounded-lg focus:outline-none bg-page-primary text-body"
                      min="40"
                      max="150"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted text-sm">
                      {t('units.kg')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Augenfarbe */}
              <div className="pt-4 border-t border-default">
                <label className="block text-sm font-medium text-body mb-3">
                  {t('eyeColor')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {EYE_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => toggleArrayItem('eyeColors', color)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition cursor-pointer ${
                        filters.eyeColors.includes(color)
                          ? 'bg-action-primary text-button-primary border-primary'
                          : 'bg-page-secondary text-body border-default hover:border-primary'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Intimbereich */}
              <div className="pt-4 border-t border-default">
                <label className="block text-sm font-medium text-body mb-3">
                  {t('intimateHair')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTIMATE_HAIR.map((option) => (
                    <button
                      key={option}
                      onClick={() => toggleArrayItem('intimateHair', option)}
                      className={`px-3 py-1.5 text-sm rounded-full border transition cursor-pointer ${
                        filters.intimateHair.includes(option)
                          ? 'bg-action-primary text-button-primary border-primary'
                          : 'bg-page-secondary text-body border-default hover:border-primary'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tattoos */}
              <div className="pt-4 border-t border-default">
                <label className="block text-sm font-medium text-body mb-3">
                  {t('tattoos')}
                </label>
                <div className="flex gap-2">
                  {['all', 'yes', 'no'].map((option) => (
                    <button
                      key={option}
                      onClick={() => updateFilter('hasTattoos', option)}
                      className={`flex-1 px-4 py-2 text-sm rounded-lg border transition cursor-pointer ${
                        filters.hasTattoos === option
                          ? 'bg-action-primary text-button-primary border-primary'
                          : 'bg-page-secondary text-body border-default hover:border-primary'
                      }`}
                    >
                      {option === 'all' ? t('all') : option === 'yes' ? t('yes') : t('no')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Piercings */}
              <div className="pt-4 border-t border-default">
                <label className="block text-sm font-medium text-body mb-3">
                  {t('piercings')}
                </label>
                <div className="flex gap-2">
                  {['all', 'yes', 'no'].map((option) => (
                    <button
                      key={option}
                      onClick={() => updateFilter('hasPiercings', option)}
                      className={`flex-1 px-4 py-2 text-sm rounded-lg border transition cursor-pointer ${
                        filters.hasPiercings === option
                          ? 'bg-action-primary text-button-primary border-primary'
                          : 'bg-page-secondary text-body border-default hover:border-primary'
                      }`}
                    >
                      {option === 'all' ? t('all') : option === 'yes' ? t('yes') : t('no')}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Bottom Padding */}
          <div className="h-8"></div>
        </div>
      </div>
    </>
  );
}