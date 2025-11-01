'use client';

import { useState, useEffect, useRef } from 'react';
import { Clock, Star, ChevronDown, Briefcase, Euro, Calendar, MapPinned, FileText, MessageSquare, Check } from 'lucide-react';
import PricingDisplay from './PricingDisplay';
import MeetingPointsDisplay from './MeetingPointsDisplay';
import AvailabilityDisplay from './AvailabilityDisplay';
import ReviewSection from './ReviewSection';
import { AvailabilitySchedule } from '@/types/auth.types';

interface ProfileTabsProps {
  escort?: {
    id?: string;
    services?: string[];
    price30Min?: number;
    price1Hour?: number;
    price2Hours?: number;
    price3Hours?: number;
    price6Hours?: number;
    price12Hours?: number;
    price24Hours?: number;
    priceOvernight?: number;
    priceWeekend?: number;
    description?: string;
    meetingPoints?: string[];
    availability?: AvailabilitySchedule;
  };
  initialTab?: 'service' | 'preise' | 'zeiten' | 'treffpunkte' | 'ueber-mich' | 'bewertungen';
  onTabChange?: (tab: 'service' | 'preise' | 'zeiten' | 'treffpunkte' | 'ueber-mich' | 'bewertungen') => void;
}

export default function ProfileTabs({ escort, initialTab = 'service', onTabChange }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<'service' | 'preise' | 'zeiten' | 'treffpunkte' | 'ueber-mich' | 'bewertungen'>(initialTab);

  // Accordion state for mobile - only one section open at a time
  const [openSection, setOpenSection] = useState<string>('service');
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Update active tab when initialTab changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Intersection Observer for Desktop to track which section is visible
  useEffect(() => {
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.target.id) {
          setActiveTab(entry.target.id as typeof activeTab);
          if (onTabChange) onTabChange(entry.target.id as typeof activeTab);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.5,
      rootMargin: '-100px 0px -50% 0px',
    });

    // Observe all sections on desktop
    const tabs = ['service', 'preise', 'zeiten', 'treffpunkte', 'ueber-mich', 'bewertungen'];
    tabs.forEach((tabId) => {
      const element = document.getElementById(tabId);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [onTabChange]);

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
    { id: 'service' as const, label: 'Service', icon: Briefcase },
    { id: 'preise' as const, label: 'Preise', icon: Euro },
    { id: 'zeiten' as const, label: 'Zeiten', icon: Clock },
    { id: 'treffpunkte' as const, label: 'Treffpunkte', icon: MapPinned },
    { id: 'ueber-mich' as const, label: 'Über mich', icon: FileText },
    { id: 'bewertungen' as const, label: 'Bewertungen', icon: Star },
  ];

  // Render helper for tab content
  const renderTabContent = (tabId: string) => {
    switch (tabId) {
      case 'service':
        return (
          <>
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-heading)' }}>
              Service
            </h3>

            {/* Softcore Services */}
            <div className="mb-8">
              <h4 className="subheading mb-4">
                Softcore
              </h4>
              <div className="space-y-2">
                {[
                  'Girlfriend Experience',
                  'Massage',
                  'Erotische Massage',
                  'Dinner Date',
                  'Travel Companion',
                  'Overnight',
                ].map((service) => (
                  <div key={service} className="flex items-center gap-3">
                    <Check className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-regular)' }}>
                      {service}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hardcore Services */}
            <div className="mb-6">
              <h4 className="subheading mb-4">
                Hardcore
              </h4>
              <div className="space-y-2">
                {[
                  'Role Play',
                  'BDSM',
                  'Fetish Services',
                ].map((service) => (
                  <div key={service} className="flex items-center gap-3">
                    <Check className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-regular)' }}>
                      {service}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
      case 'preise':
        return (
          <>
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-heading)' }}>
              Preise
            </h3>
            <PricingDisplay prices={escort} />
          </>
        );
      case 'zeiten':
        return (
          <>
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-heading)' }}>
              Zeiten
            </h3>

            <AvailabilityDisplay availability={escort?.availability} />
          </>
        );
      case 'treffpunkte':
        return (
          <>
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-heading)' }}>
              Treffpunkte
            </h3>

            <MeetingPointsDisplay selectedPoints={escort?.meetingPoints} />
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
              {[5, 4, 5].map((rating, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border"
                  style={{
                    background: 'var(--background-primary)',
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
                            style={{
                              color: i < rating ? 'var(--color-primary)' : 'var(--border)',
                              fill: i < rating ? 'var(--color-primary)' : 'none'
                            }}
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
      {/* Desktop: Content Only */}
      <div className="hidden lg:block rounded-lg" style={{ background: 'var(--background-primary)' }}>
        {/* Content Area */}
        <div className="py-6 sm:py-8 space-y-12">
        {/* Service Section */}
          <div id="service" className="scroll-mt-24">
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-heading)' }}>
              Service
            </h3>

            {/* Softcore Services */}
            <div className="mb-8">
              <h4 className="subheading mb-4">
                Softcore
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                {[
                  'Girlfriend Experience',
                  'Massage',
                  'Erotische Massage',
                  'Dinner Date',
                  'Travel Companion',
                  'Overnight',
                ].map((service) => (
                  <div key={service} className="flex items-center gap-3">
                    <Check className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-regular)' }}>
                      {service}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hardcore Services */}
            <div className="mb-6">
              <h4 className="subheading mb-4">
                Hardcore
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                {[
                  'Role Play',
                  'BDSM',
                  'Fetish Services',
                ].map((service) => (
                  <div key={service} className="flex items-center gap-3">
                    <Check className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-regular)' }}>
                      {service}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        {/* Preise Section */}
          <div id="preise" className="scroll-mt-24 pt-12 border-t" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-heading)' }}>
              Preise
            </h3>
            <PricingDisplay prices={escort} />
          </div>

        {/* Zeiten Section */}
          <div id="zeiten" className="scroll-mt-24 pt-12 border-t" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-heading)' }}>
              Zeiten
            </h3>

            <AvailabilityDisplay availability={escort?.availability} />
          </div>

        {/* Treffpunkte Section */}
          <div id="treffpunkte" className="scroll-mt-24 pt-12 border-t" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-heading)' }}>
              Treffpunkte
            </h3>

            <MeetingPointsDisplay selectedPoints={escort?.meetingPoints} />
          </div>

        {/* Über mich Section */}
          <div id="ueber-mich" className="scroll-mt-24 pt-12 border-t" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-heading)' }}>
              Über mich
            </h3>

            <div>
              {escort?.description ? (
                <p className="text-base leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-regular)' }}>
                  {escort.description}
                </p>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>

        {/* Bewertungen Section */}
          <div id="bewertungen" className="scroll-mt-24 pt-12 border-t" style={{ borderColor: 'var(--border)' }}>
            {escort?.id ? (
              <ReviewSection userId={escort.id} />
            ) : (
              <div className="text-center py-8">
                <p style={{ color: 'var(--text-secondary)' }}>Bewertungen können nicht geladen werden</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile/Tablet: All Content Visible */}
      <div className="lg:hidden rounded-lg" style={{ background: 'var(--background-primary)' }}>
        <div className="py-6 space-y-12">
          {/* Service Section */}
          <div id="service" className="scroll-mt-24">
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-heading)' }}>
              Service
            </h3>

            {/* Softcore Services */}
            <div className="mb-8">
              <h4 className="subheading mb-4">
                Softcore
              </h4>
              <div className="space-y-2">
                {[
                  'Girlfriend Experience',
                  'Massage',
                  'Erotische Massage',
                  'Dinner Date',
                  'Travel Companion',
                  'Overnight',
                ].map((service) => (
                  <div key={service} className="flex items-center gap-3">
                    <Check className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-regular)' }}>
                      {service}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hardcore Services */}
            <div className="mb-6">
              <h4 className="subheading mb-4">
                Hardcore
              </h4>
              <div className="space-y-2">
                {[
                  'Role Play',
                  'BDSM',
                  'Fetish Services',
                ].map((service) => (
                  <div key={service} className="flex items-center gap-3">
                    <Check className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-regular)' }}>
                      {service}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Preise Section */}
          <div id="preise" className="scroll-mt-24 pt-12 border-t" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-heading)' }}>
              Preise
            </h3>
            <PricingDisplay prices={escort} />
          </div>

          {/* Zeiten Section */}
          <div id="zeiten" className="scroll-mt-24 pt-12 border-t" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-heading)' }}>
              Zeiten
            </h3>

            <AvailabilityDisplay availability={escort?.availability} />
          </div>

          {/* Treffpunkte Section */}
          <div id="treffpunkte" className="scroll-mt-24 pt-12 border-t" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-heading)' }}>
              Treffpunkte
            </h3>

            <MeetingPointsDisplay selectedPoints={escort?.meetingPoints} />
          </div>

          {/* Über mich Section */}
          <div id="ueber-mich" className="scroll-mt-24 pt-12 border-t" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-heading)' }}>
              Über mich
            </h3>

            <div>
              {escort?.description ? (
                <p className="text-base leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-regular)' }}>
                  {escort.description}
                </p>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>

          {/* Bewertungen Section */}
          <div id="bewertungen" className="scroll-mt-24 pt-12 border-t" style={{ borderColor: 'var(--border)' }}>
            {escort?.id ? (
              <ReviewSection userId={escort.id} />
            ) : (
              <div className="text-center py-8">
                <p style={{ color: 'var(--text-secondary)' }}>Bewertungen können nicht geladen werden</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
