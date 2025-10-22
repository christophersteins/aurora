'use client';

import { useState, useTransition, useEffect } from 'react';
import { ArrowLeft, ChevronRight, Check } from 'lucide-react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧', nativeName: 'English' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', nativeName: 'Deutsch' }
];

export default function SettingsPage() {
  // Mobile navigation state - null means menu is shown, string means section is shown
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Desktop sidebar navigation state - tracks active section on desktop
  const [activeSidebarSection, setActiveSidebarSection] = useState<string>('konto');

  // Track if component is mounting (to disable animations on initial load)
  const [isMounting, setIsMounting] = useState(true);

  // Load saved section from localStorage on mount
  useEffect(() => {
    const savedSection = localStorage.getItem('settings-active-section');
    if (savedSection) {
      setActiveSidebarSection(savedSection);
      setActiveSection(savedSection);
    }
    // After initial load, set isMounting to false
    setIsMounting(false);

    // Cleanup: Remove saved section when component unmounts (user leaves settings page)
    return () => {
      localStorage.removeItem('settings-active-section');
    };
  }, []);

  // Language switching
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLanguage = (newLocale: string) => {
    if (newLocale === locale) return;

    // Save current section before language switch
    localStorage.setItem('settings-active-section', 'sprache');

    // Replace the locale in the current pathname
    const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);

    startTransition(() => {
      router.replace(newPathname);
    });
  };

  const sections = [
    { id: 'konto', label: 'Konto' },
    { id: 'sicherheit', label: 'Sicherheit' },
    { id: 'datenschutz', label: 'Datenschutz' },
    { id: 'mitteilungen', label: 'Mitteilungen' },
    { id: 'premium', label: 'Premium' },
    { id: 'barrierefreiheit', label: 'Barrierefreiheit' },
    { id: 'sprache', label: 'Sprache' },
  ];

  return (
    <div>
      {/* Mobile/Tablet Navigation - shown only when no section is active */}
      {activeSection === null && (
        <div className={`lg:hidden mb-6 ${!isMounting ? 'animate-slide-in-left' : ''}`}>
          <div className="border border-[#2f3336] shadow-md bg-page-primary rounded-lg overflow-hidden">
            <nav>
              {sections.map((section, index) => {
                const isLast = index === sections.length - 1;
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id);
                      localStorage.setItem('settings-active-section', section.id);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-4 text-sm font-medium transition-all text-body hover-bg-page-secondary bg-page-primary ${
                      !isLast ? 'border-b border-[#2f3336]' : ''
                    }`}
                    style={{ borderRadius: 0 }}
                  >
                    <span className="text-left">{section.label}</span>
                    <ChevronRight className="w-5 h-5 flex-shrink-0 text-muted" />
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Back Button - Mobile/Tablet only, shown when a section is active */}
      {activeSection !== null && (
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setActiveSection(null)}
            className="flex items-center gap-2 text-sm font-medium transition-all text-muted hover:text-body"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Zurück</span>
          </button>
        </div>
      )}

      {/* Überschrift - Desktop only */}
      <h1 className="text-3xl font-bold text-heading mb-6 hidden lg:block">Einstellungen</h1>

      <div className="flex gap-0">
        {/* Sidebar Navigation - Desktop only */}
        <aside className="hidden lg:block lg:w-64 lg:flex-shrink-0 lg:sticky lg:top-16 lg:self-start lg:border lg:border-[#2f3336] lg:shadow-md lg:bg-page-primary lg:rounded-l-lg" style={{ minHeight: 'calc(100vh - 4rem)' }}>
          <nav>
            {sections.map((section) => {
              return (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSidebarSection(section.id);
                    localStorage.setItem('settings-active-section', section.id);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-4 text-sm font-medium transition-all text-body hover-bg-page-secondary ${
                    activeSidebarSection === section.id
                      ? 'bg-page-secondary'
                      : 'bg-page-primary'
                  }`}
                  style={{ borderRadius: 0 }}
                >
                  <span className="text-left">{section.label}</span>
                  <ChevronRight className="w-5 h-5 flex-shrink-0 text-muted" />
                </button>
              );
            })}
          </nav>
        </aside>

      {/* Main Content */}
      <div className={`flex-1 ${activeSection === null ? 'hidden lg:block' : 'block lg:block'} ${activeSection !== null && !isMounting ? 'animate-slide-in-right lg:animate-none' : ''}`}>
        <div className="lg:p-8 lg:pr-16 bg-page-primary lg:border lg:border-[#2f3336] lg:shadow-md lg:rounded-r-lg lg:border-l-0">
          {/* Content */}
          <div className="space-y-8">
            {/* Konto Section */}
            <div
              id="konto"
              className={`scroll-mt-8 ${
                activeSection === 'konto' ? `block ${!isMounting ? 'animate-slide-in-right' : ''}` : 'hidden'
              } ${activeSidebarSection === 'konto' ? 'lg:block' : 'lg:hidden'}`}
            >
              <h2 className="text-xl font-semibold text-heading mb-4">Konto</h2>
              <p className="text-muted">Kontoeinstellungen werden hier angezeigt.</p>
            </div>

            {/* Sicherheit Section */}
            <div
              id="sicherheit"
              className={`scroll-mt-8 ${
                activeSection === 'sicherheit' ? `block ${!isMounting ? 'animate-slide-in-right' : ''}` : 'hidden'
              } ${activeSidebarSection === 'sicherheit' ? 'lg:block' : 'lg:hidden'}`}
            >
              <h2 className="text-xl font-semibold text-heading mb-4">Sicherheit</h2>
              <p className="text-muted">Sicherheitseinstellungen werden hier angezeigt.</p>
            </div>

            {/* Datenschutz Section */}
            <div
              id="datenschutz"
              className={`scroll-mt-8 ${
                activeSection === 'datenschutz' ? `block ${!isMounting ? 'animate-slide-in-right' : ''}` : 'hidden'
              } ${activeSidebarSection === 'datenschutz' ? 'lg:block' : 'lg:hidden'}`}
            >
              <h2 className="text-xl font-semibold text-heading mb-4">Datenschutz</h2>
              <p className="text-muted">Datenschutzeinstellungen werden hier angezeigt.</p>
            </div>

            {/* Mitteilungen Section */}
            <div
              id="mitteilungen"
              className={`scroll-mt-8 ${
                activeSection === 'mitteilungen' ? `block ${!isMounting ? 'animate-slide-in-right' : ''}` : 'hidden'
              } ${activeSidebarSection === 'mitteilungen' ? 'lg:block' : 'lg:hidden'}`}
            >
              <h2 className="text-xl font-semibold text-heading mb-4">Mitteilungen</h2>
              <p className="text-muted">Mitteilungseinstellungen werden hier angezeigt.</p>
            </div>

            {/* Premium Section */}
            <div
              id="premium"
              className={`scroll-mt-8 ${
                activeSection === 'premium' ? `block ${!isMounting ? 'animate-slide-in-right' : ''}` : 'hidden'
              } ${activeSidebarSection === 'premium' ? 'lg:block' : 'lg:hidden'}`}
            >
              <h2 className="text-xl font-semibold text-heading mb-4">Premium</h2>
              <p className="text-muted">Premium-Einstellungen werden hier angezeigt.</p>
            </div>

            {/* Barrierefreiheit Section */}
            <div
              id="barrierefreiheit"
              className={`scroll-mt-8 ${
                activeSection === 'barrierefreiheit' ? `block ${!isMounting ? 'animate-slide-in-right' : ''}` : 'hidden'
              } ${activeSidebarSection === 'barrierefreiheit' ? 'lg:block' : 'lg:hidden'}`}
            >
              <h2 className="text-xl font-semibold text-heading mb-4">Barrierefreiheit</h2>
              <p className="text-muted">Barrierefreiheitseinstellungen werden hier angezeigt.</p>
            </div>

            {/* Sprache Section */}
            <div
              id="sprache"
              className={`scroll-mt-8 ${
                activeSection === 'sprache' ? `block ${!isMounting ? 'animate-slide-in-right' : ''}` : 'hidden'
              } ${activeSidebarSection === 'sprache' ? 'lg:block' : 'lg:hidden'}`}
            >
              <h2 className="text-xl font-semibold text-heading mb-4">Sprache</h2>
              <p className="text-muted mb-6">Wähle deine bevorzugte Sprache für die Anwendung.</p>

              <div className="space-y-3">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => switchLanguage(language.code)}
                    disabled={isPending}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all ${
                      language.code === locale
                        ? 'border-default bg-page-secondary'
                        : 'border-default hover:border-action-primary hover:bg-page-secondary'
                    } ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {/* Flag */}
                    <div className="text-3xl">{language.flag}</div>

                    {/* Language Info */}
                    <div className="flex-1 text-left">
                      <div className="text-body font-medium">{language.nativeName}</div>
                      <div className="text-muted text-sm">{language.name}</div>
                    </div>

                    {/* Checkmark for selected language */}
                    {language.code === locale && (
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-action-primary">
                        <Check size={16} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {isPending && (
                <div className="mt-4 text-sm text-muted flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-action-primary border-t-transparent rounded-full animate-spin"></div>
                  <span>Sprache wird gewechselt...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
