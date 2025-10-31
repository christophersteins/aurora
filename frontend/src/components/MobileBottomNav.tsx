'use client';

import { Link, usePathname } from '@/i18n/routing';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { Users, Calendar, Mail, Bell, User } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const { totalUnreadCount } = useChatStore();
  const t = useTranslations('nav');

  // Check if we're on the chat page
  const isChatPage = pathname?.includes('/nachrichten');

  // Helper function to check if a link is active
  const isActive = (path: string) => {
    return pathname?.includes(path);
  };

  // Handle click on active link - scroll to top instead of reload
  const handleEscortsClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname?.includes('/escorts')) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Don't show if not authenticated, not hydrated, or on chat page
  if (!_hasHydrated || !isAuthenticated || isChatPage) {
    return null;
  }

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 border-t"
      style={{
        zIndex: 99999,
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderColor: 'var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        display: 'flex',
        justifyContent: 'center',
        visibility: 'visible',
        opacity: 1,
      }}
    >
      <div className="flex justify-around items-center h-16 px-2 w-full max-w-md">
        {/* Escorts */}
        <Link
          href="/escorts"
          onClick={handleEscortsClick}
          className="flex flex-col items-center justify-center flex-1 py-2"
        >
          <Users
            size={24}
            strokeWidth={isActive('/escorts') ? 2.5 : 2}
            className="mb-1"
            style={{ color: 'var(--text-heading)' }}
          />
          <span
            className="text-xs mobile-nav-text"
            style={{
              color: 'var(--text-secondary)',
              fontWeight: isActive('/escorts') ? 600 : 400,
            }}
          >
            {t('members')}
          </span>
        </Link>

        {/* Dates */}
        <Link
          href="/dates"
          className="flex flex-col items-center justify-center flex-1 py-2"
        >
          <Calendar
            size={24}
            strokeWidth={isActive('/dates') ? 2.5 : 2}
            className="mb-1"
            style={{ color: 'var(--text-heading)' }}
          />
          <span
            className="text-xs mobile-nav-text"
            style={{
              color: 'var(--text-secondary)',
              fontWeight: isActive('/dates') ? 600 : 400,
            }}
          >
            {t('dates')}
          </span>
        </Link>

        {/* Messages */}
        <Link
          href="/nachrichten"
          className="flex flex-col items-center justify-center flex-1 py-2 relative"
        >
          <div className="relative">
            <Mail
              size={24}
              strokeWidth={isActive('/nachrichten') ? 2.5 : 2}
              className="mb-1"
              style={{ color: 'var(--text-heading)' }}
            />
            {totalUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-action-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
              </span>
            )}
          </div>
          <span
            className="text-xs mobile-nav-text"
            style={{
              color: 'var(--text-secondary)',
              fontWeight: isActive('/nachrichten') ? 600 : 400,
            }}
          >
            {t('messages')}
          </span>
        </Link>

        {/* Notifications */}
        <button
          className="flex flex-col items-center justify-center flex-1 py-2"
        >
          <Bell
            size={24}
            strokeWidth={isActive('/notifications') ? 2.5 : 2}
            className="mb-1"
            style={{ color: 'var(--text-heading)' }}
          />
          <span
            className="text-xs mobile-nav-text"
            style={{
              color: 'var(--text-secondary)',
              fontWeight: isActive('/notifications') ? 600 : 400,
            }}
          >
            {t('notifications')}
          </span>
        </button>

        {/* My Profile */}
        <Link
          href={user?.role === 'escort' ? '/profile' : '/customer-profile'}
          className="flex flex-col items-center justify-center flex-1 py-2"
        >
          <User
            size={24}
            strokeWidth={isActive('/profile') || isActive('/customer-profile') ? 2.5 : 2}
            className="mb-1"
            style={{ color: 'var(--text-heading)' }}
          />
          <span
            className="text-xs mobile-nav-text"
            style={{
              color: 'var(--text-secondary)',
              fontWeight: (isActive('/profile') || isActive('/customer-profile')) ? 600 : 400,
            }}
          >
            {t('myProfile')}
          </span>
        </Link>
      </div>
    </nav>
  );
}