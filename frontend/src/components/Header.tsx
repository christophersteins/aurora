'use client';

import { Link } from '@/i18n/routing';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import { AlignJustify, X, User, Settings, LogOut, Bell, MessageCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import UserMenu from './UserMenu';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import ForgotPasswordModal from './ForgotPasswordModal';

export default function Header() {
  const router = useRouter();
  const { isAuthenticated, logout, user } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const t = useTranslations('nav');

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    router.push('/login');
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
      <header className="bg-[#000000]/60 backdrop-blur-md border-b border-[#2f3336] sticky top-0 z-40">
        <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: 'var(--max-content-width)' }}>
          <div className="flex justify-between items-center h-16">
            {/* Logo + Desktop Navigation - Links */}
            <div className="flex items-center space-x-12">
              {/* Logo */}
              <Link href="/" className="flex items-center">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r from-[#00d4ff] via-[#4d7cfe] to-[#b845ed]">
                  <span className="text-[#0f1419] font-bold text-xl">A</span>
                </div>
                <span className="ml-3 text-xl font-bold gradient-text">Aurora</span>
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-6">
                <Link
                  href="/members"
                  className="text-[#e7e9ea] hover:text-[#8b5cf6] font-medium transition"
                >
                  {t('members')}
                </Link>
                <Link
                  href="/clubs"
                  className="text-[#e7e9ea] hover:text-[#8b5cf6] font-medium transition"
                >
                  {t('clubsAndCo')}
                </Link>
                <Link
                  href="/videos"
                  className="text-[#e7e9ea] hover:text-[#8b5cf6] font-medium transition"
                >
                  {t('videos')}
                </Link>
                <Link
                  href="/premium"
                  className="text-[#e7e9ea] hover:text-[#8b5cf6] font-medium transition"
                >
                  {t('premium')}
                </Link>
                <Link
                  href="/faq"
                  className="text-[#e7e9ea] hover:text-[#8b5cf6] font-medium transition"
                >
                  {t('faq')}
                </Link>
              </nav>
            </div>

            {/* Desktop Buttons - Rechts */}
            <div className="hidden md:flex items-center space-x-3">
              <LanguageSwitcher />
              {!isAuthenticated ? (
                <>
                  <button
                    onClick={openLoginModal}
                    className="btn-base btn-secondary !py-2 !px-4 text-sm"
                  >
                    {t('login')}
                  </button>
                  <button
                    onClick={openRegisterModal}
                    className="btn-base btn-primary !py-2 !px-4 text-sm"
                  >
                    {t('register')}
                  </button>
                </>
              ) : (
                <>
                  {/* Notifications Icon */}
                  <button
                    className="p-2 text-[#e7e9ea] hover:text-[#8b5cf6] hover:bg-[#2f3336] rounded-lg transition relative"
                    aria-label="Benachrichtigungen"
                  >
                    <Bell size={20} />
                    {/* Badge für ungelesene Benachrichtigungen (optional später) */}
                    {/* <span className="absolute top-1 right-1 w-2 h-2 bg-[#8b5cf6] rounded-full"></span> */}
                  </button>

                  {/* Messages Icon */}
                  <Link
                    href="/chat"
                    className="p-2 text-[#e7e9ea] hover:text-[#8b5cf6] hover:bg-[#2f3336] rounded-lg transition relative"
                    aria-label="Nachrichten"
                  >
                    <MessageCircle size={20} />
                    {/* Badge für ungelesene Nachrichten (optional später) */}
                    {/* <span className="absolute top-1 right-1 w-2 h-2 bg-[#8b5cf6] rounded-full"></span> */}
                  </Link>

                  <UserMenu />
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#e7e9ea] hover:text-[#8b5cf6] transition"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <AlignJustify size={24} />}
            </button>
          </div>
        </div>
      </header>

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
                className="p-2 text-[#e7e9ea] hover:text-[#8b5cf6] transition"
                aria-label={t('close')}
              >
                <X size={24} />
              </button>
            </div>

            {/* User Info (wenn eingeloggt) */}
            {isAuthenticated && user && (
              <div className="mb-6 pb-6 border-b border-[#2f3336]">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#00d4ff] via-[#4d7cfe] to-[#b845ed] flex items-center justify-center">
                    <span className="text-[#0f1419] font-bold text-lg">
                      {(user.username?.[0] || user.email[0]).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#e7e9ea] font-medium truncate">
                      {user.username || user.email}
                    </p>
                    <p className="text-[#71767b] text-sm truncate">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="space-y-1">
              <Link
                href="/members"
                onClick={closeMobileMenu}
                className="block px-4 py-3 text-[#e7e9ea] hover:bg-[#2f3336] hover:text-[#8b5cf6] rounded-lg transition font-medium"
              >
                {t('members')}
              </Link>
              <Link
                href="/clubs"
                onClick={closeMobileMenu}
                className="block px-4 py-3 text-[#e7e9ea] hover:bg-[#2f3336] hover:text-[#8b5cf6] rounded-lg transition font-medium"
              >
                {t('clubsAndCo')}
              </Link>
              <Link
                href="/videos"
                onClick={closeMobileMenu}
                className="block px-4 py-3 text-[#e7e9ea] hover:bg-[#2f3336] hover:text-[#8b5cf6] rounded-lg transition font-medium"
              >
                {t('videos')}
              </Link>
              <Link
                href="/premium"
                onClick={closeMobileMenu}
                className="block px-4 py-3 text-[#e7e9ea] hover:bg-[#2f3336] hover:text-[#8b5cf6] rounded-lg transition font-medium"
              >
                {t('premium')}
              </Link>
              <Link
                href="/faq"
                onClick={closeMobileMenu}
                className="block px-4 py-3 text-[#e7e9ea] hover:bg-[#2f3336] hover:text-[#8b5cf6] rounded-lg transition font-medium"
              >
                {t('faq')}
              </Link>
            </nav>

            {/* Language Switcher */}
            <div className="mt-6 pt-6 border-t border-[#2f3336]">
              <LanguageSwitcher />
            </div>

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
                    className="w-full flex items-center space-x-3 px-4 py-3 text-[#e7e9ea] hover:bg-[#2f3336] hover:text-[#8b5cf6] rounded-lg transition font-medium"
                  >
                    <Bell size={18} className="text-[#71767b]" />
                    <span>Benachrichtigungen</span>
                  </button>

                  {/* Messages Link */}
                  <Link
                    href="/chat"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-3 px-4 py-3 text-[#e7e9ea] hover:bg-[#2f3336] hover:text-[#8b5cf6] rounded-lg transition font-medium"
                  >
                    <MessageCircle size={18} className="text-[#71767b]" />
                    <span>Nachrichten</span>
                  </Link>

                  <Link
                    href="/escort-profile"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-3 px-4 py-3 text-[#e7e9ea] hover:bg-[#2f3336] hover:text-[#8b5cf6] rounded-lg transition font-medium"
                  >
                    <User size={18} className="text-[#71767b]" />
                    <span>{t('myProfile')}</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-3 px-4 py-3 text-[#e7e9ea] hover:bg-[#2f3336] hover:text-[#8b5cf6] rounded-lg transition font-medium"
                  >
                    <Settings size={18} className="text-[#71767b]" />
                    <span>{t('settings')}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-[#e7e9ea] hover:bg-[#2f3336] hover:text-[#8b5cf6] rounded-lg transition font-medium"
                  >
                    <LogOut size={18} className="text-[#71767b]" />
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
    </>
  );
}
