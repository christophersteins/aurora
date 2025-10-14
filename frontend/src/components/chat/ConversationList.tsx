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
  onNewConversation: () => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedId,
  onSelectConversation,
  onNewConversation,
}) => {
  return (
    <div className="w-80 border-r bg-white h-full overflow-y-auto flex flex-col">
      <div className="p-4 border-b bg-gray-100 flex justify-between items-center">
        <h1 className="text-xl font-bold">Chats</h1>
        <button
          onClick={onNewConversation}
          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
        >
          + Neu
        </button>
      </div>

      <div className="divide-y flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400 mb-4">Keine Konversationen</p>
            <button
              onClick={onNewConversation}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Erste Konversation starten
            </button>
          </div>
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