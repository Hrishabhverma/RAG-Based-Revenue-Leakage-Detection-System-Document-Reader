
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../../types';
import { Loader } from '../ui/Loader';

interface ChatPanelProps {
  history: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

// A simple markdown-to-HTML converter for basic formatting
const renderMarkdown = (text: string) => {
    let html = text
        .replace(/</g, "&lt;").replace(/>/g, "&gt;") // Escape HTML
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\*(.*?)\*/g, '<em>$1</em>')     // Italic
        .replace(/`([^`]+)`/g, '<code class="bg-slate-700 text-cyan-300 rounded px-1 py-0.5 font-mono text-sm">$1</code>') // Inline code
        .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>') // List items
        .replace(/(<li>.*<\/li>)/gs, '<ul class="list-disc list-outside mb-2">$1</ul>') // Wrap lists
        .replace(/\n/g, '<br />');                   // Newlines
    return { __html: html };
};

const Message: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isModel = message.role === 'model';
    return (
        <div className={`flex items-start gap-3 ${isModel ? '' : 'flex-row-reverse'}`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isModel ? 'bg-cyan-800' : 'bg-slate-700'}`}>
                {isModel ? 
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-300"><path d="M12 21v-3.5a2.5 2.5 0 0 1 5 0V21"/><path d="M12 21v-3.5a2.5 2.5 0 0 0-5 0V21"/><path d="M12 17.5V14"/><path d="M7 14h10"/><path d="M14.5 14a2.5 2.5 0 0 0 0-5h-5a2.5 2.5 0 0 0 0 5h5Z"/><path d="M12 9V3"/></svg> :
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                }
            </div>
            <div className={`max-w-xl p-4 rounded-xl ${isModel ? 'bg-slate-900 border border-slate-700' : 'bg-cyan-600/50'}`}>
                <div 
                    className="prose prose-invert prose-slate max-w-none text-slate-300 prose-strong:text-slate-100"
                    dangerouslySetInnerHTML={renderMarkdown(message.content)}
                />
            </div>
        </div>
    );
};

export const ChatPanel: React.FC<ChatPanelProps> = ({ history, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto space-y-6 pb-4">
        {history.map((msg, index) => (
          <Message key={index} message={msg} />
        ))}
         {isLoading && history[history.length - 1]?.role === 'user' && (
            <div className="flex items-start gap-3">
                 <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-cyan-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-300"><path d="M12 21v-3.5a2.5 2.5 0 0 1 5 0V21"/><path d="M12 21v-3.5a2.5 2.5 0 0 0-5 0V21"/><path d="M12 17.5V14"/><path d="M7 14h10"/><path d="M14.5 14a2.5 2.5 0 0 0 0-5h-5a2.5 2.5 0 0 0 0 5h5Z"/><path d="M12 9V3"/></svg>
                 </div>
                 <div className="max-w-xl p-4 rounded-xl bg-slate-900 border border-slate-700 flex items-center">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse mr-2"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-75 mr-2"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-150"></div>
                 </div>
            </div>
         )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex-shrink-0">
        <div className="flex items-center bg-slate-900 border border-slate-600 rounded-lg p-2 focus-within:ring-2 focus-within:ring-cyan-500">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a follow-up question..."
            className="w-full bg-transparent border-none focus:ring-0 text-slate-100 placeholder-slate-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold p-2 rounded-md transition duration-200"
            aria-label="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </div>
      </form>
    </div>
  );
};
