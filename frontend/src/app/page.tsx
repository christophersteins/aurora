import SocketStatus from '@/components/SocketStatus';
import ChatHookTest from '@/components/ChatHookTest';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">Aurora</h1>
      <p className="text-gray-600 mb-8">
        Chat-System ist bereit.
      </p>
      
      <ChatHookTest />
      
      <SocketStatus />
    </main>
  );
}