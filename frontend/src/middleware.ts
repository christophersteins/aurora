import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale: 'en',

  // Automatically detect the user's locale based on:
  // 1. Cookie preference (if set)
  // 2. Accept-Language header
  // 3. Default locale
  localeDetection: true,

  // The locale prefix strategy
  // 'always': always show locale in URL (/en/page, /de/page)
  // 'as-needed': only show locale if not default (/page for en, /de/page for de)
  localePrefix: 'always',

  // Localized pathnames
  pathnames: {
    '/': '/',
    '/login': {
      en: '/login',
      de: '/anmelden'
    },
    '/signup': {
      en: '/signup',
      de: '/registrieren'
    },
    '/forgot-password': {
      en: '/forgot-password',
      de: '/passwort-vergessen'
    },
    '/verify-email': {
      en: '/verify-email',
      de: '/email-verifizieren'
    },
    '/bookmarks': {
      en: '/bookmarks',
      de: '/merkliste'
    },
    '/profile': {
      en: '/profile',
      de: '/profil'
    },
    '/settings': {
      en: '/settings',
      de: '/einstellungen'
    }
  }
});

export default createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames
  // Skip all paths that should not be localized (api, static files, etc.)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
