'use client';

import { useState, useEffect, useRef } from 'react';
import { Clock, Star, ChevronDown } from 'lucide-react';

interface ProfileTabsProps {
  escort?: {
    services?: string[];
    price1Hour?: number;
    price2Hours?: number;
    price3Hours?: number;
    priceOvernight?: number;
    description?: string;
  };
  initialTab?: 'service' | 'preise' | 'zeiten' | 'ueber-mich' | 'bewertungen';
  onTabChange?: (tab: 'service' | 'preise' | 'zeiten' | 'ueber-mich' | 'bewertungen') => void;
}

export default function ProfileTabs({ escort, initialTab = 'service', onTabChange }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<'service' | 'preise' | 'zeiten' | 'ueber-mich' | 'bewertungen'>(initialTab);

  // Accordion state for mobile - only one section open at a time
  const [openSection, setOpenSection] = useState<string>('service');
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Update active tab when initialTab changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const toggleSection = (sectionId: string) => {
    const headerElement = sectionRefs.current[sectionId];
    if (!headerElement) {
      setOpenSection(prev => prev === sectionId ? '' : sectionId);
      return;
    }

    // Get current scroll position and header position
    const scrollY = window.scrollY;
    const headerRect = headerElement.getBoundingClientRect();
    const headerTopRelativeToViewport = headerRect.top;
    const headerTopAbsolute = scrollY + headerTopRelativeToViewport;

    // Toggle the section
    setOpenSection(prev => prev === sectionId ? '' : sectionId);

    // After DOM update, restore scroll position to keep header in place
    requestAnimationFrame(() => {
      const newScrollY = window.scrollY;
      const newHeaderRect = headerElement.getBoundingClientRect();
      const newHeaderTopRelativeToViewport = newHeaderRect.top;
      const newHeaderTopAbsolute = newScrollY + newHeaderTopRelativeToViewport;

      // Calculate the difference and adjust scroll
      const scrollDiff = newHeaderTopAbsolute - headerTopAbsolute;
      if (Math.abs(scrollDiff) > 1) {
        window.scrollTo({
          top: newScrollY + scrollDiff,
          behavior: 'instant',
        });
      }
    });
  };

  const tabs = [
    { id: 'service' as const, label: 'Service' },
    { id: 'preise' as const, label: 'Preise' },
    { id: 'zeiten' as const, label: 'Zeiten' },
    { id: 'ueber-mich' as const, label: 'Über mich' },
    { id: 'bewertungen' as const, label: 'Bewertungen' },
  ];

  // Render helper for tab content
  const renderTabContent = (tabId: string) => {
    switch (tabId) {
      case 'service':
        return (
          <>
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-heading)' }}>
              Angebotene Services
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {[
                'Girlfriend Experience',
                'Massage',
                'Erotische Massage',
                'Outcall',
                'Incall',
                'Dinner Date',
                'Travel Companion',
                'Overnight',
                'Role Play',
              ].map((service) => (
                <div
                  key={service}
                  className="group relative px-4 py-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                  style={{
                    background: 'var(--background-primary)',
                    borderColor: 'var(--color-primary)',
                    borderWidth: '1.5px',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: 'var(--color-primary)' }}
                    />
                    <span
                      className="text-sm font-medium leading-tight"
                      style={{ color: 'var(--text-heading)' }}
                    >
                      {service}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="p-4 rounded-lg"
              style={{
                background: 'rgba(139, 92, 246, 0.05)',
                border: '1px solid var(--color-primary)',
              }}
            >
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                💡 <strong>Hinweis:</strong> Alle Services werden mit höchster Diskretion und Professionalität durchgeführt.
              </p>
            </div>
          </>
        );
      case 'preise':
        return (
          <>
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-heading)' }}>
              Preisübersicht
            </h3>

            <div className="space-y-4">
              {[
                { duration: '30 Minuten', price: '150€' },
                { duration: '1 Stunde', price: '250€', featured: true },
                { duration: '2 Stunden', price: '450€' },
                { duration: '3 Stunden', price: '600€' },
                { duration: '6 Stunden', price: '1.000€' },
                { duration: '12 Stunden', price: '1.800€' },
                { duration: '24 Stunden', price: '3.000€' },
                { duration: 'Übernachtung', price: '2.500€' },
                { duration: 'Wochenende', price: '5.000€' },
              ].map((item) => (
                <div
                  key={item.duration}
                  className="flex items-center justify-between p-4 rounded-lg border transition-all hover:scale-[1.02]"
                  style={{
                    background: item.featured ? 'rgba(139, 92, 246, 0.1)' : 'var(--background-secondary)',
                    borderColor: item.featured ? 'var(--color-primary)' : 'var(--border)',
                    borderWidth: item.featured ? '2px' : '1px',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: item.featured ? 'var(--color-primary)' : 'var(--background-tertiary)' }}
                    >
                      <Clock className="w-5 h-5" style={{ color: item.featured ? 'white' : 'var(--color-primary)' }} />
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-heading)' }}>
                        {item.duration}
                      </p>
                      {item.featured && (
                        <p className="text-xs" style={{ color: 'var(--color-primary)' }}>
                          Beliebt
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>
                      {item.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-lg" style={{ background: 'var(--background-secondary)' }}>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                ℹ️ Alle Preise verstehen sich inklusive aller Services. Sonderwünsche nach Absprache.
              </p>
            </div>
          </>
        );
      case 'zeiten':
        return (
          <>
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-heading)' }}>
              Verfügbarkeit & Arbeitszeiten
            </h3>

            <div className="space-y-4 mb-6">
              {[
                { day: 'Montag', hours: '10:00 - 22:00', available: true },
                { day: 'Dienstag', hours: '10:00 - 22:00', available: true },
                { day: 'Mittwoch', hours: '10:00 - 22:00', available: true },
                { day: 'Donnerstag', hours: '10:00 - 22:00', available: true },
                { day: 'Freitag', hours: '12:00 - 02:00', available: true },
                { day: 'Samstag', hours: '12:00 - 02:00', available: true },
                { day: 'Sonntag', hours: 'Geschlossen', available: false },
              ].map((day) => (
                <div
                  key={day.day}
                  className="flex items-center justify-between p-4 rounded-lg border"
                  style={{
                    background: 'var(--background-secondary)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: day.available ? '#10b981' : '#ef4444' }}
                    />
                    <span className="font-medium" style={{ color: 'var(--text-heading)' }}>
                      {day.day}
                    </span>
                  </div>
                  <span
                    className="text-sm"
                    style={{ color: day.available ? 'var(--text-regular)' : 'var(--text-secondary)' }}
                  >
                    {day.hours}
                  </span>
                </div>
              ))}
            </div>
          </>
        );
      case 'ueber-mich':
        return (
          <>
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-heading)' }}>
              Über mich
            </h3>

            <div className="space-y-6">
              <p className="text-base leading-relaxed" style={{ color: 'var(--text-regular)' }}>
                Hallo! Ich bin eine professionelle Begleiterin mit langjähriger Erfahrung.
                Ich lege großen Wert auf Diskretion, Professionalität und ein unvergessliches Erlebnis.
              </p>
              <p className="text-base leading-relaxed" style={{ color: 'var(--text-regular)' }}>
                In meiner Freizeit liebe ich es zu reisen, neue Kulturen kennenzulernen und gutes Essen zu genießen.
                Ich spreche mehrere Sprachen und bin sehr gebildet.
              </p>
            </div>
          </>
        );
      case 'bewertungen':
        return (
          <>
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-heading)' }}>
              Bewertungen
            </h3>

            <div className="space-y-4">
              {[1, 2, 3].map((review) => (
                <div
                  key={review}
                  className="p-4 rounded-lg border"
                  style={{
                    background: 'var(--background-secondary)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold mb-1" style={{ color: 'var(--text-heading)' }}>
                        Anonymer Nutzer
                      </p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-5 h-5"
                            style={{ color: '#fbbf24', fill: '#fbbf24' }}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      vor 2 Wochen
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-regular)' }}>
                    Absolut professionell und eine wunderbare Erfahrung. Sehr zu empfehlen!
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <button className="btn-base btn-secondary cursor-pointer">
                Alle Bewertungen anzeigen
              </button>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Desktop: Tabs */}
      <div className="hidden lg:block rounded-lg border-depth" style={{ background: 'var(--background-primary)' }}>
        {/* Tab Navigation */}
        <div
          className="flex border-b"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--background-primary)',
          }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (onTabChange) onTabChange(tab.id);
                }}
                className="flex-1 px-6 py-4 flex items-center justify-center text-sm font-medium transition-all cursor-pointer relative"
                style={{
                  color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(139, 92, 246, 0.08)' : 'transparent',
                  borderBottom: isActive ? '3px solid var(--color-primary)' : '1px solid var(--border)',
                  fontWeight: isActive ? '600' : '500',
                }}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8">
        {/* Service Tab */}
        {activeTab === 'service' && (
          <div className="animate-fade-in">
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-heading)' }}>
              Angebotene Services
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {[
                'Girlfriend Experience',
                'Massage',
                'Erotische Massage',
                'Outcall',
                'Incall',
                'Dinner Date',
                'Travel Companion',
                'Overnight',
                'Role Play',
              ].map((service) => (
                <div
                  key={service}
                  className="group relative px-4 py-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                  style={{
                    background: 'var(--background-primary)',
                    borderColor: 'var(--color-primary)',
                    borderWidth: '1.5px',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: 'var(--color-primary)' }}
                    />
                    <span
                      className="text-sm font-medium leading-tight"
                      style={{ color: 'var(--text-heading)' }}
                    >
                      {service}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="p-4 rounded-lg"
              style={{
                background: 'rgba(139, 92, 246, 0.05)',
                border: '1px solid var(--color-primary)',
              }}
            >
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                💡 <strong>Hinweis:</strong> Alle Services werden mit höchster Diskretion und Professionalität durchgeführt.
              </p>
            </div>
          </div>
        )}

        {/* Preise Tab */}
        {activeTab === 'preise' && (
          <div className="animate-fade-in">
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-heading)' }}>
              Preisübersicht
            </h3>

            <div className="space-y-4">
              {[
                { duration: '30 Minuten', price: '150€' },
                { duration: '1 Stunde', price: '250€', featured: true },
                { duration: '2 Stunden', price: '450€' },
                { duration: '3 Stunden', price: '600€' },
                { duration: '6 Stunden', price: '1.000€' },
                { duration: '12 Stunden', price: '1.800€' },
                { duration: '24 Stunden', price: '3.000€' },
                { duration: 'Übernachtung', price: '2.500€' },
                { duration: 'Wochenende', price: '5.000€' },
              ].map((item) => (
                <div
                  key={item.duration}
                  className="flex items-center justify-between p-4 rounded-lg border transition-all hover:scale-[1.02]"
                  style={{
                    background: item.featured ? 'rgba(139, 92, 246, 0.1)' : 'var(--background-secondary)',
                    borderColor: item.featured ? 'var(--color-primary)' : 'var(--border)',
                    borderWidth: item.featured ? '2px' : '1px',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: item.featured ? 'var(--color-primary)' : 'var(--background-tertiary)' }}
                    >
                      <Clock className="w-5 h-5" style={{ color: item.featured ? 'white' : 'var(--color-primary)' }} />
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-heading)' }}>
                        {item.duration}
                      </p>
                      {item.featured && (
                        <p className="text-xs" style={{ color: 'var(--color-primary)' }}>
                          Beliebt
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold" style={{ color: 'var(--color-primary)' }}>
                      {item.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-lg" style={{ background: 'var(--background-secondary)' }}>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                ℹ️ Alle Preise verstehen sich inklusive aller Services. Sonderwünsche nach Absprache.
              </p>
            </div>
          </div>
        )}

        {/* Zeiten Tab */}
        {activeTab === 'zeiten' && (
          <div className="animate-fade-in">
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-heading)' }}>
              Verfügbarkeit & Arbeitszeiten
            </h3>

            <div className="space-y-4 mb-6">
              {[
                { day: 'Montag', hours: '10:00 - 22:00', available: true },
                { day: 'Dienstag', hours: '10:00 - 22:00', available: true },
                { day: 'Mittwoch', hours: '10:00 - 22:00', available: true },
                { day: 'Donnerstag', hours: '10:00 - 22:00', available: true },
                { day: 'Freitag', hours: '12:00 - 02:00', available: true },
                { day: 'Samstag', hours: '12:00 - 02:00', available: true },
                { day: 'Sonntag', hours: 'Geschlossen', available: false },
              ].map((day) => (
                <div
                  key={day.day}
                  className="flex items-center justify-between p-4 rounded-lg border"
                  style={{
                    background: 'var(--background-secondary)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: day.available ? '#10b981' : '#ef4444' }}
                    />
                    <span className="font-medium" style={{ color: 'var(--text-heading)' }}>
                      {day.day}
                    </span>
                  </div>
                  <span
                    className="text-sm"
                    style={{ color: day.available ? 'var(--text-regular)' : 'var(--text-secondary)' }}
                  >
                    {day.hours}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                className="p-4 rounded-lg border"
                style={{
                  background: 'var(--background-secondary)',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--color-primary)' }}
                  >
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-semibold" style={{ color: 'var(--text-heading)' }}>
                    Spontane Termine
                  </h4>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Kurzfristige Buchungen innerhalb von 2-3 Stunden möglich
                </p>
              </div>

              <div
                className="p-4 rounded-lg border"
                style={{
                  background: 'var(--background-secondary)',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--color-secondary)' }}
                  >
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-semibold" style={{ color: 'var(--text-heading)' }}>
                    Vorausbuchung
                  </h4>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Termine können bis zu 2 Wochen im Voraus gebucht werden
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Über mich Tab */}
        {activeTab === 'ueber-mich' && (
          <div className="animate-fade-in">
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-heading)' }}>
              Über mich
            </h3>

            <div className="space-y-6">
              <div>
                <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--text-regular)' }}>
                  Hallo! Ich bin eine leidenschaftliche und aufgeschlossene Begleiterin, die es liebt,
                  besondere Momente mit interessanten Menschen zu teilen. Mit meinem charmanten Wesen
                  und meiner natürlichen Art sorge ich dafür, dass Sie sich von Anfang an wohl fühlen.
                </p>
                <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--text-regular)' }}>
                  Ob ein romantisches Dinner, ein kultureller Abend oder ein entspanntes Treffen -
                  ich passe mich gerne Ihren Wünschen an. Diskretion und Respekt sind für mich selbstverständlich.
                </p>
                <p className="text-base leading-relaxed" style={{ color: 'var(--text-regular)' }}>
                  Ich freue mich darauf, Sie kennenzulernen und gemeinsam unvergessliche Stunden zu verbringen!
                </p>
              </div>

              <div
                className="p-5 rounded-lg"
                style={{
                  background: 'var(--background-secondary)',
                  border: '1px solid var(--border)',
                }}
              >
                <h4 className="font-semibold mb-3" style={{ color: 'var(--text-heading)' }}>
                  Meine Interessen
                </h4>
                <div className="flex flex-wrap gap-2">
                  {['Reisen', 'Kulinarik', 'Kunst & Kultur', 'Sport', 'Musik', 'Mode', 'Literatur'].map((interest) => (
                    <span
                      key={interest}
                      className="px-3 py-1.5 rounded-full text-sm font-medium"
                      style={{
                        background: 'var(--color-primary)',
                        color: 'white',
                      }}
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              <div
                className="p-5 rounded-lg"
                style={{
                  background: 'var(--background-secondary)',
                  border: '1px solid var(--border)',
                }}
              >
                <h4 className="font-semibold mb-3" style={{ color: 'var(--text-heading)' }}>
                  Das schätzen meine Kunden
                </h4>
                <ul className="space-y-2">
                  {[
                    'Professionelles und diskretes Auftreten',
                    'Gepflegtes und stilvolles Erscheinungsbild',
                    'Gute Gesprächsführung und Humor',
                    'Zuverlässigkeit und Pünktlichkeit',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <svg
                        className="w-5 h-5 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm" style={{ color: 'var(--text-regular)' }}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Bewertungen Tab */}
        {activeTab === 'bewertungen' && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold" style={{ color: 'var(--text-heading)' }}>
                Bewertungen
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5"
                      style={{ color: '#fbbf24', fill: '#fbbf24' }}
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-heading)' }}>
                  5.0
                </span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  (24 Bewertungen)
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {[
                {
                  name: 'Michael S.',
                  rating: 5,
                  date: 'Vor 2 Tagen',
                  text: 'Absolut fantastisches Erlebnis! Sehr professionell, charmant und wunderschön. Die Zeit verging viel zu schnell. Definitiv eine Empfehlung!',
                },
                {
                  name: 'Thomas K.',
                  rating: 5,
                  date: 'Vor 1 Woche',
                  text: 'Ein unvergesslicher Abend! Tolle Gespräche, viel gelacht und eine sehr angenehme Atmosphäre. Genau so hatte ich es mir vorgestellt.',
                },
                {
                  name: 'Alexander B.',
                  rating: 5,
                  date: 'Vor 2 Wochen',
                  text: 'Sehr diskret, pünktlich und einfach zauberhaft. Man fühlt sich sofort wohl. Kann ich nur weiterempfehlen!',
                },
              ].map((review, index) => (
                <div
                  key={index}
                  className="p-5 rounded-lg border"
                  style={{
                    background: 'var(--background-secondary)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--text-heading)' }}>
                        {review.name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {review.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4"
                          style={{ color: '#fbbf24', fill: '#fbbf24' }}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-regular)' }}>
                    {review.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <button
                className="btn-base btn-secondary cursor-pointer"
              >
                Alle Bewertungen anzeigen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>

      {/* Mobile/Tablet: Accordion */}
      <div className="lg:hidden space-y-3">
        {tabs.map((tab) => {
          const isOpen = openSection === tab.id;

          return (
            <div
              key={tab.id}
              ref={(el) => (sectionRefs.current[tab.id] = el)}
              className="rounded-lg border-depth overflow-hidden"
              style={{ background: 'var(--background-primary)' }}
            >
              {/* Accordion Header */}
              <button
                onClick={() => toggleSection(tab.id)}
                className="w-full px-6 py-4 flex items-center justify-between transition-colors cursor-pointer"
                style={{
                  background: isOpen ? 'rgba(139, 92, 246, 0.08)' : 'transparent',
                  borderBottom: isOpen ? `1px solid var(--border)` : 'none',
                }}
              >
                <span
                  className="text-base font-semibold"
                  style={{ color: isOpen ? 'var(--color-primary)' : 'var(--text-heading)' }}
                >
                  {tab.label}
                </span>
                <ChevronDown
                  className="w-5 h-5 transition-transform duration-300"
                  style={{
                    color: isOpen ? 'var(--color-primary)' : 'var(--text-secondary)',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>

              {/* Accordion Content */}
              {isOpen && (
                <div className="p-6 animate-fade-in">
                  {renderTabContent(tab.id)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
