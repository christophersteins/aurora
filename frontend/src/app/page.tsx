import AuthTest from '@/components/AuthTest';

export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-4xl font-bold mb-8">Aurora - Auth Test</h1>

      <div className="max-w-md">
        <AuthTest />
      </div>
    </main>
  );
}