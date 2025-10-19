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
  return children;
}
