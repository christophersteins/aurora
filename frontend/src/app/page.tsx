import GeolocationTest from '@/components/GeolocationTest';
import NearbyUsers from '@/components/NearbyUsers';

export default function Home() {
  // Für den Test - später aus Auth-Context holen
  const userId = '15f4f09e-3716-40db-a088-9ef50a2c37df'; // nearbytest@aurora.com
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxNWY0ZjA5ZS0zNzE2LTQwZGItYTA4OC05ZWY1MGEyYzM3ZGYiLCJlbWFpbCI6Im5lYXJieXRlc3RAYXVyb3JhLmNvbSIsImlhdCI6MTc2MDUzOTU5MSwiZXhwIjoxNzYxMTQ0MzkxfQ.QkxhfYBK0vTr0cxdXAerPmQRPha-_rembm5kUwHeVfk';

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-4xl font-bold mb-8">Aurora - Geolocation Test</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <GeolocationTest />
      </div>

      <NearbyUsers userId={userId} token={token} />
    </main>
  );
}