import { create } from 'zustand';
import { Conversation, Message } from '@/types/chat.types';

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Record<string, Message[]>;
  totalUnreadCount: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setConversations: (conversations: Conversation[]) => void;
  setActiveConversation: (conversationId: string | null) => void;
  addConversation: (conversation: Conversation) => void;
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
  markConversationAsRead: (conversationId: string) => void;
  setTotalUnreadCount: (count: number) => void;
  updateTotalUnreadCount: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearStore: () => void;
}

// Helper function to deduplicate conversations by otherUserId
const deduplicateConversations = (conversations: Conversation[]): Conversation[] => {
  const dedupMap = new Map<string, Conversation>();
  
  for (const conv of conversations) {
    const existing = dedupMap.get(conv.otherUserId);
    if (!existing || 
        new Date(conv.lastMessageTime || conv.updatedAt) > 
        new Date(existing.lastMessageTime || existing.updatedAt)) {
      dedupMap.set(conv.otherUserId, conv);
    }
  }
  
  return Array.from(dedupMap.values()).sort((a, b) => {
    // Sort pinned conversations first, then by last message time
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }
    const timeA = new Date(a.lastMessageTime || a.updatedAt).getTime();
    const timeB = new Date(b.lastMessageTime || b.updatedAt).getTime();
    return timeB - timeA;
  });
};

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  totalUnreadCount: 0,
  isLoading: false,
  error: null,

  setConversations: (conversations) => {
    // Always deduplicate conversations before setting
    const deduplicated = deduplicateConversations(conversations);
    set({ conversations: deduplicated });
  },

  setActiveConversation: (conversationId) =>
    set({ activeConversationId: conversationId }),

  addConversation: (conversation) =>
    set((state) => {
      // Check if conversation with same otherUserId already exists
      const existing = state.conversations.find(c => c.otherUserId === conversation.otherUserId);
      
      if (existing) {
        // Update existing conversation instead of adding duplicate
        const updated = state.conversations.map(conv =>
          conv.otherUserId === conversation.otherUserId ? conversation : conv
        );
        return { conversations: deduplicateConversations(updated) };
      } else {
        // Add new conversation
        const updated = [conversation, ...state.conversations];
        return { conversations: deduplicateConversations(updated) };
      }
    }),

  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: messages,
      },
    })),

  addMessage: (conversationId, message) =>
    set((state) => {
      const existingMessages = state.messages[conversationId] || [];
      
      // Update conversations to reflect new message
      const updatedConversations = state.conversations.map((conv) => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            lastMessage: message.content,
            lastMessageTime: message.createdAt,
            updatedAt: message.createdAt,
          };
        }
        return conv;
      });
      
      return {
        messages: {
          ...state.messages,
          [conversationId]: [...existingMessages, message],
        },
        conversations: deduplicateConversations(updatedConversations),
      };
    }),

  updateMessage: (conversationId, messageId, updates) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: state.messages[conversationId]?.map((msg) =>
          msg.id === messageId ? { ...msg, ...updates } : msg
        ),
      },
    })),

  markConversationAsRead: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      ),
      messages: {
        ...state.messages,
        [conversationId]: state.messages[conversationId]?.map((msg) => ({
          ...msg,
          isRead: true,
        })),
      },
    }));
    // Update total unread count after marking as read
    get().updateTotalUnreadCount();
  },

  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  setTotalUnreadCount: (count) => set({ totalUnreadCount: count }),
  
  updateTotalUnreadCount: () => {
    const state = get();
    // Count unique users with unread messages
    const usersWithUnread = new Set<string>();
    
    state.conversations.forEach(conv => {
      if (conv.unreadCount && conv.unreadCount > 0) {
        usersWithUnread.add(conv.otherUserId);
      }
    });
    
    set({ totalUnreadCount: usersWithUnread.size });
  },

  clearStore: () =>
    set({
      conversations: [],
      activeConversationId: null,
      messages: {},
      totalUnreadCount: 0,
      isLoading: false,
      error: null,
    }),
}));
