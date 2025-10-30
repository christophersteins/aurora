'use client';

import MaterialIcon from './MaterialIcon';
import { MEETING_POINTS } from '@/constants/escortProfileOptions';

interface MeetingPointsDisplayProps {
  selectedPoints?: string[];
}

export default function MeetingPointsDisplay({ selectedPoints = [] }: MeetingPointsDisplayProps) {
  // Ensure selectedPoints is always an array
  const points = selectedPoints || [];

  // Filter to show only selected points
  const selectedMeetingPoints = MEETING_POINTS.filter((point) => points.includes(point.id));

  // If no points are selected, show a message
  if (selectedMeetingPoints.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Noch keine Treffpunkte angegeben.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Meeting Points Grid - Show only selected points */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {selectedMeetingPoints.map((point) => {
          return (
            <div
              key={point.id}
              className="rounded-lg overflow-hidden transition-all"
              style={{
                background: 'var(--background-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="p-3">
                <div className="flex items-start gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                    style={{
                      background: 'var(--color-primary)',
                    }}
                  >
                    <MaterialIcon
                      icon={point.icon}
                      className="text-[16px]"
                      style={{
                        color: 'white',
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm" style={{ color: 'var(--text-heading)' }}>
                      {point.label}
                    </h4>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {point.description}
                    </p>
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
