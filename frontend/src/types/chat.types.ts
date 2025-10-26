export interface User {
  id: string;
  email: string;
  username?: string;
  profilePicture?: string;
  role?: string;
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
  otherUserId: string;
  otherUserName: string;
  otherUserProfilePicture?: string | null;
  otherUserRole?: string;
  otherUserIsOnline?: boolean;
  otherUserLastSeen?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  isPinned?: boolean;
  updatedAt: string;
}