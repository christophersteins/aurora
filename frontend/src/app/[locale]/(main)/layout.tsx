'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
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
      {/* Mobile: normal flow, Desktop: margin for sidebar */}
      <main className="flex-1 lg:pt-0" style={{ marginLeft: 'calc(var(--sidebar-offset, 0px) + var(--sidebar-width, 0px))' }}>
        <div className="lg:pt-4" style={{
          maxWidth: 'var(--max-content-width)',
          paddingLeft: 'var(--content-padding-x)',
          paddingRight: 'var(--content-padding-x)'
        }}>
          {children}
        </div>
      </main>
      {!isChatPage && <Footer />}
    </>
  );
}
