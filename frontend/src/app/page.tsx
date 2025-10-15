import GeolocationTest from '@/components/GeolocationTest';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">Aurora</h1>
      
      <GeolocationTest />
    </main>
  );
}