import './globals.css'
import { SocketProvider } from '@/contexts/SocketContext';
import Header from '@/components/Header';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <SocketProvider>
          <Header />
          {children}
        </SocketProvider>
      </body>
    </html>
  );
}