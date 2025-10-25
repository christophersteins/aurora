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

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  totalUnreadCount: 0,
  isLoading: false,
  error: null,

  setConversations: (conversations) => set({ conversations }),

  setActiveConversation: (conversationId) =>
    set({ activeConversationId: conversationId }),

  addConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    })),

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
      return {
        messages: {
          ...state.messages,
          [conversationId]: [...existingMessages, message],
        },
        conversations: state.conversations.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                lastMessage: message,
                updatedAt: message.createdAt,
              }
            : conv
        ),
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
    const total = state.conversations.reduce(
      (sum, conv) => sum + (conv.unreadCount || 0),
      0
    );
    set({ totalUnreadCount: total });
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