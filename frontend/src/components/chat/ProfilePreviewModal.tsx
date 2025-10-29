'use client';

import React from 'react';
import { X, ExternalLink, Circle, Clock } from 'lucide-react';
import ProfileAvatar from '@/components/ProfileAvatar';
import Link from 'next/link';
import { useOnlineStatusStore } from '@/store/onlineStatusStore';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface ProfilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  username: string;
  profilePicture?: string;
  role?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export const ProfilePreviewModal: React.FC<ProfilePreviewModalProps> = ({
  isOpen,
  onClose,
  userId,
  username,
  profilePicture,
  role,
  isOnline,
  lastSeen,
}) => {
  const { getUserStatus } = useOnlineStatusStore();

  if (!isOpen) return null;

  // Get real-time status
  const liveStatus = getUserStatus(userId);
  const userIsOnline = liveStatus.lastSeen ? liveStatus.isOnline : (isOnline || false);
  const userLastSeen = liveStatus.lastSeen || (lastSeen ? new Date(lastSeen) : null);

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in cursor-pointer"
      onClick={onClose}
    >
      <div
        className="bg-page-secondary rounded-2xl p-6 w-full max-w-sm border border-default shadow-2xl animate-fade-in cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={onClose}
            className="text-muted hover:text-heading transition-colors p-1 rounded-full hover:bg-page-primary cursor-pointer"
            title="Schließen"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Profile Picture - Large */}
        <div className="flex justify-center mb-4">
          <ProfileAvatar
            profilePicture={profilePicture}
            role={role}
            username={username}
            size="2xl"
          />
        </div>

        {/* Username */}
        <h2 className="text-2xl font-bold text-heading text-center mb-2">
          {username}
        </h2>

        {/* Online Status */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {userIsOnline ? (
            <>
              <Circle className="w-3 h-3" style={{ color: '#10b981', fill: '#10b981' }} />
              <span className="text-sm" style={{ color: 'var(--color-primary)' }}>
                Jetzt online
              </span>
            </>
          ) : (
            <>
              <Clock className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {userLastSeen ? (
                  `Zuletzt online ${formatDistanceToNow(userLastSeen, { addSuffix: true, locale: de })}`
                ) : (
                  'Offline'
                )}
              </span>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href={`/user/${userId}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full px-6 py-3 bg-action-primary text-button-primary rounded-full hover:bg-action-primary-hover transition-all duration-200 font-semibold hover:shadow-lg hover:shadow-primary/20 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Profil anzeigen</span>
            <ExternalLink className="w-4 h-4" />
          </Link>

          <button
            onClick={onClose}
            className="w-full px-6 py-3 text-body hover:bg-page-primary rounded-full transition-all duration-200 font-medium cursor-pointer"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
