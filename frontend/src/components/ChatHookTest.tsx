'use client';

import { useChat } from '@/hooks/useChat';
import { useState } from 'react';

export default function ChatHookTest() {
  const [userId] = useState('test-user-123');
  const { isConnected, conversations } = useChat(userId);

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="font-bold mb-2">Chat Hook Test</h3>
      <div className="space-y-2 text-sm">
        <p>
          Socket Status:{' '}
          <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
            {isConnected ? '✅ Verbunden' : '❌ Getrennt'}
          </span>
        </p>
        <p>User ID: {userId}</p>
        <p>Conversations: {conversations.length}</p>
        <p className="text-xs text-gray-500 mt-2">
          ℹ️ API-Calls benötigen Auth-Token (kommt später)
        </p>
      </div>
    </div>
  );
}