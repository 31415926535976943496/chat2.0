export const APP_NAME = "SecureChat AI";
export const SYSTEM_START_PASSWORD = "open"; // The "Gatekeeper" password
export const DEFAULT_ADMIN_USER = "admin";
export const DEFAULT_ADMIN_PASS = "12345";
export const STORAGE_KEY = "KV_DATA_V1"; 

// Initial Mock Data to bootstrap the 'KV'
export const INITIAL_DATA = {
  users: [
    {
      id: 'admin-id',
      username: DEFAULT_ADMIN_USER,
      password: DEFAULT_ADMIN_PASS,
      role: 'ADMIN',
      isOnline: false,
      createdAt: Date.now()
    }
  ],
  messages: [],
  friendRequests: []
};