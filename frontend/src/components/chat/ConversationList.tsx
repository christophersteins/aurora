'use client';

import React from 'react';

interface Conversation {
  id: string;
  otherUserName: string;
  lastMessage?: string;
  unreadCount: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelectConversation: (id: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedId,
  onSelectConversation,
}) => {
  return (
    <div className="w-80 border-r bg-white h-full overflow-y-auto">
      <div className="p-4 border-b bg-gray-100">
        <h1 className="text-xl font-bold">Chats</h1>
      </div>

      <div className="divide-y">
        {conversations.length === 0 ? (
          <p className="p-4 text-gray-400 text-center">Keine Konversationen</p>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                selectedId === conv.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-semibold">{conv.otherUserName}</h3>
                {conv.unreadCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
              {conv.lastMessage && (
                <p className="text-sm text-gray-600 truncate mt-1">{conv.lastMessage}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};