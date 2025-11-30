import React, { useState, useEffect, useRef } from 'react';
import { User, Message } from '../types';
import { createChatSession, generateStream } from '../services/geminiService';
import { Chat } from '@google/genai';
import ReactMarkdown from 'react-markdown';

interface Props {
  currentUser: User;
}

const AIChat: React.FC<Props> = ({ currentUser }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Init session
    chatSessionRef.current = createChatSession();
    // Add welcome message
    setMessages([{
      id: 'welcome',
      senderId: 'AI',
      receiverId: currentUser.id,
      content: `你好 ${currentUser.username}。我是由 Gemini 3.0 Pro 驅動的安全 AI 助理。今天有什麼可以幫你的嗎？`,
      timestamp: Date.now()
    }]);
  }, [currentUser]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !chatSessionRef.current || isLoading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      senderId: currentUser.id,
      receiverId: 'AI',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const aiMsgId = crypto.randomUUID();
      // Placeholder for streaming
      setMessages(prev => [...prev, {
        id: aiMsgId,
        senderId: 'AI',
        receiverId: currentUser.id,
        content: '',
        timestamp: Date.now()
      }]);

      let fullText = '';
      
      const stream = generateStream(chatSessionRef.current, userMsg.content);
      
      for await (const chunk of stream) {
        fullText += chunk;
        setMessages(prev => prev.map(m => 
          m.id === aiMsgId ? { ...m, content: fullText } : m
        ));
      }

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        senderId: 'AI',
        receiverId: currentUser.id,
        content: "系統錯誤：與 AI 的連線中斷。",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="flex items-center p-4 border-b border-gray-700 bg-gray-800">
        <span className="material-icons text-blue-400 mr-2">auto_awesome</span>
        <h3 className="font-bold text-white">Gemini 3.0 Pro</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-3 ${
                isMe ? 'bg-green-700 text-white' : 'bg-gray-700 text-gray-200'
              }`}>
                {isMe ? (
                   <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                   <div className="prose prose-invert prose-sm max-w-none">
                     <ReactMarkdown>{msg.content}</ReactMarkdown>
                   </div>
                )}
                <span className="text-[10px] opacity-50 block text-right mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-gray-700 text-gray-200 rounded-lg p-3 flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
             </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-gray-800 border-t border-gray-700 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="詢問 Gemini..."
          className="flex-1 bg-gray-900 border border-gray-600 rounded-full px-4 py-2 text-white focus:outline-none focus:border-blue-500"
        />
        <button 
          type="submit" 
          disabled={isLoading || !input.trim()}
          className="p-2 bg-blue-600 hover:bg-blue-500 rounded-full text-white disabled:opacity-50 transition-colors"
        >
          <span className="material-icons">send</span>
        </button>
      </form>
    </div>
  );
};

export default AIChat;