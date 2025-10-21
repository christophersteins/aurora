'use client';

import { Link } from '@/i18n/routing';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/store/authStore';
import { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function UserMenu() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
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

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    router.push('/login');
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
        className="flex items-center space-x-2 px-3 py-2 rounded-full hover:text-[#8b5cf6] transition-colors"
        aria-label="User menu"
      >
        {/* Profile Picture or Initial */}
        {profilePicUrl ? (
          <img
            src={profilePicUrl}
            alt={displayName}
            className="w-8 h-8 rounded-full object-cover border border-[#2f3336]"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#00d4ff] via-[#4d7cfe] to-[#b845ed] flex items-center justify-center">
            <span className="text-[#0f1419] font-bold text-sm">
              {userInitial}
            </span>
          </div>
        )}

        {/* Username */}
        <span className="text-[#e7e9ea] font-medium hidden sm:block max-w-[100px] truncate hover:text-[#8b5cf6] transition-colors">
          {displayName}
        </span>

        {/* Dropdown Icon */}
        <ChevronDown
          size={16}
          className={`text-[#71767b] transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-[#15202b] border border-[#2f3336] rounded-lg shadow-lg py-2 z-50">
          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/escort-profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 text-[#e7e9ea] hover:bg-[#2f3336] transition-colors"
            >
              <User size={18} className="text-[#71767b]" />
              <span className="font-medium">{t('myProfile')}</span>
            </Link>

            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 text-[#e7e9ea] hover:bg-[#2f3336] transition-colors"
            >
              <Settings size={18} className="text-[#71767b]" />
              <span className="font-medium">{t('settings')}</span>
            </Link>

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-[#e7e9ea] hover:bg-[#2f3336] transition-colors"
            >
              <LogOut size={18} className="text-[#71767b]" />
              <span className="font-medium">{t('logout')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
