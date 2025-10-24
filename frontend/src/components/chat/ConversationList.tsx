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
    <div className="w-80 border-r border-default bg-page-primary h-full overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-default bg-page-primary flex justify-between items-center">
        <h1 className="text-xl font-bold text-heading">Chats</h1>
        <button
          onClick={onNewConversation}
          className="px-3 py-1 bg-action-primary text-button-primary rounded-lg hover:bg-action-primary-hover transition text-sm"
        >
          + Neu
        </button>
      </div>

      <div className="divide-y divide-default flex-1 overflow-y-auto bg-page-primary">
        {conversations.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted mb-4">Keine Konversationen</p>
            <button
              onClick={onNewConversation}
              className="px-4 py-2 bg-action-primary text-button-primary rounded-lg hover:bg-action-primary-hover transition"
            >
              Erste Konversation starten
            </button>
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onSelectConversation(conv.id)}
              className={`p-4 cursor-pointer hover:bg-page-secondary transition ${
                selectedId === conv.id ? 'bg-page-secondary border-l-4 border-primary' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-body">{conv.otherUserName}</h3>
                {conv.unreadCount > 0 && (
                  <span className="bg-action-primary text-button-primary text-xs px-2 py-1 rounded-full">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
              {conv.lastMessage && (
                <p className="text-sm text-muted truncate mt-1">{conv.lastMessage}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};