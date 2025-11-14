
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-900/60 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
          <path d="M12 21v-3.5a2.5 2.5 0 0 1 5 0V21"/><path d="M12 21v-3.5a2.5 2.5 0 0 0-5 0V21"/>
          <path d="M12 17.5V14"/><path d="M7 14h10"/>
          <path d="M14.5 14a2.5 2.5 0 0 0 0-5h-5a2.5 2.5 0 0 0 0 5h5Z"/>
          <path d="M12 9V3"/>
        </svg>
        <h1 className="text-xl font-bold ml-3 text-slate-100">
          RAG-Based Revenue Leakage Detection System
        </h1>
        <span className="ml-2 text-xs font-mono bg-cyan-800/50 text-cyan-300 px-2 py-1 rounded-md">
          AI-Powered
        </span>
      </div>
    </header>
  );
};