import axios from 'axios';
import { Conversation, Message } from '@/types/chat.types';

const API_URL = 'http://localhost:4000';

// Axios-Instanz mit Auth-Token
const apiClient = axios.create({
  baseURL: API_URL,
});

// Interceptor für Auth-Token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
};