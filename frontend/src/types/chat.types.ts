export interface User {
  id: string;
  email: string;
  username?: string;
  profilePicture?: string;
}

export interface Message {
  id: string;
  content: string;
  sender: User;
  createdAt: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  user1: User;
  user2: User;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  lastMessage?: Message;
  unreadCount?: number;
}