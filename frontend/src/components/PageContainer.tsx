import { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * PageContainer - Konsistenter Container für alle Seiten
 * 
 * Diese Komponente stellt sicher, dass alle Seiten die gleiche
 * Container-Struktur wie Header und Footer verwenden.
 * 
 * Features:
 * - Responsive Padding: px-4 (mobile), sm:px-6 (tablet), lg:px-8 (desktop)
 * - Maximale Breite: 1280px (über CSS-Variable)
 * - Vertikales Padding: py-8
 * - Minimale Höhe: min-h-screen
 */
export default function PageContainer({ children, className = '' }: PageContainerProps) {
  return (
    <div className={`min-h-screen py-8 ${className}`}>
      <div 
        className="mx-auto px-4 sm:px-6 lg:px-8" 
        style={{ maxWidth: 'var(--max-content-width)' }}
      >
        {children}
      </div>
    </div>
  );
}
