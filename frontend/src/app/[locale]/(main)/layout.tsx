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
  const isChatPage = pathname?.includes('/chat');

  return (
    <>
      <Header />
      {/* Mobile: normal flow with bottom padding, Desktop: margin for sidebar */}
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
      {!isChatPage && <Footer />}
      <MobileBottomNav />
    </>
  );
}