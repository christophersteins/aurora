'use client';

import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const t = useTranslations('footer');

  return (
    <footer className="bg-page-primary border-t border-[#2f3336] mt-auto" style={{ marginLeft: 'calc(var(--sidebar-offset, 0px) + var(--sidebar-width, 0px))', border: '3px solid blue' }}>
      <div className="py-12" style={{ maxWidth: 'var(--max-content-width)', paddingLeft: 'var(--header-footer-padding-x)', paddingRight: 'var(--header-footer-padding-x)' }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r from-[#00d4ff] via-[#4d7cfe] to-[#b845ed]">
                <span className="text-[#0f1419] font-bold text-xl">A</span>
              </div>
              <span className="ml-3 text-xl font-bold gradient-text">Aurora</span>
            </div>
            <p className="text-[#71767b] text-sm">
              {t('tagline')}
            </p>
          </div>

          <div>
            <h3 className="text-[#e7e9ea] font-semibold mb-4">{t('product')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/features" className="text-[#71767b] hover:text-[#8b5cf6] transition text-sm">
                  {t('features')}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-[#71767b] hover:text-[#8b5cf6] transition text-sm">
                  {t('pricing')}
                </Link>
              </li>
              <li>
                <Link href="/roadmap" className="text-[#71767b] hover:text-[#8b5cf6] transition text-sm">
                  {t('roadmap')}
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="text-[#71767b] hover:text-[#8b5cf6] transition text-sm">
                  {t('changelog')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[#e7e9ea] font-semibold mb-4">{t('company')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-[#71767b] hover:text-[#8b5cf6] transition text-sm">
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-[#71767b] hover:text-[#8b5cf6] transition text-sm">
                  {t('blog')}
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-[#71767b] hover:text-[#8b5cf6] transition text-sm">
                  {t('careers')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[#71767b] hover:text-[#8b5cf6] transition text-sm">
                  {t('contact')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[#e7e9ea] font-semibold mb-4">{t('legal')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-[#71767b] hover:text-[#8b5cf6] transition text-sm">
                  {t('privacy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-[#71767b] hover:text-[#8b5cf6] transition text-sm">
                  {t('terms')}
                </Link>
              </li>
              <li>
                <Link href="/imprint" className="text-[#71767b] hover:text-[#8b5cf6] transition text-sm">
                  {t('imprint')}
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-[#71767b] hover:text-[#8b5cf6] transition text-sm">
                  {t('cookies')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#2f3336] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#71767b] text-sm">
            © {currentYear} Aurora. {t('allRightsReserved')}
          </p>
          <div className="flex items-center space-x-6">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-[#71767b] hover:text-[#8b5cf6] transition" aria-label="Twitter">
              <span className="text-xl">𝕏</span>
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-[#71767b] hover:text-[#8b5cf6] transition" aria-label="GitHub">
              <span className="text-xl">GitHub</span>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-[#71767b] hover:text-[#8b5cf6] transition" aria-label="LinkedIn">
              <span className="text-xl">LinkedIn</span>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-[#71767b] hover:text-[#8b5cf6] transition" aria-label="Instagram">
              <span className="text-xl">Instagram</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
