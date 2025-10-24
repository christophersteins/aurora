import apiClient from '@/lib/api-client';
import { Conversation, Message } from '@/types/chat.types';

export const chatService = {
  // Alle Conversations abrufen
  getConversations: async (): Promise<Conversation[]> => {
    const response = await apiClient.get('/chat/conversations');
    return response.data;
  },

  // Conversation erstellen oder finden
  createOrGetConversation: async (userId: string): Promise<Conversation> => {
    const response = await apiClient.post('/chat/conversations', { userId });
    return response.data;
  },

  // Messages einer Conversation abrufen
  getMessages: async (conversationId: string): Promise<Message[]> => {
    const response = await apiClient.get(
      `/chat/conversations/${conversationId}/messages`
    );
    return response.data;
  },

  // Conversation als gelesen markieren
  markAsRead: async (conversationId: string): Promise<void> => {
    await apiClient.post(`/chat/conversations/${conversationId}/read`);
  },

  // Get total unread message count
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<{ count: number }>('/chat/unread-count');
    return response.data.count;
  },
};