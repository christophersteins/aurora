'use client';

import MaterialIcon from './MaterialIcon';
import { Check, X } from 'lucide-react';
import { MEETING_POINTS } from '@/constants/escortProfileOptions';

interface MeetingPointsDisplayProps {
  selectedPoints?: string[];
}

export default function MeetingPointsDisplay({ selectedPoints = [] }: MeetingPointsDisplayProps) {
  // Ensure selectedPoints is always an array
  const points = selectedPoints || [];

  return (
    <div className="space-y-3">
      {/* Meeting Points Grid - Show all points */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {MEETING_POINTS.map((point) => {
          const isSelected = points.includes(point.id);

          return (
            <div
              key={point.id}
              className={`rounded-lg overflow-hidden transition-all ${
                isSelected ? '' : 'opacity-40'
              }`}
              style={{
                background: 'var(--background-secondary)',
                border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--border)'}`,
              }}
            >
              <div className="p-3">
                <div className="flex items-center gap-3">
                  {/* Left side: Icon + Title */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                      style={{
                        background: isSelected ? 'var(--color-primary)' : 'var(--background-tertiary)',
                      }}
                    >
                      <MaterialIcon
                        icon={point.icon}
                        className="text-[16px]"
                        style={{
                          color: isSelected ? 'white' : 'var(--text-muted)',
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate" style={{ color: 'var(--text-heading)' }}>
                        {point.label}
                      </h4>
                      <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                        {point.description}
                      </p>
                    </div>
                  </div>
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {isSelected ? (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--color-primary)' }}>
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--background-tertiary)' }}>
                        <X className="w-3 h-3" style={{ color: 'var(--text-muted)' }} strokeWidth={2} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
