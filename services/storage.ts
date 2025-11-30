import { STORAGE_KEY, INITIAL_DATA } from '../constants';
import { User, Message, FriendRequest } from '../types';

/**
 * In a real Cloudflare Pages app with KV, these functions would fetch() 
 * from your Worker functions (e.g., /api/users, /api/login).
 * Here we mock it with LocalStorage.
 */

interface DB {
  users: User[];
  messages: Message[];
  friendRequests: FriendRequest[];
}

const loadDB = (): DB => {
  const str = localStorage.getItem(STORAGE_KEY);
  if (!str) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
    return INITIAL_DATA as any;
  }
  return JSON.parse(str);
};

const saveDB = (db: DB) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

export const StorageService = {
  getUsers: (): User[] => {
    return loadDB().users;
  },

  updateUser: (updatedUser: User) => {
    const db = loadDB();
    const idx = db.users.findIndex(u => u.id === updatedUser.id);
    if (idx !== -1) {
      db.users[idx] = updatedUser;
      saveDB(db);
    }
  },

  addUser: (user: User) => {
    const db = loadDB();
    if (db.users.find(u => u.username === user.username)) {
      throw new Error("Username taken");
    }
    db.users.push(user);
    saveDB(db);
  },

  deleteUser: (userId: string) => {
    const db = loadDB();
    db.users = db.users.filter(u => u.id !== userId);
    saveDB(db);
  },

  // Messages
  getMessages: (userId: string, contactId: string): Message[] => {
    const db = loadDB();
    return db.messages.filter(m => 
      (m.senderId === userId && m.receiverId === contactId) ||
      (m.senderId === contactId && m.receiverId === userId)
    ).sort((a, b) => a.timestamp - b.timestamp);
  },

  addMessage: (msg: Message) => {
    const db = loadDB();
    db.messages.push(msg);
    saveDB(db);
  },

  // Friends
  sendFriendRequest: (fromId: string, toId: string) => {
    const db = loadDB();
    if (db.friendRequests.find(r => r.fromUserId === fromId && r.toUserId === toId)) return;
    
    db.friendRequests.push({
      id: crypto.randomUUID(),
      fromUserId: fromId,
      toUserId: toId,
      status: 'pending'
    });
    saveDB(db);
  },

  getFriendRequests: (userId: string) => {
    const db = loadDB();
    return db.friendRequests.filter(r => r.toUserId === userId && r.status === 'pending');
  },

  acceptFriendRequest: (requestId: string) => {
    const db = loadDB();
    const req = db.friendRequests.find(r => r.id === requestId);
    if (req) {
      req.status = 'accepted';
      saveDB(db);
    }
  },
  
  getFriends: (userId: string): User[] => {
    const db = loadDB();
    // Logic: Users are friends if they have an accepted request OR if one is admin (default friend)
    const adminUser = db.users.find(u => u.role === 'ADMIN');
    
    // Find all accepted relationship IDs
    const relationships = db.friendRequests
      .filter(r => r.status === 'accepted' && (r.fromUserId === userId || r.toUserId === userId));
    
    const friendIds = relationships.map(r => r.fromUserId === userId ? r.toUserId : r.fromUserId);
    
    // Admin is always a friend unless you are the admin
    if (adminUser && userId !== adminUser.id && !friendIds.includes(adminUser.id)) {
      friendIds.push(adminUser.id);
    }

    return db.users.filter(u => friendIds.includes(u.id));
  }
};