'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MobileBottomNav from '@/components/MobileBottomNav';
import { usePathname } from 'next/navigation';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isChatPage = pathname?.includes('/nachrichten');
  // Check if it's an individual chat page (e.g., /nachrichten/username)
  const isIndividualChatPage = pathname?.match(/\/nachrichten\/[^\/]+$/);

  return (
    <>
      {/* Hide header on mobile for individual chat pages */}
      <div className={isIndividualChatPage ? 'hidden lg:block' : ''}>
        <Header />
      </div>
      {/* Mobile: normal flow with bottom padding, Desktop: margin for sidebar */}
      {isChatPage ? (
        // Chat page: Fixed layout without padding/scrolling
        <main
          className={`fixed inset-0 ${isIndividualChatPage ? 'pt-0' : 'pt-16'} lg:pt-0 overflow-hidden`}
          style={{
            marginLeft: 'calc(var(--sidebar-offset, 0px) + var(--sidebar-width, 0px))',
          }}
        >
          <div className="h-full lg:max-w-[var(--max-content-width)] lg:pl-[var(--content-padding-left)]">
            {children}
          </div>
        </main>
      ) : (
        // Normal pages: Regular scrollable layout
        <main
          className="flex-1 pt-16 lg:pt-0 pb-20 lg:pb-0"
          style={{
            marginLeft: 'calc(var(--sidebar-offset, 0px) + var(--sidebar-width, 0px))',
            paddingBottom: '80px',
          }}
        >
          <div className="lg:pt-4" style={{
            width: '100%',
            maxWidth: 'var(--max-content-width)',
            paddingLeft: 'var(--content-padding-left)',
            paddingRight: 'var(--content-padding-right)',
            boxSizing: 'border-box'
          }}>
            {children}
          </div>
        </main>
      )}
      {!isChatPage && <Footer />}
      <MobileBottomNav />
    </>
  );
}