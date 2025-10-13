import SocketStatus from '@/components/SocketStatus';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">Aurora</h1>
      <p className="text-gray-600">
        Socket.io Client ist aktiv. Prüfe unten rechts den Status.
      </p>
      <SocketStatus />
    </main>
  );
}