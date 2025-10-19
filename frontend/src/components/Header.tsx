'use client';

import { Link } from '@/i18n/routing';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const router = useRouter();
  const { isAuthenticated, logout, user } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations('nav');

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    router.push('/login');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="bg-[#000000] border-b border-[#2f3336] sticky top-0 z-40">
        <div className="mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: 'var(--max-content-width)' }}>
          <div className="flex justify-between items-center h-16">
            {/* Logo + Desktop Navigation - Links */}
            <div className="flex items-center space-x-8">
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
                  href="/"
                  className="text-[#e7e9ea] hover:text-[#00d4ff] font-medium transition"
                >
                  Home
                </Link>
                <Link
                  href="/members"
                  className="text-[#e7e9ea] hover:text-[#00d4ff] font-medium transition"
                >
                  Members
                </Link>
                {isAuthenticated && (
                  <>
                    <Link
                      href="/dashboard"
                      className="text-[#e7e9ea] hover:text-[#00d4ff] font-medium transition"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/escort-profile"
                      className="text-[#e7e9ea] hover:text-[#00d4ff] font-medium transition"
                    >
                      Mein Profil
                    </Link>
                  </>
                )}
              </nav>
            </div>

            {/* Desktop Buttons - Rechts */}
            <div className="hidden md:flex items-center space-x-3">
              <LanguageSwitcher />
              {!isAuthenticated ? (
                <>
                  <Link href="/login">
                    <button className="btn-base btn-secondary">
                      {t('login')}
                    </button>
                  </Link>
                  <Link href="/register">
                    <button className="btn-base btn-primary">
                      {t('register')}
                    </button>
                  </Link>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className="btn-base btn-secondary"
                >
                  {t('logout')}
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#e7e9ea] hover:text-[#00d4ff] transition"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
                className="p-2 text-[#e7e9ea] hover:text-[#00d4ff] transition"
                aria-label={t('close') || 'Close'}
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
                href="/"
                onClick={closeMobileMenu}
                className="block px-4 py-3 text-[#e7e9ea] hover:bg-[#2f3336] hover:text-[#00d4ff] rounded-lg transition font-medium"
              >
                Home
              </Link>
              <Link
                href="/members"
                onClick={closeMobileMenu}
                className="block px-4 py-3 text-[#e7e9ea] hover:bg-[#2f3336] hover:text-[#00d4ff] rounded-lg transition font-medium"
              >
                Members
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    href="/dashboard"
                    onClick={closeMobileMenu}
                    className="block px-4 py-3 text-[#e7e9ea] hover:bg-[#2f3336] hover:text-[#00d4ff] rounded-lg transition font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/escort-profile"
                    onClick={closeMobileMenu}
                    className="block px-4 py-3 text-[#e7e9ea] hover:bg-[#2f3336] hover:text-[#00d4ff] rounded-lg transition font-medium"
                  >
                    {t('myProfile')}
                  </Link>
                </>
              )}
            </nav>

            {/* Language Switcher */}
            <div className="mt-6 pt-6 border-t border-[#2f3336]">
              <LanguageSwitcher />
            </div>

            {/* Auth Buttons */}
            <div className="mt-6 pt-6 border-t border-[#2f3336] space-y-3">
              {!isAuthenticated ? (
                <>
                  <Link href="/login" onClick={closeMobileMenu}>
                    <button className="w-full btn-base btn-secondary">
                      {t('login')}
                    </button>
                  </Link>
                  <Link href="/register" onClick={closeMobileMenu}>
                    <button className="w-full btn-base btn-primary">
                      {t('register')}
                    </button>
                  </Link>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className="w-full btn-base btn-secondary"
                >
                  {t('logout')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}