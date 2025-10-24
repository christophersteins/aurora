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

// Helper function to generate avatar initials
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Helper function to generate consistent color from string
const getAvatarColor = (name: string): string => {
  const colors = [
    'bg-purple-600',
    'bg-blue-600',
    'bg-green-600',
    'bg-pink-600',
    'bg-yellow-600',
    'bg-red-600',
    'bg-indigo-600',
    'bg-teal-600',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedId,
  onSelectConversation,
  onNewConversation,
}) => {
  return (
    <div className="w-full md:w-80 border-l border-r border-default bg-page-primary h-full overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-default bg-page-primary flex justify-between items-center sticky top-0 z-10 backdrop-blur-sm bg-page-primary/95">
        <h1 className="text-xl font-bold text-heading">Nachrichten</h1>
        <button
          onClick={onNewConversation}
          className="p-2 bg-action-primary text-button-primary rounded-full hover:bg-action-primary-hover transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 hover:scale-110 active:scale-95"
          title="Neue Nachricht"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {conversations.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center h-full">
            <div className="mb-4 text-muted">
              <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-muted mb-4">Keine Konversationen</p>
            </div>
            <button
              onClick={onNewConversation}
              className="px-6 py-3 bg-action-primary text-button-primary rounded-full hover:bg-action-primary-hover transition-all duration-200 font-semibold hover:shadow-lg hover:shadow-primary/20 hover:scale-105 active:scale-95"
            >
              Erste Konversation starten
            </button>
          </div>
        ) : (
          <div>
            {conversations.map((conv, index) => (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`px-4 py-3 cursor-pointer transition-all duration-200 relative border-b border-default ${
                  selectedId === conv.id
                    ? 'bg-page-secondary'
                    : 'hover:bg-page-secondary/50'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full ${getAvatarColor(conv.otherUserName)} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                      {getInitials(conv.otherUserName)}
                    </div>
                    {/* Online indicator - you can add logic for this later */}
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-success rounded-full border-2 border-page-primary"></div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className={`font-semibold truncate ${
                        conv.unreadCount > 0 ? 'text-heading' : 'text-body'
                      }`}>
                        {conv.otherUserName}
                      </h3>
                      <span className="text-xs text-muted ml-2 flex-shrink-0">
                        vor 5 Min
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      {conv.lastMessage ? (
                        <p className={`text-sm truncate ${
                          conv.unreadCount > 0 ? 'text-body font-medium' : 'text-muted'
                        }`}>
                          {conv.lastMessage}
                        </p>
                      ) : (
                        <p className="text-sm text-muted italic">Keine Nachrichten</p>
                      )}

                      {conv.unreadCount > 0 && (
                        <span className="bg-action-primary text-button-primary text-xs px-2 py-0.5 rounded-full font-bold min-w-[20px] text-center flex-shrink-0 shadow-sm animate-pulse">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};