import './globals.css'
import { SocketProvider } from '@/contexts/SocketContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="flex flex-col min-h-screen">
        <SocketProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </SocketProvider>
      </body>
    </html>
  );
}