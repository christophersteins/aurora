'use client';

import { Home, MapPin, Hotel } from 'lucide-react';

interface MeetingPoint {
  type: string;
  title: string;
  description: string;
  icon: typeof Home;
}

export default function MeetingPointsDisplay() {
  const meetingPoints: MeetingPoint[] = [
    {
      type: 'incall',
      title: 'Incall - Bei mir',
      description: 'Diskrete Wohnung in zentraler Lage',
      icon: Home,
    },
    {
      type: 'outcall',
      title: 'Outcall - Bei Ihnen',
      description: 'Hotel oder Wohnung im Stadtgebiet',
      icon: MapPin,
    },
    {
      type: 'hotel',
      title: 'Hotels & Dinner Dates',
      description: 'Hotelbesuche und gesellschaftliche Anlässe',
      icon: Hotel,
    },
  ];

  return (
    <div className="space-y-3">
      {/* Meeting Points Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {meetingPoints.map((point) => {
          const Icon = point.icon;

          return (
            <div
              key={point.type}
              className="rounded-lg overflow-hidden"
              style={{
                background: 'var(--background-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="p-3">
                <div className="flex items-center gap-3">
                  {/* Left side: Icon + Title */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'var(--color-primary)',
                      }}
                    >
                      <Icon
                        className="w-4 h-4"
                        style={{
                          color: 'white',
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate" style={{ color: 'var(--text-heading)' }}>
                        {point.title}
                      </h4>
                      <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                        {point.description}
                      </p>
                    </div>
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
