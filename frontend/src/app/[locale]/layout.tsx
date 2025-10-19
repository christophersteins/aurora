import '../globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { SocketProvider } from '@/contexts/SocketContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LocaleDetector from '@/components/LocaleDetector';
import { locales } from '@/i18n';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as 'en' | 'de')) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="flex flex-col min-h-screen">
        <NextIntlClientProvider messages={messages}>
          <LocaleDetector />
          <SocketProvider>
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </SocketProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
