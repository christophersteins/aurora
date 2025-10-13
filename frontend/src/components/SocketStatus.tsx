'use client';

import { useSocket } from '@/contexts/SocketContext';

export default function SocketStatus() {
  const { isConnected, socket } = useSocket();

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
      <div className="flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <span className="text-sm font-medium">
          {isConnected ? 'Verbunden' : 'Getrennt'}
        </span>
      </div>
      {socket && (
        <p className="text-xs text-gray-500 mt-1">ID: {socket.id}</p>
      )}
    </div>
  );
}