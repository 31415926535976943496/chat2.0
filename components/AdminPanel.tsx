import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { StorageService } from '../services/storage';

interface Props {
  currentUser: User;
}

const AdminPanel: React.FC<Props> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');

  const refreshUsers = () => {
    setUsers(StorageService.getUsers());
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password) return;

    try {
      StorageService.addUser({
        id: crypto.randomUUID(),
        username: newUser.username,
        password: newUser.password,
        role: UserRole.USER,
        isOnline: false,
        createdAt: Date.now(),
        location: 'Unknown',
        lastIp: '0.0.0.0' 
      });
      setMessage(`使用者 ${newUser.username} 已建立。`);
      setNewUser({ username: '', password: '' });
      refreshUsers();
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("確定刪除？")) {
      StorageService.deleteUser(id);
      refreshUsers();
    }
  };

  return (
    <div className="flex-1 bg-gray-800 p-6 overflow-auto">
      <h2 className="text-2xl font-bold mb-6 text-green-400 border-b border-gray-700 pb-2">管理員控制中心</h2>
      
      {/* Create User */}
      <div className="bg-gray-900 p-4 rounded-lg mb-8 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-white">建立新身分</h3>
        <form onSubmit={handleCreateUser} className="flex gap-4 items-end">
          <div>
            <label className="block text-xs text-gray-400 mb-1">使用者名稱</label>
            <input
              type="text"
              value={newUser.username}
              onChange={(e) => setNewUser({...newUser, username: e.target.value})}
              className="bg-gray-800 border border-gray-600 rounded p-2 text-white focus:outline-none focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">密碼</label>
            <input
              type="text" 
              value={newUser.password}
              onChange={(e) => setNewUser({...newUser, password: e.target.value})}
              className="bg-gray-800 border border-gray-600 rounded p-2 text-white focus:outline-none focus:border-green-500"
            />
          </div>
          <button type="submit" className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded font-medium">
            建立
          </button>
        </form>
        {message && <p className="text-green-400 text-sm mt-2">{message}</p>}
      </div>

      {/* User List */}
      <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-gray-950 text-gray-200 uppercase font-medium">
            <tr>
              <th className="px-6 py-3">使用者</th>
              <th className="px-6 py-3">角色</th>
              <th className="px-6 py-3">狀態</th>
              <th className="px-6 py-3">最後 IP / 位置</th>
              <th className="px-6 py-3">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-800/50">
                <td className="px-6 py-4 font-medium text-white">{u.username}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs ${u.role === 'ADMIN' ? 'bg-purple-900 text-purple-200' : 'bg-blue-900 text-blue-200'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {u.isOnline ? (
                    <span className="flex items-center text-green-400 gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> 線上
                    </span>
                  ) : (
                    <span className="text-gray-500">離線</span>
                  )}
                </td>
                <td className="px-6 py-4 font-mono text-xs">
                  <div>IP: {u.lastIp || 'N/A'}</div>
                  <div className="text-gray-500">{u.location || 'Unknown'}</div>
                </td>
                <td className="px-6 py-4">
                  {u.id !== currentUser.id && (
                    <button 
                      onClick={() => handleDelete(u.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      刪除
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;