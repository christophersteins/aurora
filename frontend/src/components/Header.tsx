'use client';

import { Link, usePathname } from '@/i18n/routing';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { useUIStore } from '@/store/uiStore';
import { useState, useEffect, useRef } from 'react';
import { AlignJustify, X, User, Settings, LogOut, Bell, MessageCircle, Home, Users, Building2, Video, Sparkles, LogIn, Bookmark } from 'lucide-react';
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
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const savedScrollY = useRef(0);
  const t = useTranslations('nav');

  // Helper function to check if a link is active
  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/' || pathname === '/de' || pathname === '/en';
    }
    return pathname?.includes(path);
  };

  // Handle header visibility on scroll (mobile only)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Only apply on mobile/tablet (lg breakpoint is 1024px)
      if (window.innerWidth >= 1024) {
        setShowHeader(true);
        return;
      }

      // Always show header at top of page
      if (currentScrollY < 10) {
        setShowHeader(true);
        setLastScrollY(currentScrollY);
        return;
      }

      // Show header when scrolling up, hide when scrolling down
      if (currentScrollY < lastScrollY) {
        setShowHeader(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowHeader(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Prevent scrolling when mobile menu is open and restore scroll position when closed
  useEffect(() => {
    if (mobileMenuOpen) {
      // Save current scroll position
      savedScrollY.current = window.scrollY;

      // Prevent scrolling on body
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${savedScrollY.current}px`;
      document.body.style.width = '100%';
    } else {
      // Restore scrolling
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';

      // Restore scroll position - use requestAnimationFrame for smoother restoration
      requestAnimationFrame(() => {
        window.scrollTo(0, savedScrollY.current);
      });
    }
  }, [mobileMenuOpen]);

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
      <header
        className="lg:hidden bg-[#000000]/80 backdrop-blur-md border-b border-[#2f3336] fixed top-0 left-0 right-0 z-30 transition-transform duration-300"
        style={{ transform: showHeader ? 'translateY(0)' : 'translateY(-100%)' }}
      >
        <div className="mx-auto" style={{ paddingLeft: 'var(--header-footer-padding-x)', paddingRight: 'var(--header-footer-padding-x)' }}>
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
      <aside className="hidden lg:flex fixed top-0 bottom-0 w-[260px] bg-[#000000]/80 backdrop-blur-md border-r border-[#2f3336] z-40 flex-col" style={{ left: 'var(--sidebar-offset, 0px)' }}>
        <div className="flex-1 flex flex-col py-4 pl-3 pr-6">
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
                  : 'link-primary'
              }`}
            >
              <Home size={26} className="flex-shrink-0" strokeWidth={isActive('/') ? 2.5 : 2} />
              <span className={`text-xl ${isActive('/') ? 'font-bold' : 'font-medium'}`}>{t('home')}</span>
            </Link>

            <Link
              href="/escorts"
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                isActive('/escorts')
                  ? 'bg-[#e7e9ea]/10 text-[#e7e9ea]'
                  : 'link-primary'
              }`}
            >
              <Users size={26} className="flex-shrink-0" strokeWidth={isActive('/escorts') ? 2.5 : 2} />
              <span className={`text-xl ${isActive('/escorts') ? 'font-bold' : 'font-medium'}`}>{t('members')}</span>
            </Link>

            {isAuthenticated && (
              <>
                <button
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors w-full cursor-pointer ${
                    isActive('/notifications')
                      ? 'bg-[#e7e9ea]/10 text-[#e7e9ea]'
                      : 'link-primary'
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
                      : 'link-primary'
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
                <Link
                  href="/bookmarks"
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                    isActive('/bookmarks')
                      ? 'bg-[#e7e9ea]/10 text-[#e7e9ea]'
                      : 'link-primary'
                  }`}
                >
                  <Bookmark size={26} className="flex-shrink-0" strokeWidth={isActive('/bookmarks') ? 2.5 : 2} />
                  <span className={`text-xl ${isActive('/bookmarks') ? 'font-bold' : 'font-medium'}`}>{t('bookmarks')}</span>
                </Link>
              </>
            )}
            <Link
              href="/clubs"
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                isActive('/clubs')
                  ? 'bg-[#e7e9ea]/10 text-[#e7e9ea]'
                  : 'link-primary'
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
                  : 'link-primary'
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
                  : 'link-primary'
              }`}
            >
              <Sparkles size={26} className="flex-shrink-0" strokeWidth={isActive('/premium') ? 2.5 : 2} />
              <span className={`text-xl ${isActive('/premium') ? 'font-bold' : 'font-medium'}`}>{t('premium')}</span>
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href={user?.role === 'escort' ? '/escort-profile' : '/customer-profile'}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                    isActive('/escort-profile') || isActive('/customer-profile')
                      ? 'bg-[#e7e9ea]/10 text-[#e7e9ea]'
                      : 'link-primary'
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
                      : 'link-primary'
                  }`}
                >
                  <Settings size={26} className="flex-shrink-0" strokeWidth={isActive('/settings') ? 2.5 : 2} />
                  <span className={`text-xl ${isActive('/settings') ? 'font-bold' : 'font-medium'}`}>{t('settings')}</span>
                </Link>
              </>
            ) : (
              <>
                <button
                  onClick={openLoginModal}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl transition-colors link-primary w-full cursor-pointer"
                >
                  <LogIn size={26} className="flex-shrink-0" strokeWidth={2} />
                  <span className="text-xl font-medium">{t('login')}</span>
                </button>
                <button
                  onClick={openRegisterModal}
                  className="w-full flex items-center justify-center px-4 py-3 rounded-xl btn-base btn-primary cursor-pointer mt-4"
                >
                  <span className="text-xl font-medium">{t('register')}</span>
                </button>
              </>
            )}
          </nav>

          {/* Bottom Section */}
          <div className="mt-auto pt-4 border-t border-[#2f3336] space-y-2">
            {isAuthenticated ? (
              <button
                onClick={handleLogoutClick}
                className="flex items-center gap-4 px-4 py-3 rounded-xl link-primary transition-colors w-full cursor-pointer"
              >
                <LogOut size={26} className="flex-shrink-0" />
                <span className="text-xl font-medium">{t('logout')}</span>
              </button>
            ) : (
              <LanguageSwitcher />
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

      {/* Mobile Menu Slide-in - Same design as Desktop Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed top-0 right-0 bottom-0 w-[280px] bg-[#000000]/80 backdrop-blur-md border-l border-[#2f3336] z-50 md:hidden mobile-menu-enter overflow-y-auto">
          <div className="flex flex-col h-full py-4 px-3">
            {/* Logo and Close Button */}
            <div className="flex items-center justify-between px-4 mb-8">
              <Link href="/" onClick={closeMobileMenu} className="flex items-center">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r from-[#00d4ff] via-[#4d7cfe] to-[#b845ed]">
                  <span className="text-[#0f1419] font-bold text-xl">A</span>
                </div>
                <span className="ml-3 text-xl font-bold gradient-text">Aurora</span>
              </Link>
              <button
                onClick={closeMobileMenu}
                className="p-2 text-[#e7e9ea] hover:text-[#8b5cf6] transition cursor-pointer -mr-2"
                aria-label={t('close')}
              >
                <X size={24} />
              </button>
            </div>

            {/* Navigation Links - Same structure as Desktop Sidebar */}
            <nav className="flex-1 space-y-1">
              <Link
                href="/"
                onClick={closeMobileMenu}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                  isActive('/')
                    ? 'bg-[#e7e9ea]/10 text-[#e7e9ea]'
                    : 'link-primary'
                }`}
              >
                <Home size={26} className="flex-shrink-0" strokeWidth={isActive('/') ? 2.5 : 2} />
                <span className={`text-xl ${isActive('/') ? 'font-bold' : 'font-medium'}`}>{t('home')}</span>
              </Link>

              <Link
                href="/escorts"
                onClick={closeMobileMenu}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                  isActive('/escorts')
                    ? 'bg-[#e7e9ea]/10 text-[#e7e9ea]'
                    : 'link-primary'
                }`}
              >
                <Users size={26} className="flex-shrink-0" strokeWidth={isActive('/escorts') ? 2.5 : 2} />
                <span className={`text-xl ${isActive('/escorts') ? 'font-bold' : 'font-medium'}`}>{t('members')}</span>
              </Link>

              {isAuthenticated && (
                <>
                  <button
                    onClick={closeMobileMenu}
                    className={`w-full flex items-center gap-4 px-4 py-3 cursor-pointer rounded-xl transition-colors ${
                      isActive('/notifications')
                        ? 'bg-[#e7e9ea]/10 text-[#e7e9ea]'
                        : 'link-primary'
                    }`}
                  >
                    <Bell size={26} className="flex-shrink-0" strokeWidth={isActive('/notifications') ? 2.5 : 2} />
                    <span className={`text-xl ${isActive('/notifications') ? 'font-bold' : 'font-medium'}`}>{t('notifications')}</span>
                  </button>

                  <Link
                    href="/chat"
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors relative ${
                      isActive('/chat')
                        ? 'bg-[#e7e9ea]/10 text-[#e7e9ea]'
                        : 'link-primary'
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

                  <Link
                    href="/bookmarks"
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                      isActive('/bookmarks')
                        ? 'bg-[#e7e9ea]/10 text-[#e7e9ea]'
                        : 'link-primary'
                    }`}
                  >
                    <Bookmark size={26} className="flex-shrink-0" strokeWidth={isActive('/bookmarks') ? 2.5 : 2} />
                    <span className={`text-xl ${isActive('/bookmarks') ? 'font-bold' : 'font-medium'}`}>{t('bookmarks')}</span>
                  </Link>
                </>
              )}
              <Link
                href="/clubs"
                onClick={closeMobileMenu}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                  isActive('/clubs')
                    ? 'bg-[#e7e9ea]/10 text-[#e7e9ea]'
                    : 'link-primary'
                }`}
              >
                <Building2 size={26} className="flex-shrink-0" strokeWidth={isActive('/clubs') ? 2.5 : 2} />
                <span className={`text-xl ${isActive('/clubs') ? 'font-bold' : 'font-medium'}`}>{t('clubsAndCo')}</span>
              </Link>
              <Link
                href="/videos"
                onClick={closeMobileMenu}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                  isActive('/videos')
                    ? 'bg-[#e7e9ea]/10 text-[#e7e9ea]'
                    : 'link-primary'
                }`}
              >
                <Video size={26} className="flex-shrink-0" strokeWidth={isActive('/videos') ? 2.5 : 2} />
                <span className={`text-xl ${isActive('/videos') ? 'font-bold' : 'font-medium'}`}>{t('videos')}</span>
              </Link>
              <Link
                href="/premium"
                onClick={closeMobileMenu}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                  isActive('/premium')
                    ? 'bg-[#e7e9ea]/10 text-[#e7e9ea]'
                    : 'link-primary'
                }`}
              >
                <Sparkles size={26} className="flex-shrink-0" strokeWidth={isActive('/premium') ? 2.5 : 2} />
                <span className={`text-xl ${isActive('/premium') ? 'font-bold' : 'font-medium'}`}>{t('premium')}</span>
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    href={user?.role === 'escort' ? '/escort-profile' : '/customer-profile'}
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                      isActive('/escort-profile') || isActive('/customer-profile')
                        ? 'bg-[#e7e9ea]/10 text-[#e7e9ea]'
                        : 'link-primary'
                    }`}
                  >
                    <User size={26} className="flex-shrink-0" strokeWidth={isActive('/escort-profile') || isActive('/customer-profile') ? 2.5 : 2} />
                    <span className={`text-xl ${isActive('/escort-profile') || isActive('/customer-profile') ? 'font-bold' : 'font-medium'}`}>{t('myProfile')}</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${
                      isActive('/settings')
                        ? 'bg-[#e7e9ea]/10 text-[#e7e9ea]'
                        : 'link-primary'
                    }`}
                  >
                    <Settings size={26} className="flex-shrink-0" strokeWidth={isActive('/settings') ? 2.5 : 2} />
                    <span className={`text-xl ${isActive('/settings') ? 'font-bold' : 'font-medium'}`}>{t('settings')}</span>
                  </Link>
                </>
              ) : (
                <>
                  <button
                    onClick={openLoginModal}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl transition-colors link-primary w-full cursor-pointer"
                  >
                    <LogIn size={26} className="flex-shrink-0" strokeWidth={2} />
                    <span className="text-xl font-medium">{t('login')}</span>
                  </button>
                  <button
                    onClick={openRegisterModal}
                    className="w-full flex items-center justify-center px-4 py-3 rounded-xl btn-base btn-primary cursor-pointer mt-4"
                  >
                    <span className="text-xl font-medium">{t('register')}</span>
                  </button>
                </>
              )}
            </nav>

            {/* Bottom Section */}
            <div className="mt-auto pt-4 border-t border-[#2f3336] space-y-2">
              {isAuthenticated ? (
                <button
                  onClick={handleLogoutClick}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl link-primary transition-colors w-full cursor-pointer"
                >
                  <LogOut size={26} className="flex-shrink-0" />
                  <span className="text-xl font-medium">{t('logout')}</span>
                </button>
              ) : (
                <LanguageSwitcher />
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
