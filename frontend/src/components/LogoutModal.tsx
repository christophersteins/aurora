'use client';

import { X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
  const { logout } = useAuthStore();
  const router = useRouter();
  const t = useTranslations('nav');

  const handleLogout = () => {
    logout();
    onClose();
    router.push('/');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50 animate-fade-in cursor-pointer"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-page-primary border border-default rounded-lg shadow-lg w-full max-w-md pointer-events-auto animate-slide-in-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-default">
            <h2 className="text-xl font-semibold text-heading">
              {t('logout')}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-page-secondary rounded-lg transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={20} className="text-muted" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-body mb-6">
              Möchtest du dich wirklich abmelden?
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 btn-base btn-secondary cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 btn-base btn-primary cursor-pointer"
              >
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
