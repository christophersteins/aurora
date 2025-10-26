'use client';

import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import ProfileAvatar from '@/components/ProfileAvatar';
import Link from 'next/link';

interface ProfilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  username: string;
  profilePicture?: string;
  role?: string;
}

export const ProfilePreviewModal: React.FC<ProfilePreviewModalProps> = ({
  isOpen,
  onClose,
  userId,
  username,
  profilePicture,
  role,
}) => {
  if (!isOpen) return null;

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
        <div className="flex justify-center mb-6">
          <ProfileAvatar
            profilePicture={profilePicture}
            role={role}
            username={username}
            size="2xl"
          />
        </div>

        {/* Username */}
        <h2 className="text-2xl font-bold text-heading text-center mb-6">
          {username}
        </h2>

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
