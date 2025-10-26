'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SquarePen, Search, X, Star, Pin, MailOpen, Trash2 } from 'lucide-react';
import ProfileAvatar from '@/components/ProfileAvatar';
import { Conversation } from '@/types/chat.types';
import { chatService } from '@/services/chatService';

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

type TabType = 'all' | 'unread' | 'favorites';

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedId,
  onSelectConversation,
  onNewConversation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    conversationId: string | null;
  }>({
    visible: false,
    x: 0,
    y: 0,
    conversationId: null,
  });
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Filter conversations based on search term and active tab
  const filteredConversations = conversations.filter(conv => {
    // First apply search filter
    const search = searchTerm.toLowerCase().trim();
    if (search) {
      const userName = (conv.otherUserName || '').toLowerCase();
      const lastMsg = (conv.lastMessage || '').toLowerCase();
      if (!userName.includes(search) && !lastMsg.includes(search)) {
        return false;
      }
    }

    // Then apply tab filter
    if (activeTab === 'unread') {
      return conv.unreadCount > 0;
    } else if (activeTab === 'favorites') {
      return favoriteIds.has(conv.id);
    }

    return true; // 'all' tab
  });

  const handleClearSearch = () => {
    setSearchTerm('');
    searchInputRef.current?.focus();
  };

  const toggleFavorite = (convId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting conversation
    setFavoriteIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(convId)) {
        newSet.delete(convId);
      } else {
        newSet.add(convId);
      }
      return newSet;
    });
    // TODO: Implement API call to save favorite status
  };

  // Handle right-click on conversation
  const handleContextMenu = (e: React.MouseEvent, conversationId: string) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      conversationId,
    });
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu({ visible: false, x: 0, y: 0, conversationId: null });
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setContextMenu({ visible: false, x: 0, y: 0, conversationId: null });
      }
    };

    if (contextMenu.visible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [contextMenu.visible]);

  // Context menu handlers
  const handleMarkAsUnread = async () => {
    if (!contextMenu.conversationId) return;

    try {
      await chatService.markAsUnread(contextMenu.conversationId);
      console.log('Chat als ungelesen markiert:', contextMenu.conversationId);
      setContextMenu({ visible: false, x: 0, y: 0, conversationId: null });
      // Refresh conversations to update UI
      window.location.reload();
    } catch (error) {
      console.error('Fehler beim Markieren als ungelesen:', error);
    }
  };

  const handleTogglePin = async () => {
    if (!contextMenu.conversationId) return;

    try {
      await chatService.togglePin(contextMenu.conversationId);
      console.log('Chat anheften geändert');
      setContextMenu({ visible: false, x: 0, y: 0, conversationId: null });
      // Refresh conversations to update UI
      window.location.reload();
    } catch (error) {
      console.error('Fehler beim Anheften:', error);
    }
  };

  const handleReportUser = () => {
    if (!contextMenu.conversationId) return;

    const conversation = conversations.find(c => c.id === contextMenu.conversationId);
    console.log('Benutzer melden:', conversation?.otherUserName);
    setContextMenu({ visible: false, x: 0, y: 0, conversationId: null });
    // TODO: Implement user reporting logic
  };

  const handleBlockUser = () => {
    if (!contextMenu.conversationId) return;

    const conversation = conversations.find(c => c.id === contextMenu.conversationId);
    console.log('Benutzer blockieren:', conversation?.otherUserName);
    setContextMenu({ visible: false, x: 0, y: 0, conversationId: null });
    // TODO: Implement user blocking logic
  };

  const handleDeleteConversation = async () => {
    if (!contextMenu.conversationId) return;

    const conversation = conversations.find(c => c.id === contextMenu.conversationId);
    const confirmed = window.confirm(`Möchtest du den Chat mit ${conversation?.otherUserName} wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`);
    if (!confirmed) return;

    try {
      await chatService.deleteConversation(contextMenu.conversationId);
      console.log('Chat gelöscht:', contextMenu.conversationId);
      setContextMenu({ visible: false, x: 0, y: 0, conversationId: null });
      // Refresh conversations to update UI
      window.location.reload();
    } catch (error) {
      console.error('Fehler beim Löschen des Chats:', error);
      alert('Fehler beim Löschen des Chats');
    }
  };

  // Count conversations per tab
  const unreadCount = conversations.filter(conv => conv.unreadCount > 0).length;
  const favoritesCount = conversations.filter(conv => favoriteIds.has(conv.id)).length;

  return (
    <div className="w-full md:w-80 border-l border-r border-default bg-page-primary h-full overflow-y-auto flex flex-col">
      {/* Sticky Header Container - combines Header, Search, and Tabs */}
      <div className="sticky top-0 z-10 bg-page-primary backdrop-blur-sm bg-page-primary/95 border-b border-default">
        {/* Header */}
        <div className="px-4 pt-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-heading">Nachrichten</h1>
          <button
            onClick={onNewConversation}
            className="link-primary cursor-pointer"
            title="Neue Nachricht"
          >
            <SquarePen className="w-5 h-5" />
          </button>
        </div>

        {/* Search Field */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Chats durchsuchen..."
              className="w-full pl-10 pr-10 py-2 bg-transparent border border-default rounded-lg text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            {searchTerm.length > 0 && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-page-secondary transition-colors cursor-pointer"
                aria-label="Suche löschen"
              >
                <X className="w-4 h-4 text-muted hover:text-heading transition-colors" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 pb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`btn-base ${
                activeTab === 'all'
                  ? 'btn-primary'
                  : 'btn-secondary'
              } !font-normal !py-2 !px-4 !border-0 text-sm cursor-pointer`}
              style={activeTab !== 'all' ? { backgroundColor: 'var(--background-secondary)', color: 'var(--text-secondary)' } : undefined}
            >
              Alle
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`btn-base ${
                activeTab === 'unread'
                  ? 'btn-primary'
                  : 'btn-secondary'
              } !font-normal !py-2 !px-4 !border-0 text-sm cursor-pointer`}
              style={activeTab !== 'unread' ? { backgroundColor: 'var(--background-secondary)', color: 'var(--text-secondary)' } : undefined}
            >
              Ungelesen
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`btn-base ${
                activeTab === 'favorites'
                  ? 'btn-primary'
                  : 'btn-secondary'
              } !font-normal !py-2 !px-4 !border-0 text-sm cursor-pointer`}
              style={activeTab !== 'favorites' ? { backgroundColor: 'var(--background-secondary)', color: 'var(--text-secondary)' } : undefined}
            >
              Favoriten
            </button>
          </div>
        </div>
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
              className="px-6 py-3 bg-action-primary text-button-primary rounded-full hover:bg-action-primary-hover transition-all duration-200 font-semibold hover:shadow-lg hover:shadow-primary/20 hover:scale-105 active:scale-95 cursor-pointer"
            >
              Erste Konversation starten
            </button>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-8 text-center">
            {searchTerm ? (
              <>
                <Search className="w-12 h-12 mx-auto mb-3 text-muted opacity-50" />
                <p className="text-muted">Keine Chats gefunden</p>
                <p className="text-muted text-sm mt-2">Versuche einen anderen Suchbegriff</p>
              </>
            ) : activeTab === 'unread' ? (
              <>
                <svg className="w-12 h-12 mx-auto mb-3 text-muted opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-muted">Keine ungelesenen Chats</p>
                <p className="text-muted text-sm mt-2">Alle Nachrichten wurden gelesen</p>
              </>
            ) : activeTab === 'favorites' ? (
              <>
                <Star className="w-12 h-12 mx-auto mb-3 text-muted opacity-50" />
                <p className="text-muted">Keine Favoriten</p>
                <p className="text-muted text-sm mt-2">Markiere Chats mit dem Stern als Favoriten</p>
              </>
            ) : null}
          </div>
        ) : (
          <div>
            {filteredConversations.map((conv, index) => (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                onContextMenu={(e) => handleContextMenu(e, conv.id)}
                className={`px-4 py-3 cursor-pointer transition-all duration-200 relative hover:bg-page-secondary ${
                  selectedId === conv.id
                    ? 'bg-page-secondary'
                    : ''
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <ProfileAvatar
                      profilePicture={conv.otherUserProfilePicture}
                      role={conv.otherUserRole}
                      username={conv.otherUserName}
                      size="md"
                      className="shadow-md"
                    />
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
                      <span className="text-xs text-muted">
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

      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          ref={contextMenuRef}
          className="fixed w-64 bg-page-secondary border border-default rounded-lg shadow-lg overflow-hidden z-50"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
        >
          <button
            onClick={handleMarkAsUnread}
            className="w-full px-4 py-3 text-left hover:bg-page-primary transition-all flex items-center gap-3 text-body cursor-pointer"
          >
            <MailOpen className="w-5 h-5" />
            <span>Als ungelesen markieren</span>
          </button>
          <button
            onClick={handleTogglePin}
            className="w-full px-4 py-3 text-left hover:bg-page-primary transition-all flex items-center gap-3 text-body cursor-pointer"
          >
            <Pin className={`w-5 h-5 ${conversations.find(c => c.id === contextMenu.conversationId)?.isPinned ? 'fill-current' : ''}`} />
            <span>{conversations.find(c => c.id === contextMenu.conversationId)?.isPinned ? 'Chat loslösen' : 'Chat anheften'}</span>
          </button>
          <div className="border-t border-default my-1"></div>
          <button
            onClick={handleReportUser}
            className="w-full px-4 py-3 text-left hover:bg-page-primary transition-all flex items-center gap-3 text-body cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Benutzer melden</span>
          </button>
          <button
            onClick={handleBlockUser}
            className="w-full px-4 py-3 text-left hover:bg-page-primary transition-all flex items-center gap-3 text-body cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            <span>Benutzer blockieren</span>
          </button>
          <div className="border-t border-default my-1"></div>
          <button
            onClick={handleDeleteConversation}
            className="w-full px-4 py-3 text-left hover:bg-page-primary transition-all flex items-center gap-3 text-error cursor-pointer"
          >
            <Trash2 className="w-5 h-5" />
            <span>Chat löschen</span>
          </button>
        </div>
      )}
    </div>
  );
};