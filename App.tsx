import React, { useState, useEffect } from 'react';
import Gatekeeper from './components/Gatekeeper';
import { StorageService } from './services/storage';
import { User, UserRole } from './types';
import AdminPanel from './components/AdminPanel';
import AIChat from './components/AIChat';

// Components defined inline to share state easily in this single-file architecture approach 
// where complex context providers might be overkill for the requested XML structure.

const Login = ({ onLogin }: { onLogin: (u: User) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const users = StorageService.getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      // Fetch IP (mocked here, but shows intent)
      let ip = '127.0.0.1';
      let location = 'Localhost';
      try {
        const res = await fetch('https://ipapi.co/json/');
        if(res.ok) {
           const data = await res.json();
           ip = data.ip;
           location = `${data.city}, ${data.country_name}`;
        }
      } catch (e) { /* ignore in dev */ }

      const updatedUser = { ...user, isOnline: true, lastIp: ip, location };
      StorageService.updateUser(updatedUser);
      onLogin(updatedUser);
    } else {
      setError('憑證無效');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 p-8 rounded shadow-lg w-full max-w-sm border border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-white text-center">安全登入</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-green-500 outline-none"
            placeholder="帳號"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <input
            className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600 focus:border-green-500 outline-none"
            placeholder="密碼"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button className="w-full bg-green-700 hover:bg-green-600 text-white p-3 rounded font-bold transition">
            進入
          </button>
        </form>
      </div>
    </div>
  );
};

