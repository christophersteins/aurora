'use client';

import { AvailabilitySchedule, TimeSlot } from '@/types/auth.types';

interface AvailabilityDisplayProps {
  availability?: AvailabilitySchedule;
}

const WEEKDAYS = [
  { key: 'monday', label: 'Montag', shortLabel: 'Mo' },
  { key: 'tuesday', label: 'Dienstag', shortLabel: 'Di' },
  { key: 'wednesday', label: 'Mittwoch', shortLabel: 'Mi' },
  { key: 'thursday', label: 'Donnerstag', shortLabel: 'Do' },
  { key: 'friday', label: 'Freitag', shortLabel: 'Fr' },
  { key: 'saturday', label: 'Samstag', shortLabel: 'Sa' },
  { key: 'sunday', label: 'Sonntag', shortLabel: 'So' },
] as const;

export default function AvailabilityDisplay({ availability }: AvailabilityDisplayProps) {
  const formatTimeRange = (slots?: TimeSlot[]) => {
    if (!slots || slots.length === 0) return 'Keine Termine';
    return slots.map(slot => `${slot.start} - ${slot.end}`).join(', ');
  };

  const isDayAvailable = (day: string) => {
    const slots = availability?.[day as keyof AvailabilitySchedule];
    return slots && slots.length > 0;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
      {WEEKDAYS.map((weekday) => {
        const slots = availability?.[weekday.key as keyof AvailabilitySchedule] || [];
        const isAvailable = slots.length > 0;

        return (
          <div
            key={weekday.key}
            className="relative p-4 rounded-lg border"
            style={{
              background: isAvailable
                ? 'var(--background-secondary)'
                : 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(139, 92, 246, 0.02) 100%)',
              borderColor: 'var(--border)',
              borderWidth: '1px',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
                  style={{
                    background: isAvailable ? 'var(--color-primary)' : 'var(--background-tertiary)',
                    color: isAvailable ? 'white' : 'var(--text-secondary)',
                  }}
                >
                  {weekday.shortLabel}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-heading)' }}>
                    {weekday.label}
                  </p>
                  <p className="text-xs" style={{ color: isAvailable ? 'var(--color-primary)' : 'var(--text-secondary)' }}>
                    {isAvailable ? 'Verfügbar' : 'Nicht verfügbar'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className="text-sm font-medium"
                  style={{ color: isAvailable ? 'var(--text-heading)' : 'var(--text-secondary)' }}
                >
                  {formatTimeRange(slots)}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
