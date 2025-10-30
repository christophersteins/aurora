'use client';

import { Link } from '@/i18n/routing';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/store/authStore';
import { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, ChevronDown, Bookmark, IdCard, CalendarCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import LogoutModal from './LogoutModal';

export default function UserMenu() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('nav');

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogoutClick = () => {
    setIsOpen(false);
    setLogoutModalOpen(true);
  };

  // Don't render until mounted to avoid hydration errors
  if (!mounted) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2">
        <div className="w-8 h-8 rounded-full bg-[#2f3336] animate-pulse" />
      </div>
    );
  }

  if (!user) return null;

  // Get profile picture URL or use initials
  const apiUrl = typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000')
    : 'http://localhost:4000';

  const profilePicUrl = user.profilePicture && user.profilePicture.startsWith('/')
    ? `${apiUrl}${user.profilePicture}`
    : user.profilePicture || null;

  const userInitial = ((user.username && user.username.length > 0)
    ? user.username[0]
    : (user.email && user.email.length > 0)
      ? user.email[0]
      : 'U').toUpperCase();

  const displayName = user.username || (user.email ? user.email.split('@')[0] : 'User');

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Menu Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center p-2 text-[#e7e9ea] hover:text-[#8b5cf6] rounded-lg transition cursor-pointer"
        aria-label="User menu"
      >
        <User size={20} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-[#15202b] border border-[#2f3336] rounded-lg shadow-lg py-2 z-50">
          {/* Menu Items */}
          <div className="py-1">
            <Link
              href={user.role === 'escort' ? '/escort-profile' : '/customer-profile'}
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 link-secondary"
            >
              <IdCard size={18} className="text-[#71767b]" />
              <span className="font-medium">{t('myProfile')}</span>
            </Link>

            {/* Dates - für alle Rollen */}
            <Link
              href="/dates"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 link-secondary"
            >
              <CalendarCheck size={18} className="text-[#71767b]" />
              <span className="font-medium">{t('dates')}</span>
            </Link>

            {/* Merkliste */}
            <Link
              href="/bookmarks"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 link-secondary"
            >
              <Bookmark size={18} className="text-[#71767b]" />
              <span className="font-medium">{t('bookmarks')}</span>
            </Link>

            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 link-secondary"
            >
              <Settings size={18} className="text-[#71767b]" />
              <span className="font-medium">{t('settings')}</span>
            </Link>

            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center space-x-3 px-4 py-3 link-secondary cursor-pointer"
            >
              <LogOut size={18} className="text-[#71767b]" />
              <span className="font-medium">{t('logout')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      <LogoutModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
      />
    </div>
  );
}
