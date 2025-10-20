'use client';

import { useState, useRef, useEffect } from 'react';

interface MultiSelectDropdownProps {
  label?: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export default function MultiSelectDropdown({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = 'Bitte wählen...',
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const toggleOption = (option: string) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter((v) => v !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  const removeOption = (option: string) => {
    onChange(selectedValues.filter((v) => v !== option));
  };

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {label && <label className="block text-sm font-medium mb-2 text-body">{label}</label>}
      
      <div className="relative" ref={dropdownRef}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="min-h-[42px] px-4 py-2 border border-default rounded focus-within:outline-none cursor-pointer bg-page-primary"
        >
          {selectedValues.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedValues.map((value) => (
                <span
                  key={value}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-primary-light text-action-primary rounded text-sm"
                >
                  {value}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOption(value);
                    }}
                    className="hover:text-action-primary-hover font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <span className="text-muted">{placeholder}</span>
          )}
        </div>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-page-primary border border-default rounded shadow-lg">
            <div className="p-2 border-b border-default">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder="Suchen..."
                className="w-full px-3 py-2 border border-default rounded focus:outline-none bg-page-primary text-body"
              />
            </div>

            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <label
                    key={option}
                    className="flex items-center px-4 py-2 hover:bg-page-primary cursor-pointer text-body border-b border-default last:border-b-0"
                  >
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(option)}
                      onChange={() => toggleOption(option)}
                      className="mr-2"
                    />
                    <span>{option}</span>
                  </label>
                ))
              ) : (
                <div className="px-4 py-2 text-muted text-center">
                  Keine Ergebnisse gefunden
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}