import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';

export default createMiddleware({
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
  localePrefix: 'always'
});

export const config = {
  // Match only internationalized pathnames
  // Skip all paths that should not be localized (api, static files, etc.)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
