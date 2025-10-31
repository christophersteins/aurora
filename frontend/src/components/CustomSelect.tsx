'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

export interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  options: CustomSelectOption[];
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  placeholder?: string;
  className?: string;
}

export default function CustomSelect({
  value,
  options,
  onChange,
  icon,
  placeholder = 'Select...',
  className = '',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const selectedOption = options.find((option) => option.value === value);

  // Set mounted state for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update dropdown position when opened
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8, // 8px gap - no scrollY needed for fixed position
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdown on scroll outside (but update position when hovering)
  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = (event: Event) => {
      // If hovering over dropdown, update position instead of closing
      if (isHovering) {
        if (buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect();
          setDropdownPosition({
            top: rect.bottom + 8, // no scrollY needed for fixed position
            left: rect.left,
            width: rect.width,
          });
        }
        return;
      }
      // Scrolling outside dropdown - close it
      setIsOpen(false);
    };

    // Listen to scroll events on window and all scrollable containers
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, isHovering]);

  // Update position on resize
  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 8, // no scrollY needed for fixed position
          left: rect.left,
          width: rect.width,
        });
      }
    };

    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const dropdownContent = isOpen && mounted && (
    <div
      ref={dropdownRef}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="fixed bg-page-secondary border border-default rounded-lg shadow-xl overflow-hidden animate-slideDown"
      style={{
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        width: `${dropdownPosition.width}px`,
        zIndex: 9999,
        animation: 'slideDown 0.2s ease-out',
      }}
    >
      <div className="max-h-80 overflow-y-auto custom-scrollbar">
        {options.map((option, index) => {
          const isSelected = option.value === value;

          return (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full flex items-center justify-between px-4 py-3 transition-all duration-150 cursor-pointer text-sm ${
                index !== options.length - 1 ? 'border-b border-default' : ''
              } ${
                isSelected
                  ? 'bg-action-primary/10 text-primary'
                  : 'hover:bg-page-primary text-body'
              }`}
            >
              <span className="text-left">{option.label}</span>

              {/* Check Icon for selected */}
              {isSelected && (
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/20">
                  <Check className="w-3.5 h-3.5 text-primary" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Keyframe animation */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--color-border-default);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--color-primary);
        }
      `}</style>
    </div>
  );

  return (
    <div className={className}>
      {/* Select Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center gap-3 px-4 py-2.5 border border-default rounded-lg bg-page-primary hover:border-primary transition-all duration-200 cursor-pointer group text-sm ${
          isOpen ? 'text-body' : 'text-muted'
        }`}
      >
        {/* Icon */}
        {icon && <div className="text-muted transition-colors group-hover:text-primary">{icon}</div>}

        {/* Selected Label */}
        <span className="flex-1 text-left truncate">
          {selectedOption?.label || placeholder}
        </span>

        {/* Chevron Icon */}
        <ChevronDown
          className={`w-5 h-5 text-muted transition-all duration-300 ${
            isOpen ? 'rotate-180 text-primary' : 'rotate-0'
          }`}
        />
      </button>

      {/* Dropdown Menu (rendered via portal) */}
      {mounted && isOpen && createPortal(dropdownContent, document.body)}
    </div>
  );
}
