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
    const newPoints = isSelected
      ? selectedPoints.filter((id) => id !== pointId)
      : [...selectedPoints, pointId];
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
        <h3 className="text-sm font-semibold text-heading mb-3">Incall</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {incallPoints.map((point) => {
            const isSelected = selectedPoints.includes(point.id);

            return (
              <button
                key={point.id}
                type="button"
                onClick={() => togglePoint(point.id)}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer flex items-start gap-3 text-left ${
                  isSelected
                    ? 'border-action-primary bg-action-primary/10'
                    : 'border-default bg-page-secondary hover:border-primary'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-action-primary text-white'
                      : 'bg-page-primary text-muted'
                  }`}
                >
                  <MaterialIcon icon={point.icon} className="text-[20px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold text-sm mb-0.5 ${isSelected ? 'text-heading' : 'text-body'}`}>
                    {point.label}
                  </h4>
                  <p className="text-xs text-muted line-clamp-2">
                    {point.description}
                  </p>
                </div>
                {isSelected && (
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 rounded-full bg-action-primary flex items-center justify-center">
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
        <h3 className="text-sm font-semibold text-heading mb-3">Outcall</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {outcallPoints.map((point) => {
            const isSelected = selectedPoints.includes(point.id);

            return (
              <button
                key={point.id}
                type="button"
                onClick={() => togglePoint(point.id)}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer flex items-start gap-3 text-left ${
                  isSelected
                    ? 'border-action-primary bg-action-primary/10'
                    : 'border-default bg-page-secondary hover:border-primary'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-action-primary text-white'
                      : 'bg-page-primary text-muted'
                  }`}
                >
                  <MaterialIcon icon={point.icon} className="text-[20px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold text-sm mb-0.5 ${isSelected ? 'text-heading' : 'text-body'}`}>
                    {point.label}
                  </h4>
                  <p className="text-xs text-muted line-clamp-2">
                    {point.description}
                  </p>
                </div>
                {isSelected && (
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 rounded-full bg-action-primary flex items-center justify-center">
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
