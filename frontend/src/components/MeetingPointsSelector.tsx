'use client';

import MaterialIcon from './MaterialIcon';
import { MEETING_POINTS } from '@/constants/escortProfileOptions';

interface MeetingPointsSelectorProps {
  selectedPoints: string[];
  onChange: (points: string[]) => void;
}

export default function MeetingPointsSelector({ selectedPoints, onChange }: MeetingPointsSelectorProps) {
  const togglePoint = (pointId: string) => {
    const isSelected = selectedPoints.includes(pointId);
    let newPoints: string[];

    // Define incall options
    const incallOptions = ['escort_apartment', 'escort_shared'];
    const isIncallOption = incallOptions.includes(pointId);

    if (isIncallOption) {
      // If clicking on an incall option
      if (isSelected) {
        // Deselect the current incall option
        newPoints = selectedPoints.filter((id) => id !== pointId);
      } else {
        // Select this incall option and deselect the other incall option
        newPoints = selectedPoints.filter((id) => !incallOptions.includes(id));
        newPoints.push(pointId);
      }
    } else {
      // For outcall options, normal toggle behavior
      newPoints = isSelected
        ? selectedPoints.filter((id) => id !== pointId)
        : [...selectedPoints, pointId];
    }

    onChange(newPoints);
  };

  // Split meeting points into incall and outcall
  const incallPoints = MEETING_POINTS.filter(point =>
    point.id === 'escort_apartment' || point.id === 'escort_shared'
  );
  const outcallPoints = MEETING_POINTS.filter(point =>
    point.id !== 'escort_apartment' && point.id !== 'escort_shared'
  );

  return (
    <div className="space-y-6">
      {/* Incall Section */}
      <div>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-heading)' }}>Incall</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {incallPoints.map((point) => {
            const isSelected = selectedPoints.includes(point.id);

            return (
              <button
                key={point.id}
                type="button"
                onClick={() => togglePoint(point.id)}
                className="p-4 rounded-lg border transition-all cursor-pointer flex items-start gap-3 text-left"
                style={{
                  borderWidth: '1px',
                  borderColor: isSelected ? 'var(--color-primary)' : 'var(--border)',
                  background: 'var(--background-secondary)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{
                    background: isSelected ? 'var(--color-primary)' : 'var(--background-tertiary)',
                    color: isSelected ? 'white' : 'var(--text-muted)',
                  }}
                >
                  <MaterialIcon icon={point.icon} className="text-[20px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm mb-0.5" style={{ color: 'var(--text-heading)' }}>
                    {point.editLabel || point.label}
                  </h4>
                  <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                    {point.description}
                  </p>
                </div>
                {isSelected && (
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--color-primary)' }}>
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Outcall Section */}
      <div>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-heading)' }}>Outcall</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {outcallPoints.map((point) => {
            const isSelected = selectedPoints.includes(point.id);

            return (
              <button
                key={point.id}
                type="button"
                onClick={() => togglePoint(point.id)}
                className="p-4 rounded-lg border transition-all cursor-pointer flex items-start gap-3 text-left"
                style={{
                  borderWidth: '1px',
                  borderColor: isSelected ? 'var(--color-primary)' : 'var(--border)',
                  background: 'var(--background-secondary)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                  style={{
                    background: isSelected ? 'var(--color-primary)' : 'var(--background-tertiary)',
                    color: isSelected ? 'white' : 'var(--text-muted)',
                  }}
                >
                  <MaterialIcon icon={point.icon} className="text-[20px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm mb-0.5" style={{ color: 'var(--text-heading)' }}>
                    {point.editLabel || point.label}
                  </h4>
                  <p className="text-xs line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                    {point.description}
                  </p>
                </div>
                {isSelected && (
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--color-primary)' }}>
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
