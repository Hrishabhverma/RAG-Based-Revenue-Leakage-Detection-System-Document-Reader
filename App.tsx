
import React, { useState, useCallback } from 'react';
import type { AuditResult, ChatMessage } from './types';
import type { Chat } from '@google/genai';
import { runAudit, startChat } from './services/geminiService';
import { parseFiles } from './services/fileParser';
import { InputPanel } from './components/InputPanel';
import { OutputContainer } from './components/output/OutputContainer';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Notification } from './components/Notification';

type Mode = 'audit' | 'general';

const App: React.FC = () => {
  const [query, setQuery] = useState<string>('Check INV-001 against contract C-001 for any billing discrepancies.');
  const [documents, setDocuments] =useState<string>(
`[
  {
    "doc_id": "C-001",
    "type": "Contract",
    "text": "Service XYZ will be billed at a rate of 5,000 INR per hour. A 10% discount applies for projects exceeding 100 hours."
  },
  {
    "doc_id": "INV-001",
    "type": "Invoice",
    "text": "Line Item: Service XYZ, Hours: 120, Rate: 5,500 INR, Total: 660,000 INR. No discount applied."
  }
]`
  );
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'report' | 'dashboard'>('report');
  const [mode, setMode] = useState<Mode>('audit');
  const [notification, setNotification] = useState<string | null>(null);

  // State for new Chat feature
  const [chat, setChat] = useState<Chat | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);


  const handleSendMessage = async (message: string) => {
    if (!chat) return;

    setIsLoading(true);
    setError(null);
    const userMessage: ChatMessage = { role: 'user', content: message };
    
    // Add user message and a placeholder for the model's response
    setChatHistory(prev => [...prev, userMessage, { role: 'model', content: '' }]);

    try {
      const stream = await chat.sendMessageStream({ message });
      let modelResponse = '';
      for await (const chunk of stream) {
        modelResponse += chunk.text;
        setChatHistory(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1].content = modelResponse;
          return newHistory;
        });
      }
    } catch (err) {
      const message = err instanceof Error ? `An error occurred: ${err.message}` : 'An unknown error occurred.';
      setError(message);
      // Remove placeholder on error
      setChatHistory(prev => prev.slice(0, -1));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = useCallback(async () => {
    if (!query.trim() || (mode === 'audit' && !documents.trim())) {
      setError('Query and documents cannot be empty for an audit.');
      return;
    }
    
    setAuditResult(null);
    setError(null);

    if (mode === 'audit') {
      setIsLoading(true);
      setChatHistory([]);
      setChat(null);
      setActiveTab('report');
      try {
        const result = await runAudit(query, documents);
        setAuditResult(result);
      } catch (err) {
        const message = err instanceof Error ? `An error occurred: ${err.message}. Please check the console.` : 'An unknown error occurred.';
        setError(message);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    } else { // General mode - start a new chat session
      setIsLoading(true);
      
      const newChat = startChat();
      setChat(newChat);

      const firstMessage = `
        Based on the following documents, please answer my question.
        ---
        DOCUMENTS:
        ${documents}
        ---
        QUESTION:
        ${query}
      `;
      
      const userMessage: ChatMessage = { role: 'user', content: query };
      setChatHistory([userMessage, { role: 'model', content: '' }]);

      try {
        const stream = await newChat.sendMessageStream({ message: firstMessage });
        let modelResponse = '';
        for await (const chunk of stream) {
          modelResponse += chunk.text;
          setChatHistory([userMessage, { role: 'model', content: modelResponse }]);
        }
      } catch (err) {
        const message = err instanceof Error ? `An error occurred: ${err.message}. Please check the console.` : 'An unknown error occurred.';
        setError(message);
        setChatHistory([]);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  }, [query, documents, mode]);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setIsParsing(true);
    setNotification(null);

    try {
      const parsedDocs = await parseFiles(files);
      setDocuments(JSON.stringify(parsedDocs, null, 2));
      setNotification(`${files.length} file(s) parsed successfully, creating ${parsedDocs.length} document chunks.`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during file parsing.';
      setError(errorMessage);
    } finally {
      setIsParsing(false);
    }
    
    event.target.value = '';
  }, []);
  
  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setAuditResult(null);
    setError(null);
    setChatHistory([]);
    setChat(null);
    if(newMode === 'audit') {
      setQuery('Check INV-001 against contract C-001 for any billing discrepancies.');
    } else {
      setQuery('Summarize what this document is about.');
    }
  };

  const handleSelectPreset = useCallback((presetQuery: string, presetDocs: string) => {
    setMode('audit');
    setQuery(presetQuery);
    setDocuments(presetDocs);
    setAuditResult(null);
    setError(null);
    setActiveTab('report');
    setChatHistory([]);
    setChat(null);
  }, []);

  const handleClear = useCallback(() => {
    setQuery(mode === 'audit' ? 'Check INV-001 against contract C-001 for any billing discrepancies.' : 'Summarize what this document is about.');
    setDocuments('');
    setAuditResult(null);
    setError(null);
    setIsLoading(false);
    setIsParsing(false);
    setActiveTab('report');
    setChatHistory([]);
    setChat(null);
  }, [mode]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col relative">
      <Header />
      {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <InputPanel
          query={query}
          setQuery={setQuery}
          documents={documents}
          setDocuments={setDocuments}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          isParsing={isParsing}
          onFileChange={handleFileChange}
          onClear={handleClear}
          onSelectPreset={handleSelectPreset}
          mode={mode}
          setMode={handleModeChange}
        />
        <OutputContainer
          auditResult={auditResult}
          isLoading={isLoading}
          error={error}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mode={mode}
          chatHistory={chatHistory}
          onSendMessage={handleSendMessage}
        />
      </main>
      <Footer />
    </div>
  );
};

export default App;