const UserChat = ({ currentUser, targetUser }: { currentUser: User, targetUser: User }) => {
  const [msgText, setMsgText] = useState('');
  const [history, setHistory] = useState(StorageService.getMessages(currentUser.id, targetUser.id));

  // Simple polling to simulate real-time for demo without WebSocket
  useEffect(() => {
    const interval = setInterval(() => {
      setHistory(StorageService.getMessages(currentUser.id, targetUser.id));
    }, 1000);
    return () => clearInterval(interval);
  }, [currentUser.id, targetUser.id]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgText.trim()) return;
    StorageService.addMessage({
      id: crypto.randomUUID(),
      senderId: currentUser.id,
      receiverId: targetUser.id,
      content: msgText,
      timestamp: Date.now()
    });
    setMsgText('');
    setHistory(StorageService.getMessages(currentUser.id, targetUser.id));
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
       <div className="flex justify-between items-center p-4 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center gap-2">
            <span className="material-icons text-gray-400">person</span>
            <h3 className="font-bold text-white">{targetUser.username}</h3>
        </div>
        <div className="flex gap-2">
             <button className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 text-white" title="語音通話">
                 <span className="material-icons text-sm">call</span>
             </button>
             <button className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 text-white" title="視訊通話">
                 <span className="material-icons text-sm">videocam</span>
             </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {history.map(m => (
          <div key={m.id} className={`flex ${m.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
            <span className={`px-4 py-2 rounded-lg max-w-xs break-words ${m.senderId === currentUser.id ? 'bg-blue-700 text-white' : 'bg-gray-700 text-gray-200'}`}>
              {m.content}
            </span>
          </div>
        ))}
      </div>
      <form onSubmit={send} className="p-4 bg-gray-800 border-t border-gray-700 flex gap-2">
        <input 
          value={msgText} 
          onChange={e => setMsgText(e.target.value)}
          className="flex-1 bg-gray-900 border border-gray-600 rounded-full px-4 py-2 text-white focus:outline-none"
          placeholder="輸入訊息..."
        />
        <button type="submit" className="text-blue-500 hover:text-blue-400 font-bold p-2">傳送</button>
      </form>
    </div>
  );
}

// Main Dashboard
const Dashboard = ({ user, onLogout }: { user: User, onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'ai' | string>('ai'); // 'users' (friends), 'ai', or userId
  const [friends, setFriends] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    // Refresh lists
    setFriends(StorageService.getFriends(user.id));
    setAllUsers(StorageService.getUsers().filter(u => u.id !== user.id));
  }, [user]);

  const handleAddFriend = (targetId: string) => {
    StorageService.sendFriendRequest(user.id, targetId);
    alert('已發送好友請求！');
  };

  const handleSelfUpdate = (newPass: string) => {
    StorageService.updateUser({ ...user, password: newPass });
    alert('密碼已更新');
  };

  return (
    <div className="flex h-screen bg-black text-gray-200 font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700">
           <div className="flex items-center gap-2 mb-2">
             <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center font-bold text-black">
               {user.username[0].toUpperCase()}
             </div>
             <div>
               <p className="font-bold text-white">{user.username}</p>
               <p className="text-xs text-green-400">線上</p>
             </div>
           </div>
           {user.role === 'ADMIN' && (
             <button 
                onClick={() => setActiveTab('admin')} 
                className="w-full text-xs bg-red-900 hover:bg-red-800 text-red-200 py-1 rounded mb-2"
             >
               管理員面板
             </button>
           )}
           <button onClick={() => {
              const p = prompt("新密碼：");
              if(p) handleSelfUpdate(p);
           }} className="text-xs text-gray-500 hover:text-gray-300 underline">更改密碼</button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
            <div 
              onClick={() => setActiveTab('ai')}
              className={`p-3 rounded cursor-pointer mb-2 flex items-center gap-2 ${activeTab === 'ai' ? 'bg-gray-800 border border-blue-500' : 'hover:bg-gray-800'}`}
            >
              <span className="material-icons text-blue-400">smart_toy</span>
              <span>Gemini AI</span>
            </div>

            <div className="text-xs text-gray-500 font-bold uppercase mt-4 mb-2 px-2">好友</div>
            {friends.map(f => (
              <div 
                key={f.id}
                onClick={() => setActiveTab(f.id)}
                className={`p-3 rounded cursor-pointer mb-1 flex items-center gap-2 ${activeTab === f.id ? 'bg-gray-800 border-l-2 border-green-500' : 'hover:bg-gray-800'}`}
              >
                <span className="material-icons text-gray-400 text-sm">person</span>
                <span>{f.username}</span>
                {f.isOnline && <span className="w-2 h-2 rounded-full bg-green-500 ml-auto"></span>}
              </div>
            ))}

            <div className="text-xs text-gray-500 font-bold uppercase mt-6 mb-2 px-2">尋找使用者</div>
            {allUsers.filter(u => !friends.find(f => f.id === u.id)).map(u => (
               <div key={u.id} className="p-2 flex justify-between items-center text-sm hover:bg-gray-800 rounded">
                  <span>{u.username}</span>
                  <button onClick={() => handleAddFriend(u.id)} className="text-green-500 hover:text-green-400 text-xs">
                    + 新增
                  </button>
               </div>
            ))}
        </div>

        <div className="p-4 border-t border-gray-700">
           <button onClick={onLogout} className="flex items-center gap-2 text-gray-400 hover:text-white transition">
             <span className="material-icons">logout</span>
             登出
           </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {activeTab === 'ai' ? (
          <AIChat currentUser={user} />
        ) : activeTab === 'admin' && user.role === 'ADMIN' ? (
          <AdminPanel currentUser={user} />
        ) : friends.find(f => f.id === activeTab) ? (
          <UserChat currentUser={user} targetUser={friends.find(f => f.id === activeTab)!} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 flex-col">
            <span className="material-icons text-6xl mb-4 opacity-20">lock</span>
            <p>選擇一個安全頻道以開始。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [step, setStep] = useState<'gate' | 'login' | 'dashboard'>('gate');
  const [user, setUser] = useState<User | null>(null);

  const handleGateSuccess = () => setStep('login');
  
  const handleLogin = (u: User) => {
    setUser(u);
    setStep('dashboard');
  };

  const handleLogout = () => {
    if (user) {
      StorageService.updateUser({ ...user, isOnline: false });
    }
    setUser(null);
    setStep('login');
  };

  return (
    <>
      {step === 'gate' && <Gatekeeper onSuccess={handleGateSuccess} />}
      {step === 'login' && <Login onLogin={handleLogin} />}
      {step === 'dashboard' && user && <Dashboard user={user} onLogout={handleLogout} />}
    </>
  );
}