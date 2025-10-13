import type { Metadata } from 'next';
import './globals.css';
import { SocketProvider } from '@/contexts/SocketContext';

export const metadata: Metadata = {
  title: 'Aurora',
  description: 'Modern, fast and secure web app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>
        <SocketProvider>
          {children}
        </SocketProvider>
      </body>
    </html>
  );
}