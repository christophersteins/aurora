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
      <main className="flex-1 pt-16">
        {children}
      </main>
      {!isChatPage && <Footer />}
    </>
  );
}
