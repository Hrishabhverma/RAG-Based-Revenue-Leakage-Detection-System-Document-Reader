
import React from 'react';
import type { AuditResult, ChatMessage } from '../../types';
import { ResultsPanel } from '../ResultsPanel';
import { DashboardPanel } from './DashboardPanel';
import { ChatPanel } from './ChatPanel';

type Mode = 'audit' | 'general';

interface OutputContainerProps {
  auditResult: AuditResult | null;
  isLoading: boolean;
  error: string | null;
  activeTab: 'report' | 'dashboard';
  setActiveTab: (tab: 'report' | 'dashboard') => void;
  mode: Mode;
  chatHistory: ChatMessage[];
  onSendMessage: (message: string) => void;
}

const Placeholder: React.FC<{mode: Mode}> = ({ mode }) => (
  <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-slate-600"><path d="M12 20h.01"/><path d="M12 14h.01"/><path d="M12 8h.01"/><path d="M12 2h.01"/><path d="M4.2 15.5h.01"/><path d="M19.8 15.5h.01"/><path d="M4.2 8.5h.01"/><path d="M19.8 8.5h.01"/></svg>
    <h3 className="text-lg font-semibold">{mode === 'audit' ? 'Awaiting Audit' : 'Awaiting Query'}</h3>
    <p className="max-w-xs">{mode === 'audit' ? 'Enter your query and documents, then click "Run Audit" to see the results here.' : 'Upload documents and ask a question to start a conversation.'}</p>
  </div>
);

const LoadingState: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-slate-400">
        <svg className="animate-spin h-10 w-10 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h3 className="text-xl font-bold mt-4">Analyzing Documents...</h3>
        <p className="mt-2 text-slate-500">The AI is cross-referencing your data.</p>
    </div>
);

const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-full text-center text-red-400 bg-red-900/20 p-6 rounded-lg">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 className="text-lg font-semibold">An Error Occurred</h3>
      <p className="text-sm">{message}</p>
    </div>
);

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            active
                ? 'bg-slate-700 text-cyan-300'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
        }`}
    >
        {children}
    </button>
);

const AuditResultDisplay: React.FC<{ auditResult: AuditResult; activeTab: 'report' | 'dashboard' }> = ({ auditResult, activeTab }) => {
    return activeTab === 'report' 
        ? <ResultsPanel auditResult={auditResult} /> 
        : <DashboardPanel auditResult={auditResult} />;
}

export const OutputContainer: React.FC<OutputContainerProps> = ({ auditResult, isLoading, error, activeTab, setActiveTab, mode, chatHistory, onSendMessage }) => {
  const hasAuditResult = mode === 'audit' && auditResult;
  const isChatting = mode === 'general' && chatHistory.length > 0;

  const renderContent = () => {
    if (error) return <ErrorDisplay message={error}/>;
    if (isChatting) return <ChatPanel history={chatHistory} onSendMessage={onSendMessage} isLoading={isLoading} />;
    if (isLoading && mode === 'general') return <LoadingState />; // Show loading state for first message
    if (isLoading && mode === 'audit') return <LoadingState />;
    if (hasAuditResult) return <AuditResultDisplay auditResult={auditResult} activeTab={activeTab} />;
    return <Placeholder mode={mode} />;
  }

  return (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-lg min-h-[500px] lg:min-h-0 lg:h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <h2 className="text-2xl font-bold text-cyan-400">{mode === 'audit' ? 'Audit Output' : 'AI Conversation'}</h2>
        {hasAuditResult && (
             <div className="bg-slate-800 p-1 rounded-lg flex space-x-1">
                <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>Dashboard</TabButton>
                <TabButton active={activeTab === 'report'} onClick={() => setActiveTab('report')}>Report</TabButton>
            </div>
        )}
      </div>
      <div className="flex-grow overflow-y-auto pr-2 -mr-2 flex flex-col">
        {renderContent()}
      </div>
    </div>
  );
};
