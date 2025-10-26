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
      {/* Mobile: pt-16 for top header, Desktop: margin for sidebar */}
      <main className="flex-1 pt-16 lg:pt-0" style={{ marginLeft: 'calc(var(--sidebar-offset, 0px) + var(--sidebar-width, 0px))', border: '3px solid red' }}>
        <div className="px-4 sm:px-6 lg:px-8 lg:pt-4" style={{ maxWidth: 'var(--max-content-width)', border: '2px dashed orange' }}>
          {children}
        </div>
      </main>
      {!isChatPage && <Footer />}
    </>
  );
}
