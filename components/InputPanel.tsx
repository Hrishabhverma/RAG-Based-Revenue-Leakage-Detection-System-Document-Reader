import React, { useRef } from 'react';
import { Loader } from './ui/Loader';
import { ExamplePresets } from './ExamplePresets';

type Mode = 'audit' | 'general';

interface InputPanelProps {
  query: string;
  setQuery: (value: string) => void;
  documents: string;
  setDocuments: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  isParsing: boolean;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  onSelectPreset: (query: string, documents: string) => void;
  mode: Mode;
  setMode: (mode: Mode) => void;
}

const ModeButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors w-1/2 ${
            active
                ? 'bg-slate-700 text-cyan-300'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
        }`}
    >
        {children}
    </button>
);


export const InputPanel: React.FC<InputPanelProps> = ({ 
    query, setQuery, documents, setDocuments, onSubmit, isLoading, isParsing, onFileChange, onClear, onSelectPreset, mode, setMode 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const placeholders = {
    audit: 'e.g., Check INV-123 vs Contract CR-87',
    general: 'e.g., Summarize the main points of the document'
  };

  const buttonTexts = {
    audit: { default: 'Run Audit', loading: 'Auditing...' },
    general: { default: 'Get Answer', loading: 'Analyzing...' }
  };
  
  return (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-lg h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-cyan-400">Inputs</h2>
        <button 
            onClick={onClear} 
            className="text-sm text-slate-400 hover:text-white hover:bg-slate-700 py-1 px-3 rounded-md transition"
            aria-label="Clear all inputs"
        >
            Clear All
        </button>
      </div>

       <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Operation Mode</label>
        <div className="bg-slate-900 p-1 rounded-lg flex space-x-1 border border-slate-700">
            <ModeButton active={mode === 'audit'} onClick={() => setMode('audit')}>Audit</ModeButton>
            <ModeButton active={mode === 'general'} onClick={() => setMode('general')}>Summarize / Q&A</ModeButton>
        </div>
       </div>
      
      <div>
        <label htmlFor="query" className="block text-sm font-medium text-slate-300 mb-2">
          {mode === 'audit' ? 'User Query' : 'Question / Instruction'}
        </label>
        <input
          id="query"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholders[mode]}
          className="w-full bg-slate-900 border border-slate-600 rounded-md p-3 text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
        />
      </div>
      
      <div className="flex-grow flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <div>
            <label htmlFor="documents" className="block text-sm font-medium text-slate-300">
              Document Context
            </label>
            <p className="text-xs text-slate-400">Supports: PDF, DOCX, TXT, JSON</p>
          </div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={onFileChange}
                multiple
                accept=".txt,.json,.pdf,.docx"
                className="hidden"
                aria-hidden="true"
                disabled={isParsing}
            />
            <button
                onClick={handleUploadClick}
                disabled={isParsing || isLoading}
                className="text-sm bg-slate-700 hover:bg-slate-600 disabled:bg-slate-600/50 disabled:cursor-not-allowed text-cyan-300 font-medium py-1 px-3 rounded-md transition duration-200 flex items-center"
            >
                {isParsing ? (
                    <><Loader /> Parsing...</>
                ) : (
                    <><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 -ml-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg> Upload Files</>
                )}
            </button>
        </div>
        <textarea
          id="documents"
          value={documents}
          onChange={(e) => setDocuments(e.target.value)}
          placeholder="Paste retrieved document chunks here, or upload files..."
          className="w-full h-full flex-grow bg-slate-900 border border-slate-600 rounded-md p-3 font-mono text-sm text-slate-100 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition resize-none"
          rows={10}
        />
      </div>

      {mode === 'audit' && <ExamplePresets onSelectPreset={onSelectPreset} />}
      
      <button
        onClick={onSubmit}
        disabled={isLoading || isParsing}
        className="w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 text-white font-bold py-3 px-4 rounded-md transition duration-300 ease-in-out transform hover:scale-105 disabled:scale-100"
      >
        {isLoading ? (
          <>
            <Loader />
            <span className="ml-2">{buttonTexts[mode].loading}</span>
          </>
        ) : (
          buttonTexts[mode].default
        )}
      </button>
    </div>
  );
};