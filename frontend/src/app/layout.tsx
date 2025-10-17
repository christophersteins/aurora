import './globals.css'
import { SocketProvider } from '@/contexts/SocketContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="bg-[#000000] text-white">
        <SocketProvider>
          {children}
        </SocketProvider>
      </body>
    </html>
  );
}