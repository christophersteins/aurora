import '../globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { SocketProvider } from '@/contexts/SocketContext';
import LocaleDetector from '@/components/LocaleDetector';
import { locales } from '@/i18n';
import Script from 'next/script';

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
    <>
      <Script
        id="set-locale"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang = "${locale}";`,
        }}
      />
      <NextIntlClientProvider messages={messages}>
        <LocaleDetector />
        <SocketProvider>
          {children}
        </SocketProvider>
      </NextIntlClientProvider>
    </>
  );
}
