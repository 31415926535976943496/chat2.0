export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface User {
  id: string;
  username: string;
  password?: string; // stored for mock auth, usually hashed
  role: UserRole;
  isOnline: boolean;
  lastIp?: string;
  location?: string;
  createdAt: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string; // 'AI' for Gemini, or user ID
  content: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface ChatSession {
  id: string;
  participantId: string;
  participantName: string;
  lastMessage?: string;
  unreadCount: number;
  type: 'human' | 'ai';
}