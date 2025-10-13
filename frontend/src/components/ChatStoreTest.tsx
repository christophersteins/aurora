'use client';

import { useChatStore } from '@/store/chatStore';

export default function ChatStoreTest() {
  const { conversations, addConversation } = useChatStore();

  const testAddConversation = () => {
    addConversation({
      id: 'test-1',
      user1: {
        id: '1',
        email: 'user1@test.com',
        username: 'User 1',
      },
      user2: {
        id: '2',
        email: 'user2@test.com',
        username: 'User 2',
      },
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-bold mb-2">Chat Store Test</h3>
      <button
        onClick={testAddConversation}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Test Conversation hinzufügen
      </button>
      <p className="mt-2">Conversations: {conversations.length}</p>
      <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
        {JSON.stringify(conversations, null, 2)}
      </pre>
    </div>
  );
}