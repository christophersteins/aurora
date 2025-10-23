'use client';

import { X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
  const { logout } = useAuthStore();
  const router = useRouter();
  const t = useTranslations('nav');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;

      // Prevent scrolling
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      return () => {
        // Restore scrolling
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';

        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    onClose();
    router.push('/');
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop - covers entire viewport */}
      <div
        className="absolute inset-0 bg-black/60 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal - centered */}
      <div
        className="relative bg-page-primary border border-default rounded-lg shadow-lg w-full max-w-md animate-slide-in-up"
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
  );

  return createPortal(modalContent, document.body);
}
