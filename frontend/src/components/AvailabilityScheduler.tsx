'use client';

import { useState } from 'react';
import { Plus, Trash2, Clock } from 'lucide-react';
import { AvailabilitySchedule, TimeSlot } from '@/types/auth.types';

interface AvailabilitySchedulerProps {
  value: AvailabilitySchedule;
  onChange: (value: AvailabilitySchedule) => void;
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

export default function AvailabilityScheduler({ value, onChange }: AvailabilitySchedulerProps) {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  const toggleDay = (day: string) => {
    const newExpandedDays = new Set(expandedDays);
    if (newExpandedDays.has(day)) {
      newExpandedDays.delete(day);
    } else {
      newExpandedDays.add(day);
    }
    setExpandedDays(newExpandedDays);
  };

  const isDayActive = (day: string) => {
    return value[day as keyof AvailabilitySchedule]?.length > 0;
  };

  const addTimeSlot = (day: string) => {
    const currentSlots = value[day as keyof AvailabilitySchedule] || [];
    const newSlot: TimeSlot = { start: '09:00', end: '17:00' };
    onChange({
      ...value,
      [day]: [...currentSlots, newSlot],
    });
    setExpandedDays(prev => new Set([...prev, day]));
  };

  const removeTimeSlot = (day: string, index: number) => {
    const currentSlots = value[day as keyof AvailabilitySchedule] || [];
    const newSlots = currentSlots.filter((_, i) => i !== index);
    onChange({
      ...value,
      [day]: newSlots.length > 0 ? newSlots : undefined,
    });
  };

  const updateTimeSlot = (day: string, index: number, field: 'start' | 'end', time: string) => {
    const currentSlots = value[day as keyof AvailabilitySchedule] || [];
    const newSlots = [...currentSlots];
    newSlots[index] = { ...newSlots[index], [field]: time };
    onChange({
      ...value,
      [day]: newSlots,
    });
  };

  const formatTimeRange = (slots: TimeSlot[]) => {
    if (!slots || slots.length === 0) return 'Nicht verfügbar';
    return slots.map(slot => `${slot.start} - ${slot.end}`).join(', ');
  };

  return (
    <div className="space-y-2">
      {WEEKDAYS.map((weekday) => {
        const isActive = isDayActive(weekday.key);
        const isExpanded = expandedDays.has(weekday.key);
        const slots = value[weekday.key as keyof AvailabilitySchedule] || [];

        return (
          <div
            key={weekday.key}
            className="rounded-lg border transition-all"
            style={{
              background: 'var(--background-primary)',
              borderColor: isActive ? 'var(--color-primary)' : 'var(--border)',
              borderWidth: isActive ? '1.5px' : '1px',
            }}
          >
            {/* Day Header */}
            <div className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Day Icon/Indicator */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 font-semibold text-sm"
                    style={{
                      background: isActive
                        ? 'var(--color-primary)'
                        : 'var(--background-tertiary)',
                      color: isActive ? 'white' : 'var(--text-secondary)',
                    }}
                  >
                    {weekday.shortLabel}
                  </div>

                  {/* Day Name and Time Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-base" style={{ color: 'var(--text-heading)' }}>
                        {weekday.label}
                      </h4>
                      {isActive && (
                        <div
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            background: 'rgba(139, 92, 246, 0.1)',
                            color: 'var(--color-primary)',
                          }}
                        >
                          Verfügbar
                        </div>
                      )}
                    </div>
                    <p className="text-sm truncate" style={{ color: 'var(--text-secondary)' }}>
                      {formatTimeRange(slots)}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isActive && (
                    <button
                      onClick={() => toggleDay(weekday.key)}
                      className="p-2 rounded-lg transition-colors cursor-pointer"
                      style={{
                        background: isExpanded ? 'var(--background-tertiary)' : 'transparent',
                        color: 'var(--color-primary)',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = 'var(--background-tertiary)')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = isExpanded
                          ? 'var(--background-tertiary)'
                          : 'transparent')
                      }
                    >
                      <Clock className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => addTimeSlot(weekday.key)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                    style={{
                      background: 'var(--color-primary)',
                      color: 'white',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = 'var(--color-primary-hover)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = 'var(--color-primary)')
                    }
                  >
                    <Plus className="w-4 h-4 inline-block mr-1" />
                    Hinzufügen
                  </button>
                </div>
              </div>

              {/* Time Slots */}
              {isExpanded && isActive && (
                <div className="mt-4 space-y-3 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                  {slots.map((slot, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg"
                      style={{
                        background: 'var(--background-secondary)',
                      }}
                    >
                      {/* Start Time */}
                      <div className="flex-1">
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                          Von
                        </label>
                        <input
                          type="time"
                          value={slot.start}
                          onChange={(e) => updateTimeSlot(weekday.key, index, 'start', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border text-sm"
                          style={{
                            background: 'var(--background-primary)',
                            borderColor: 'var(--border)',
                            color: 'var(--text-body)',
                          }}
                        />
                      </div>

                      {/* Separator */}
                      <div className="pt-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        —
                      </div>

                      {/* End Time */}
                      <div className="flex-1">
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                          Bis
                        </label>
                        <input
                          type="time"
                          value={slot.end}
                          onChange={(e) => updateTimeSlot(weekday.key, index, 'end', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border text-sm"
                          style={{
                            background: 'var(--background-primary)',
                            borderColor: 'var(--border)',
                            color: 'var(--text-body)',
                          }}
                        />
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => removeTimeSlot(weekday.key, index)}
                        className="p-2 rounded-lg transition-colors cursor-pointer mt-6"
                        style={{
                          color: '#ef4444',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Help Text */}
      <div
        className="p-4 rounded-lg text-sm"
        style={{
          background: 'rgba(139, 92, 246, 0.05)',
          border: '1px solid var(--color-primary)',
          color: 'var(--text-secondary)',
        }}
      >
        💡 <strong>Tipp:</strong> Fügen Sie für jeden Tag mehrere Zeitslots hinzu, wenn Sie zu
        verschiedenen Zeiten verfügbar sind (z.B. 09:00-12:00 und 14:00-18:00).
      </div>
    </div>
  );
}
