import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aurora',
  description: 'The modern platform for video content and live chat',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="flex flex-col min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
