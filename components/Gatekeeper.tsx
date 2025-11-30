import React, { useState } from 'react';
import { SYSTEM_START_PASSWORD } from '../constants';

interface Props {
  onSuccess: () => void;
}

const Gatekeeper: React.FC<Props> = ({ onSuccess }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === SYSTEM_START_PASSWORD) {
      onSuccess();
    } else {
      setError(true);
      setInput('');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-green-500 font-mono">
      <div className="w-full max-w-md p-8 border border-green-800 rounded bg-gray-900 shadow-[0_0_20px_rgba(0,255,0,0.2)]">
        <h1 className="text-2xl mb-6 text-center glitch-effect">系統存取</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-2">存取代碼</label>
            <input
              type="password"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full bg-black border border-green-700 p-3 text-green-400 focus:outline-none focus:border-green-400 placeholder-green-900"
              placeholder="輸入代碼"
              autoFocus
            />
          </div>
          {error && <p className="text-red-500 text-xs text-center">拒絕存取</p>}
          <button
            type="submit"
            className="w-full bg-green-900 hover:bg-green-800 text-black font-bold py-3 px-4 rounded border border-green-600 transition-colors"
          >
            初始化
          </button>
        </form>
      </div>
    </div>
  );
};

export default Gatekeeper;