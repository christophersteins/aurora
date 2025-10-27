'use client';

import { Link, usePathname } from '@/i18n/routing';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { useState, useEffect } from 'react';
import { AlignJustify, X, User, Settings, LogOut, Bell, MessageCircle, Home, Users, Building2, Video, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import UserMenu from './UserMenu';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import ForgotPasswordModal from './ForgotPasswordModal';
import LogoutModal from './LogoutModal';
import { chatService } from '@/services/chatService';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, token, _hasHydrated } = useAuthStore();
  const { totalUnreadCount, setTotalUnreadCount } = useChatStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const t = useTranslations('nav');

  // Helper function to check if a link is active
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/' || pathname === '/de' || pathname === '/en';
    }
    return pathname?.includes(path);
  };

  // Fetch unread count when user is authenticated
  useEffect(() => {
    // Only fetch if hydrated, authenticated and has token
    if (_hasHydrated && isAuthenticated && token) {
      const fetchUnreadCount = async () => {
        try {
          const count = await chatService.getUnreadCount();
          setTotalUnreadCount(count);
        } catch (error) {
          console.error('Failed to fetch unread count:', error);
          // Reset count on error (user might have logged out)
          setTotalUnreadCount(0);
        }
      };

      fetchUnreadCount();
      // Poll every 30 seconds for updates
      const interval = setInterval(fetchUnreadCount, 30000);

      return () => clearInterval(interval);
    } else if (!isAuthenticated) {
      // Clear count when not authenticated
      setTotalUnreadCount(0);
    }
  }, [_hasHydrated, isAuthenticated, token, setTotalUnreadCount]);

  const handleLogoutClick = () => {
    setMobileMenuOpen(false);
    setLogoutModalOpen(true);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const openLoginModal = () => {
    setLoginModalOpen(true);
    setRegisterModalOpen(false);
    setMobileMenuOpen(false);
  };

  const openRegisterModal = () => {
    setRegisterModalOpen(true);
    setLoginModalOpen(false);
    setMobileMenuOpen(false);
  };

  const closeModals = () => {
    setLoginModalOpen(false);
    setRegisterModalOpen(false);
    setForgotPasswordModalOpen(false);
  };

  const openForgotPasswordModal = () => {
    setForgotPasswordModalOpen(true);
    setLoginModalOpen(false);
    setRegisterModalOpen(false);
    setMobileMenuOpen(false);
  };

  const handleBackToLoginFromForgotPassword = () => {
    setForgotPasswordModalOpen(false);
    setLoginModalOpen(true);
  };

  return (
    <>
      {/* Mobile Header - Top */}
      <header className="lg:hidden bg-[#000000]/80 backdrop-blur-md border-b border-[#2f3336] fixed top-0 left-0 right-0 z-40">
        <div className="mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r from-[#00d4ff] via-[#4d7cfe] to-[#b845ed]">
                <span className="text-[#0f1419] font-bold text-xl">A</span>
              </div>
              <span className="ml-3 text-xl font-bold gradient-text">Aurora</span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#e7e9ea] hover:text-[#8b5cf6] transition cursor-pointer"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <AlignJustify size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar - Left */}
      <aside className="hidden lg:flex fixed top-0 bottom-0 w-[280px] bg-[#000000]/80 backdrop-blur-md border-r border-[#2f3336] z-40 flex-col" style={{ left: 'var(--sidebar-offset, 0px)', border: '3px solid green' }}>
        <div className="flex-1 flex flex-col py-4 px-3">
          {/* Logo */}
          <Link href="/" className="flex items-center px-4 mb-8">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r from-[#00d4ff] via-[#4d7cfe] to-[#b845ed]">
              <span className="text-[#0f1419] font-bold text-xl">A</span>
            </div>
            <span className="ml-3 text-xl font-bold gradient-text">Aurora</span>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            <Link
              href="/"
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                isActive('/')
                  ? 'bg-[#e7e9ea]/10 text-[#e7e9ea]'
                  : 'link-secondary'
              }`}
            >
              <Home size={26} className="flex-shrink-0" strokeWidth={isActive('/') ? 2.5 : 2} />
              <span className={`text-xl ${isActive('/') ? 'font-bold' : 'font-medium'}`}>{t('home')}</span>
            </Link>

            {isAuthenticated && (
              <>
                <button
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors w-full cursor-pointer ${
                    isActive('/notifications')
                      ? 'bg-[#e7e9ea]/10 text-[#e7e9ea]'
                      : 'link-secondary'
                  }`}
                >
                  <Bell size={26} className="flex-shrink-0" strokeWidth={isActive('/notifications') ? 2.5 : 2} />
                  <span className={`text-xl ${isActive('/notifications') ? 'font-bold' : 'font-medium'}`}>{t('notifications')}</span>
                </button>
                <Link
                  href="/chat"
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors relative ${
                    isActive('/chat')
                      ? 'bg-[#e7e9ea]/10 text-[#e7e9ea]'
                      : 'link-secondary'
                  }`}
                >
                  <MessageCircle size={26} className="flex-shrink-0" strokeWidth={isActive('/chat') ? 2.5 : 2} />
                  <span className={`text-xl ${isActive('/chat') ? 'font-bold' : 'font-medium'}`}>{t('messages')}</span>
                  {totalUnreadCount > 0 && (
                    <span className="ml-auto min-w-[24px] h-[24px] px-1.5 bg-action-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            <Link
              href="/escorts"
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                isActive('/escorts')
                  ? 'bg-[#e7e9ea]/10 text-[#e7e9ea]'
                  : 'link-secondary'
              }`}
            >
              <Users size={26} className="flex-shrink-0" strokeWidth={isActive('/escorts') ? 2.5 : 2} />
              <span className={`text-xl ${isActive('/escorts') ? 'font-bold' : 'font-medium'}`}>{t('members')}</span>
            </Link>
            <Link
              href="/clubs"
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                isActive('/clubs')
                  ? 'bg-[#e7e9ea]/10 text-[#e7e9ea]'
                  : 'link-secondary'
              }`}
            >
              <Building2 size={26} className="flex-shrink-0" strokeWidth={isActive('/clubs') ? 2.5 : 2} />
              <span className={`text-xl ${isActive('/clubs') ? 'font-bold' : 'font-medium'}`}>{t('clubsAndCo')}</span>
            </Link>
            <Link
              href="/videos"
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                isActive('/videos')
                  ? 'bg-[#e7e9ea]/10 text-[#e7e9ea]'
                  : 'link-secondary'
              }`}
            >
              <Video size={26} className="flex-shrink-0" strokeWidth={isActive('/videos') ? 2.5 : 2} />
              <span className={`text-xl ${isActive('/videos') ? 'font-bold' : 'font-medium'}`}>{t('videos')}</span>
            </Link>
            <Link
              href="/premium"
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                isActive('/premium')
                  ? 'bg-[#e7e9ea]/10 text-[#e7e9ea]'
                  : 'link-secondary'
              }`}
            >
              <Sparkles size={26} className="flex-shrink-0" strokeWidth={isActive('/premium') ? 2.5 : 2} />
              <span className={`text-xl ${isActive('/premium') ? 'font-bold' : 'font-medium'}`}>{t('premium')}</span>
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  href={user?.role === 'escort' ? '/escort-profile' : '/customer-profile'}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                    isActive('/escort-profile') || isActive('/customer-profile')
                      ? 'bg-[#e7e9ea]/10 text-[#e7e9ea]'
                      : 'link-secondary'
                  }`}
                >
                  <User size={26} className="flex-shrink-0" strokeWidth={isActive('/escort-profile') || isActive('/customer-profile') ? 2.5 : 2} />
                  <span className={`text-xl ${isActive('/escort-profile') || isActive('/customer-profile') ? 'font-bold' : 'font-medium'}`}>{t('myProfile')}</span>
                </Link>
                <Link
                  href="/settings"
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                    isActive('/settings')
                      ? 'bg-[#e7e9ea]/10 text-[#e7e9ea]'
                      : 'link-secondary'
                  }`}
                >
                  <Settings size={26} className="flex-shrink-0" strokeWidth={isActive('/settings') ? 2.5 : 2} />
                  <span className={`text-xl ${isActive('/settings') ? 'font-bold' : 'font-medium'}`}>{t('settings')}</span>
                </Link>
              </>
            )}
          </nav>

          {/* Bottom Section */}
          <div className="mt-auto pt-4 border-t border-[#2f3336] space-y-2">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={openLoginModal}
                  className="w-full btn-base btn-secondary !py-3 text-base cursor-pointer"
                >
                  {t('login')}
                </button>
                <button
                  onClick={openRegisterModal}
                  className="w-full btn-base btn-primary !py-3 text-base cursor-pointer"
                >
                  {t('register')}
                </button>
                <LanguageSwitcher />
              </>
            ) : (
              <>
                <button
                  onClick={handleLogoutClick}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl link-secondary transition-colors w-full cursor-pointer"
                >
                  <LogOut size={26} className="flex-shrink-0" />
                  <span className="text-xl font-medium">{t('logout')}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden mobile-menu-backdrop"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Menu Slide-in */}
      {mobileMenuOpen && (
        <div className="fixed top-0 right-0 bottom-0 w-[280px] bg-[#15202b] border-l border-[#2f3336] z-50 md:hidden mobile-menu-enter overflow-y-auto">
          <div className="p-6">
            {/* Close Button */}
            <div className="flex justify-end mb-6">
              <button
                onClick={closeMobileMenu}
                className="p-2 text-[#e7e9ea] hover:text-[#8b5cf6] transition cursor-pointer"
                aria-label={t('close')}
              >
                <X size={24} />
              </button>
            </div>

            {/* User Info (wenn eingeloggt) */}
            {isAuthenticated && user && (
              <div className="mb-6 pb-6 border-b border-[#2f3336]">
                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#00d4ff] via-[#4d7cfe] to-[#b845ed] flex items-center justify-center">
                    <User className="text-[#0f1419] text-xl" />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="space-y-1">
              <Link
                href="/"
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/')
                    ? 'bg-[#e7e9ea]/10 text-[#e7e9ea] font-bold'
                    : 'link-secondary font-medium'
                }`}
              >
                <Home size={20} strokeWidth={isActive('/') ? 2.5 : 2} />
                {t('home')}
              </Link>
              <Link
                href="/escorts"
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/escorts')
                    ? 'bg-[#e7e9ea]/10 text-[#e7e9ea] font-bold'
                    : 'link-secondary font-medium'
                }`}
              >
                <Users size={20} strokeWidth={isActive('/escorts') ? 2.5 : 2} />
                {t('members')}
              </Link>
              <Link
                href="/clubs"
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/clubs')
                    ? 'bg-[#e7e9ea]/10 text-[#e7e9ea] font-bold'
                    : 'link-secondary font-medium'
                }`}
              >
                <Building2 size={20} strokeWidth={isActive('/clubs') ? 2.5 : 2} />
                {t('clubsAndCo')}
              </Link>
              <Link
                href="/videos"
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/videos')
                    ? 'bg-[#e7e9ea]/10 text-[#e7e9ea] font-bold'
                    : 'link-secondary font-medium'
                }`}
              >
                <Video size={20} strokeWidth={isActive('/videos') ? 2.5 : 2} />
                {t('videos')}
              </Link>
              <Link
                href="/premium"
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/premium')
                    ? 'bg-[#e7e9ea]/10 text-[#e7e9ea] font-bold'
                    : 'link-secondary font-medium'
                }`}
              >
                <Sparkles size={20} strokeWidth={isActive('/premium') ? 2.5 : 2} />
                {t('premium')}
              </Link>
            </nav>

            {/* Language Switcher - Only for logged out users */}
            {!isAuthenticated && (
              <div className="mt-6 pt-6 border-t border-[#2f3336]">
                <LanguageSwitcher />
              </div>
            )}

            {/* Auth Buttons / User Menu */}
            <div className="mt-6 pt-6 border-t border-[#2f3336] space-y-1">
              {!isAuthenticated ? (
                <div className="space-y-3">
                  <button
                    onClick={openLoginModal}
                    className="w-full btn-base btn-secondary"
                  >
                    {t('login')}
                  </button>
                  <button
                    onClick={openRegisterModal}
                    className="w-full btn-base btn-primary"
                  >
                    {t('register')}
                  </button>
                </div>
              ) : (
                <>
                  {/* Notifications Link */}
                  <button
                    onClick={closeMobileMenu}
                    className={`w-full flex items-center space-x-3 px-4 py-3 cursor-pointer rounded-lg transition-colors ${
                      isActive('/notifications')
                        ? 'bg-[#e7e9ea]/10 text-[#e7e9ea] font-bold'
                        : 'link-secondary'
                    }`}
                  >
                    <Bell size={18} strokeWidth={isActive('/notifications') ? 2.5 : 2} />
                    <span>{t('notifications')}</span>
                  </button>

                  {/* Messages Link */}
                  <Link
                    href="/chat"
                    onClick={closeMobileMenu}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                      isActive('/chat')
                        ? 'bg-[#e7e9ea]/10 text-[#e7e9ea] font-bold'
                        : 'link-secondary'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <MessageCircle size={18} strokeWidth={isActive('/chat') ? 2.5 : 2} />
                      <span>{t('messages')}</span>
                    </div>
                    {totalUnreadCount > 0 && (
                      <span className="min-w-[20px] h-[20px] px-1.5 bg-action-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    href={user?.role === 'escort' ? '/escort-profile' : '/customer-profile'}
                    onClick={closeMobileMenu}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive('/escort-profile') || isActive('/customer-profile')
                        ? 'bg-[#e7e9ea]/10 text-[#e7e9ea] font-bold'
                        : 'link-secondary'
                    }`}
                  >
                    <User size={18} strokeWidth={isActive('/escort-profile') || isActive('/customer-profile') ? 2.5 : 2} />
                    <span>{t('myProfile')}</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={closeMobileMenu}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive('/settings')
                        ? 'bg-[#e7e9ea]/10 text-[#e7e9ea] font-bold'
                        : 'link-secondary'
                    }`}
                  >
                    <Settings size={18} strokeWidth={isActive('/settings') ? 2.5 : 2} />
                    <span>{t('settings')}</span>
                  </Link>
                  <button
                    onClick={handleLogoutClick}
                    className="w-full flex items-center space-x-3 px-4 py-3 link-secondary rounded-lg transition-colors"
                  >
                    <LogOut size={18} />
                    <span>{t('logout')}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={closeModals}
        onSwitchToRegister={openRegisterModal}
        onSwitchToForgotPassword={openForgotPasswordModal}
      />

      {/* Register Modal */}
      <RegisterModal
        isOpen={registerModalOpen}
        onClose={closeModals}
        onSwitchToLogin={openLoginModal}
      />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={forgotPasswordModalOpen}
        onClose={closeModals}
        onBackToLogin={handleBackToLoginFromForgotPassword}
      />

      {/* Logout Modal */}
      <LogoutModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
      />
    </>
  );
}
