'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar, X } from 'lucide-react';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  className?: string;
  locale?: string;
}

export default function DatePicker({ value, onChange, onBlur, className = '', locale = 'de' }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const [currentMonth, setCurrentMonth] = useState(
    value ? new Date(value) : new Date()
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Month names in different languages
  const monthNames: Record<string, string[]> = {
    de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  };

  // Day names in different languages
  const dayNames: Record<string, string[]> = {
    de: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
    en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  };

  // Clear button text
  const clearText: Record<string, string> = {
    de: 'Löschen',
    en: 'Clear',
  };

  const currentLocale = locale in monthNames ? locale : 'en';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onBlur?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onBlur]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Get first day of week (0 = Sunday, 1 = Monday, etc.)
    let firstDayOfWeek = firstDay.getDay();
    // Convert Sunday (0) to 7 for Monday-first week
    firstDayOfWeek = firstDayOfWeek === 0 ? 7 : firstDayOfWeek;

    const days: (Date | null)[] = [];

    // Add empty cells for days before month starts
    for (let i = 1; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const isoString = date.toISOString().split('T')[0];
    onChange(isoString);
    setIsOpen(false);
    onBlur?.();
  };

  const handleClear = () => {
    setSelectedDate(null);
    onChange('');
    setIsOpen(false);
    onBlur?.();
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          type="text"
          readOnly
          value={formatDate(selectedDate)}
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 pr-12 rounded-lg border bg-page-primary text-body border-default focus:outline-none cursor-pointer"
          placeholder="TT.MM.JJJJ"
        />
        <Calendar
          className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-action-primary pointer-events-none"
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 bg-page-secondary border border-[#2f3336] rounded-lg shadow-lg p-4 w-80">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={previousMonth}
              className="p-1 hover:bg-page-primary rounded transition-colors"
            >
              <svg className="w-5 h-5 text-body" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-heading font-semibold">
              {monthNames[currentLocale][currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 hover:bg-page-primary rounded transition-colors"
            >
              <svg className="w-5 h-5 text-body" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames[currentLocale].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {days.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const isSelected = selectedDate &&
                day.getDate() === selectedDate.getDate() &&
                day.getMonth() === selectedDate.getMonth() &&
                day.getFullYear() === selectedDate.getFullYear();

              const isToday =
                day.getDate() === new Date().getDate() &&
                day.getMonth() === new Date().getMonth() &&
                day.getFullYear() === new Date().getFullYear();

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  className={`aspect-square flex items-center justify-center text-sm rounded transition-colors ${
                    isSelected
                      ? 'bg-action-primary text-white font-semibold'
                      : isToday
                      ? 'bg-page-primary text-heading font-semibold'
                      : 'text-body hover:bg-page-primary'
                  }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          {/* Clear button */}
          {selectedDate && (
            <button
              type="button"
              onClick={handleClear}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-muted hover:text-heading border border-[#2f3336] rounded-lg hover:bg-page-primary transition-colors"
            >
              <X className="w-4 h-4" />
              {clearText[currentLocale]}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
