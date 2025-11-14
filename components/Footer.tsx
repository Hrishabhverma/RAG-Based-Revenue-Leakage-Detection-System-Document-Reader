
import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="text-center py-4 text-slate-500 text-sm border-t border-slate-800">
            <p>&copy; {new Date().getFullYear()} RAG-Based Revenue Leakage Detection System. Powered by Gemini.</p>
        </footer>
    );
};