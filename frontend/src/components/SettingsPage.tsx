'use client';

import { useState } from 'react';
import { ArrowLeft, ChevronRight, User, Lock, Shield, Bell, Star, Accessibility, Globe } from 'lucide-react';

export default function SettingsPage() {
  // Mobile navigation state - null means menu is shown, string means section is shown
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Desktop sidebar navigation state - tracks active section on desktop
  const [activeSidebarSection, setActiveSidebarSection] = useState<string>('konto');

  const sections = [
    { id: 'konto', label: 'Konto', icon: User },
    { id: 'sicherheit', label: 'Sicherheit', icon: Lock },
    { id: 'datenschutz', label: 'Datenschutz', icon: Shield },
    { id: 'mitteilungen', label: 'Mitteilungen', icon: Bell },
    { id: 'premium', label: 'Premium', icon: Star },
    { id: 'barrierefreiheit', label: 'Barrierefreiheit', icon: Accessibility },
    { id: 'sprache', label: 'Sprache', icon: Globe },
  ];

  return (
    <div>
      {/* Mobile/Tablet Navigation - shown only when no section is active */}
      {activeSection === null && (
        <div className="lg:hidden mb-6 animate-slide-in-left">
          <div className="border border-[#2f3336] shadow-md bg-page-primary rounded-lg overflow-hidden">
            <nav>
              {sections.map((section, index) => {
                const Icon = section.icon;
                const isLast = index === sections.length - 1;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center justify-between px-4 py-4 text-sm font-medium transition-all text-body hover-bg-page-secondary bg-page-primary ${
                      !isLast ? 'border-b border-[#2f3336]' : ''
                    }`}
                    style={{ borderRadius: 0 }}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 flex-shrink-0 text-muted" />
                      <span className="text-left">{section.label}</span>
                    </div>
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
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSidebarSection(section.id)}
                  className={`w-full flex items-center justify-between px-4 py-4 text-sm font-medium transition-all text-body hover-bg-page-secondary ${
                    activeSidebarSection === section.id
                      ? 'bg-page-secondary'
                      : 'bg-page-primary'
                  }`}
                  style={{ borderRadius: 0 }}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 flex-shrink-0 text-muted" />
                    <span className="text-left">{section.label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 flex-shrink-0 text-muted" />
                </button>
              );
            })}
          </nav>
        </aside>

      {/* Main Content */}
      <div className={`flex-1 ${activeSection === null ? 'hidden lg:block' : 'block lg:block'} ${activeSection !== null ? 'animate-slide-in-right lg:animate-none' : ''}`}>
        <div className="lg:p-8 lg:pr-16 bg-page-primary lg:border lg:border-[#2f3336] lg:shadow-md lg:rounded-r-lg lg:border-l-0">
          {/* Content */}
          <div className="space-y-8">
            {/* Konto Section */}
            <div
              id="konto"
              className={`scroll-mt-8 ${
                activeSection === 'konto' ? 'block animate-slide-in-right' : 'hidden'
              } ${activeSidebarSection === 'konto' ? 'lg:block' : 'lg:hidden'}`}
            >
              <h2 className="text-xl font-semibold text-heading mb-4">Konto</h2>
              <p className="text-muted">Kontoeinstellungen werden hier angezeigt.</p>
            </div>

            {/* Sicherheit Section */}
            <div
              id="sicherheit"
              className={`scroll-mt-8 ${
                activeSection === 'sicherheit' ? 'block animate-slide-in-right' : 'hidden'
              } ${activeSidebarSection === 'sicherheit' ? 'lg:block' : 'lg:hidden'}`}
            >
              <h2 className="text-xl font-semibold text-heading mb-4">Sicherheit</h2>
              <p className="text-muted">Sicherheitseinstellungen werden hier angezeigt.</p>
            </div>

            {/* Datenschutz Section */}
            <div
              id="datenschutz"
              className={`scroll-mt-8 ${
                activeSection === 'datenschutz' ? 'block animate-slide-in-right' : 'hidden'
              } ${activeSidebarSection === 'datenschutz' ? 'lg:block' : 'lg:hidden'}`}
            >
              <h2 className="text-xl font-semibold text-heading mb-4">Datenschutz</h2>
              <p className="text-muted">Datenschutzeinstellungen werden hier angezeigt.</p>
            </div>

            {/* Mitteilungen Section */}
            <div
              id="mitteilungen"
              className={`scroll-mt-8 ${
                activeSection === 'mitteilungen' ? 'block animate-slide-in-right' : 'hidden'
              } ${activeSidebarSection === 'mitteilungen' ? 'lg:block' : 'lg:hidden'}`}
            >
              <h2 className="text-xl font-semibold text-heading mb-4">Mitteilungen</h2>
              <p className="text-muted">Mitteilungseinstellungen werden hier angezeigt.</p>
            </div>

            {/* Premium Section */}
            <div
              id="premium"
              className={`scroll-mt-8 ${
                activeSection === 'premium' ? 'block animate-slide-in-right' : 'hidden'
              } ${activeSidebarSection === 'premium' ? 'lg:block' : 'lg:hidden'}`}
            >
              <h2 className="text-xl font-semibold text-heading mb-4">Premium</h2>
              <p className="text-muted">Premium-Einstellungen werden hier angezeigt.</p>
            </div>

            {/* Barrierefreiheit Section */}
            <div
              id="barrierefreiheit"
              className={`scroll-mt-8 ${
                activeSection === 'barrierefreiheit' ? 'block animate-slide-in-right' : 'hidden'
              } ${activeSidebarSection === 'barrierefreiheit' ? 'lg:block' : 'lg:hidden'}`}
            >
              <h2 className="text-xl font-semibold text-heading mb-4">Barrierefreiheit</h2>
              <p className="text-muted">Barrierefreiheitseinstellungen werden hier angezeigt.</p>
            </div>

            {/* Sprache Section */}
            <div
              id="sprache"
              className={`scroll-mt-8 ${
                activeSection === 'sprache' ? 'block animate-slide-in-right' : 'hidden'
              } ${activeSidebarSection === 'sprache' ? 'lg:block' : 'lg:hidden'}`}
            >
              <h2 className="text-xl font-semibold text-heading mb-4">Sprache</h2>
              <p className="text-muted">Spracheinstellungen werden hier angezeigt.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
