'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Image, Smile, MoreVertical, Send, Search, ChevronUp, ChevronDown, X, Pin, MailOpen, Trash2 } from 'lucide-react';
import { chatService } from '@/services/chatService';
import { useChatStore } from '@/store/chatStore';
import ProfileAvatar from '@/components/ProfileAvatar';
import { Conversation } from '@/types/chat.types';
import { ProfilePreviewModal } from './ProfilePreviewModal';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
}

interface ChatWindowProps {
  conversationId: string | null;
  currentUserId: string;
}

interface LoadMessagesResponse {
  success: boolean;
  messages: Array<{
    id: string;
    senderId: string;
    content: string;
    createdAt: string;
  }>;
}

interface IncomingMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ conversationId, currentUserId }) => {
  const { socket, isConnected } = useSocket();
  const { markConversationAsRead } = useChatStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [isPinned, setIsPinned] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Load conversation details to get other user's name
  useEffect(() => {
    if (!conversationId) return;

    const loadConversation = async () => {
      try {
        // Get JWT token from localStorage
        const storedAuth = localStorage.getItem('aurora-auth-storage');
        let token = '';
        if (storedAuth) {
          try {
            const parsedAuth = JSON.parse(storedAuth);
            token = parsedAuth.state?.token || '';
          } catch (e) {
            console.error('Error parsing auth:', e);
          }
        }

        const response = await fetch('http://localhost:4000/chat/conversations', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include',
        });

        if (response.ok) {
          const conversations = await response.json();
          const currentConv = conversations.find((c: Conversation) => c.id === conversationId);
          if (currentConv) {
            setConversation(currentConv);
            setIsPinned(currentConv.isPinned || false);
          }
        }
      } catch (error) {
        console.error('Error loading conversation details:', error);
      }
    };

    loadConversation();
  }, [conversationId]);

  useEffect(() => {
    if (!socket || !conversationId) return;

    setIsLoading(true);
    console.log('📂 Lade Nachrichten für Konversation:', conversationId);

    socket.emit('loadMessages', { conversationId }, (response: LoadMessagesResponse) => {
      if (response?.success && response.messages) {
        const loadedMessages = response.messages.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.createdAt),
        }));
        setMessages(loadedMessages);
        console.log('✅ Nachrichten geladen:', loadedMessages.length);
      }
      setIsLoading(false);
    });
  }, [socket, conversationId]);

  // Mark conversation as read when opened
  useEffect(() => {
    if (!conversationId) return;

    const markAsRead = async () => {
      try {
        await chatService.markAsRead(conversationId);
        markConversationAsRead(conversationId);
        console.log('✓ Conversation marked as read:', conversationId);
      } catch (error) {
        console.error('Error marking conversation as read:', error);
      }
    };

    markAsRead();
  }, [conversationId, markConversationAsRead]);

  useEffect(() => {
    if (!socket || !conversationId) return;

    const eventName = `message:${conversationId}`;

    const handleMessage = (message: IncomingMessage) => {
      console.log('📥 Neue Nachricht empfangen:', message);
      
      setMessages((prev) => {
        const exists = prev.some(m => m.id === message.id);
        if (exists) return prev;
        
        return [...prev, {
          ...message,
          timestamp: new Date(message.timestamp),
        }];
      });
    };

    socket.on(eventName, handleMessage);

    return () => {
      socket.off(eventName, handleMessage);
    };
  }, [socket, conversationId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
        setShowOptionsMenu(false);
      }
    };

    if (showOptionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOptionsMenu]);

  // Search functionality
  const matchingMessages = messages.filter(msg =>
    searchTerm.trim() && msg.content.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const handleSearchToggle = () => {
    setSearchOpen(!searchOpen);
    if (!searchOpen) {
      // Opening search
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      // Closing search
      setSearchTerm('');
      setCurrentMatchIndex(0);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentMatchIndex(0);
  };

  const handleClearSearchInput = () => {
    setSearchTerm('');
    setCurrentMatchIndex(0);
    searchInputRef.current?.focus();
  };

  const handleNextMatch = () => {
    if (matchingMessages.length === 0) return;
    const nextIndex = (currentMatchIndex + 1) % matchingMessages.length;
    setCurrentMatchIndex(nextIndex);
    scrollToMatch(nextIndex);
  };

  const handlePreviousMatch = () => {
    if (matchingMessages.length === 0) return;
    const prevIndex = currentMatchIndex === 0 ? matchingMessages.length - 1 : currentMatchIndex - 1;
    setCurrentMatchIndex(prevIndex);
    scrollToMatch(prevIndex);
  };

  const scrollToMatch = (index: number) => {
    const message = matchingMessages[index];
    if (message) {
      const element = messageRefs.current.get(message.id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Auto-scroll to first match when search term changes
  useEffect(() => {
    if (matchingMessages.length > 0 && searchTerm) {
      scrollToMatch(0);
    }
  }, [searchTerm]);

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;

    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={index} className="bg-yellow-400 text-black rounded px-0.5">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || !conversationId || !socket) return;

    const messageData = {
      conversationId,
      senderId: currentUserId,
      content: inputValue,
    };

    console.log('📤 Sende Nachricht:', messageData);
    socket.emit('sendMessage', messageData);

    setInputValue('');
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setInputValue(prev => prev + emojiData.emoji);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // TODO: Implement file upload logic
      console.log('Dateien ausgewählt:', files);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleMarkAsUnread = async () => {
    if (!conversationId) return;

    try {
      await chatService.markAsUnread(conversationId);
      console.log('Chat als ungelesen markiert:', conversationId);
      setShowOptionsMenu(false);
      // Optional: Update UI to reflect unread status
    } catch (error) {
      console.error('Fehler beim Markieren als ungelesen:', error);
    }
  };

  const handleTogglePin = async () => {
    if (!conversationId) return;

    try {
      const result = await chatService.togglePin(conversationId);
      setIsPinned(result.isPinned);
      console.log('Chat anheften geändert:', result.isPinned);
      setShowOptionsMenu(false);
    } catch (error) {
      console.error('Fehler beim Anheften:', error);
    }
  };

  const handleReportUser = () => {
    // TODO: Implement user reporting logic
    console.log('Benutzer melden:', conversation?.otherUserName);
    setShowOptionsMenu(false);
    // Here you would typically open a report modal or send a report request
  };

  const handleBlockUser = () => {
    // TODO: Implement user blocking logic
    console.log('Benutzer blockieren:', conversation?.otherUserName);
    setShowOptionsMenu(false);
    // Here you would typically show a confirmation dialog and then block the user
  };

  const handleDeleteConversation = async () => {
    if (!conversationId) return;

    const confirmed = window.confirm('Möchtest du diesen Chat wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.');
    if (!confirmed) return;

    try {
      await chatService.deleteConversation(conversationId);
      console.log('Chat gelöscht:', conversationId);
      setShowOptionsMenu(false);
      // Redirect to chat overview or clear selection
      window.location.href = '/chat';
    } catch (error) {
      console.error('Fehler beim Löschen des Chats:', error);
      alert('Fehler beim Löschen des Chats');
    }
  };

  if (!conversationId) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-page-primary">
        <div className="text-center px-4">
          <svg className="w-20 h-20 mx-auto mb-4 text-muted opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <p className="text-muted text-lg">Wähle eine Konversation aus</p>
          <p className="text-muted text-sm mt-2 opacity-75">oder starte eine neue Unterhaltung</p>
        </div>
      </div>
    );
  }

  const getOnlineStatus = () => {
    if (!conversation) return '';

    if (conversation.otherUserIsOnline) {
      return 'Online';
    }

    if (conversation.otherUserLastSeen) {
      const lastSeenDate = new Date(conversation.otherUserLastSeen);
      return `zuletzt online ${formatDistanceToNow(lastSeenDate, { addSuffix: true, locale: de })}`;
    }

    return 'Offline';
  };

  return (
    <div className="grid h-full bg-page-primary w-full border-r border-default" style={{ gridTemplateRows: 'auto 1fr auto' }}>
      {/* Header + Search Bar Container */}
      <div>
        {/* Header mit Profilbild und Status */}
        <div className="p-4 border-b border-default bg-page-primary">
          <div className="flex items-center gap-3">
            {/* Profilbild */}
            <div
              className="relative flex-shrink-0 cursor-pointer"
              onClick={() => setIsProfileModalOpen(true)}
              title="Profil anzeigen"
            >
              <ProfileAvatar
                profilePicture={conversation?.otherUserProfilePicture}
                role={conversation?.otherUserRole}
                username={conversation?.otherUserName}
                size="md"
              />
              {/* Online-Indikator */}
              {conversation?.otherUserIsOnline && (
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-success border-2 border-page-primary rounded-full"></span>
              )}
            </div>

            {/* Name und Status */}
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg text-heading truncate">
                {conversation ? conversation.otherUserName : 'Chat wird geladen...'}
              </h2>
              <p className="text-xs text-muted">
                {getOnlineStatus()}
              </p>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearchToggle}
              className="p-2 text-muted hover:text-heading hover:bg-page-secondary rounded-full transition-all cursor-pointer"
              title="In Chat suchen"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Options Menu */}
            <div className="relative" ref={optionsMenuRef}>
              <button
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                className="p-2 text-muted hover:text-heading hover:bg-page-secondary rounded-full transition-all cursor-pointer"
                title="Optionen"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {/* Dropdown Menu */}
              {showOptionsMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-page-secondary border border-default rounded-lg shadow-lg overflow-hidden z-10">
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
                    <Pin className={`w-5 h-5 ${isPinned ? 'fill-current' : ''}`} />
                    <span>{isPinned ? 'Chat loslösen' : 'Chat anheften'}</span>
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
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="px-4 py-3 border-b border-default bg-page-primary">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Nachrichten durchsuchen..."
                  className="w-full pl-10 pr-10 py-2 bg-page-primary border border-default rounded-lg text-body placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={handleClearSearchInput}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-page-secondary transition-colors cursor-pointer"
                    aria-label="Suche löschen"
                  >
                    <X className="w-4 h-4 text-muted hover:text-heading transition-colors" />
                  </button>
                )}
              </div>

              {/* Match counter and navigation */}
              {searchTerm && (
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted whitespace-nowrap px-2">
                    {matchingMessages.length > 0
                      ? `${currentMatchIndex + 1} von ${matchingMessages.length}`
                      : 'Keine Treffer'}
                  </span>
                  <button
                    onClick={handlePreviousMatch}
                    disabled={matchingMessages.length === 0}
                    className="p-2 text-muted hover:text-heading hover:bg-page-secondary rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title="Vorheriger Treffer"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextMatch}
                    disabled={matchingMessages.length === 0}
                    className="p-2 text-muted hover:text-heading hover:bg-page-secondary rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title="Nächster Treffer"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Done button */}
              <button
                onClick={handleSearchToggle}
                className="px-4 py-2 text-sm font-medium text-primary hover:text-primary-hover transition-colors cursor-pointer"
              >
                Fertig
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Messages Area - Nimmt den verbleibenden Platz ein */}
      <div className="overflow-y-auto p-4 space-y-3 bg-page-primary scrollbar-hide" style={{ minHeight: 0 }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
              <p className="text-muted">Lade Nachrichten...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-3 text-muted opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-muted">Noch keine Nachrichten</p>
              <p className="text-muted text-sm mt-1 opacity-75">Schreibe die erste Nachricht</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                ref={(el) => {
                  if (el) {
                    messageRefs.current.set(msg.id, el);
                  } else {
                    messageRefs.current.delete(msg.id);
                  }
                }}
                className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-full md:max-w-[85%] px-4 py-2.5 rounded-2xl shadow-sm ${
                    msg.senderId === currentUserId
                      ? 'bg-action-primary text-button-primary rounded-br-md'
                      : 'bg-page-secondary text-body rounded-bl-md border border-default'
                  }`}
                >
                  <p className="break-words">
                    {searchTerm ? highlightText(msg.content, searchTerm) : msg.content}
                  </p>
                  <span className="text-xs opacity-70 block mt-1">
                    {msg.timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-default bg-page-primary relative">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex gap-2 items-center">
          {/* Attachment Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={!isConnected || isLoading}
            className="p-2.5 text-muted hover:text-primary hover:bg-page-secondary rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title="Fotos oder Videos anhängen"
          >
            <Image className="w-5 h-5" />
          </button>

          {/* Input Field with Emoji Button inside */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Nachricht eingeben..."
              disabled={!isConnected || isLoading}
              className="w-full pl-4 pr-11 py-3 border border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed bg-page-secondary text-body placeholder:text-muted transition-all"
            />

            {/* Emoji Button - positioned inside input field on the right */}
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              disabled={!isConnected || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-muted hover:text-primary hover:bg-page-primary rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              title="Emoji einfügen"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>

          {/* Send Button - Only visible when there's text */}
          {inputValue.trim() && (
            <button
              onClick={handleSendMessage}
              disabled={!isConnected || isLoading}
              className="btn-primary p-2.5 rounded-full cursor-pointer"
              title="Senden"
            >
              <Send className="w-5 h-5 rotate-45" />
            </button>
          )}
        </div>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div ref={emojiPickerRef} className="absolute bottom-20 right-4 z-50 shadow-lg">
            <style jsx global>{`
              .EmojiPickerReact {
                background-color: var(--background-secondary) !important;
                border: 1px solid var(--border) !important;
              }
              .EmojiPickerReact .epr-search-container input {
                background-color: var(--background-primary) !important;
                border: 1px solid var(--border) !important;
                color: var(--text-body) !important;
              }
              .EmojiPickerReact .epr-category-nav button {
                color: var(--text-muted) !important;
              }
              .EmojiPickerReact .epr-category-nav button.epr-cat-btn.epr-active {
                color: var(--text-primary) !important;
              }
              .EmojiPickerReact .epr-emoji-category-label {
                background-color: var(--background-secondary) !important;
                color: var(--text-heading) !important;
              }
              .EmojiPickerReact .epr-emoji-img:hover,
              .EmojiPickerReact button.epr-btn:hover {
                background-color: transparent !important;
              }
            `}</style>
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              width={350}
              height={400}
              searchPlaceholder="Emoji suchen..."
              previewConfig={{ showPreview: false }}
            />
          </div>
        )}
      </div>

      {/* Profile Preview Modal */}
      {conversation && (
        <ProfilePreviewModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          userId={conversation.otherUserId}
          username={conversation.otherUserName}
          profilePicture={conversation.otherUserProfilePicture}
          role={conversation.otherUserRole}
        />
      )}
    </div>
  );
};