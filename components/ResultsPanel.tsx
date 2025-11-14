import React, { useState } from 'react';
import type { AuditResult, SupportingEvidence } from '../types';
import { VerdictBadge } from './ui/VerdictBadge';
import { InfoCard } from './ui/InfoCard';

interface ResultsPanelProps {
  auditResult: AuditResult;
}

const EvidenceItem: React.FC<{ evidence: SupportingEvidence }> = ({ evidence }) => (
  <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
    <p className="text-slate-300 italic">"{evidence.excerpt}"</p>
    <div className="text-right text-xs text-cyan-400 mt-2">
      - {evidence.doc_id} ({evidence.source_type})
    </div>
  </div>
);

// Helper function to safely escape fields for CSV format
const escapeCsvField = (field: any): string => {
  const stringField = String(field ?? '');
  // If the field contains a comma, a quote, or a newline, wrap it in double quotes
  // Also, double up any existing double quotes inside the string
  if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
};


export const ResultsPanel: React.FC<ResultsPanelProps> = ({ auditResult }) => {
  const [copyButtonText, setCopyButtonText] = useState('Copy JSON');
  const [exportButtonText, setExportButtonText] = useState('Export CSV');

  const handleCopy = () => {
    if (!auditResult) return;
    navigator.clipboard.writeText(JSON.stringify(auditResult, null, 2))
      .then(() => {
        setCopyButtonText('Copied!');
        setTimeout(() => setCopyButtonText('Copy JSON'), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        setCopyButtonText('Error!');
        setTimeout(() => setCopyButtonText('Copy JSON'), 2000);
      });
  };

  const handleExportCsv = () => {
    if (!auditResult) return;

    setExportButtonText('Exporting...');

    try {
      const headers = [
        'Verdict',
        'Estimated Impact (INR)',
        'Confidence Score',
        'Explanation',
        'Remediation Suggested',
        'Missing Information',
        'Cited Documents'
      ];

      const citedDocs = [...new Set(auditResult.supporting_evidence.map(e => e.doc_id))].join('; ');

      const row = [
        auditResult.verdict,
        auditResult.estimated_impact_in_INR,
        auditResult.confidence_score,
        auditResult.explanation.join('; '),
        auditResult.remediation_suggested.join('; '),
        auditResult.missing_documents_or_fields.join('; '),
        citedDocs
      ].map(escapeCsvField);

      const csvContent = "data:text/csv;charset=utf-8," 
        + headers.map(escapeCsvField).join(',') + '\n' 
        + row.join(',');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      link.setAttribute("download", `audit_report_${timestamp}.csv`);
      document.body.appendChild(link);

      link.click();
      document.body.removeChild(link);
      
      setExportButtonText('Exported!');
    } catch (err) {
      console.error('Failed to export CSV:', err);
      setExportButtonText('Error!');
    } finally {
      setTimeout(() => setExportButtonText('Export CSV'), 2000);
    }
  };


  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-slate-100">Detailed Report</h3>
            <div className="flex items-center space-x-2">
                <button
                    onClick={handleExportCsv}
                    className="text-sm bg-slate-700 hover:bg-slate-600 text-cyan-300 font-medium py-1 px-3 rounded-md transition duration-200 flex items-center"
                    title="Export report as CSV for BI tools"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 -ml-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                    {exportButtonText}
                </button>
                <button
                    onClick={handleCopy}
                    className="text-sm bg-slate-700 hover:bg-slate-600 text-cyan-300 font-medium py-1 px-3 rounded-md transition duration-200 flex items-center"
                    title="Copy full JSON response"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 -ml-1"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    {copyButtonText}
                </button>
            </div>
        </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <InfoCard title="Verdict">
          <VerdictBadge verdict={auditResult.verdict} />
        </InfoCard>
        <InfoCard title="Estimated Impact">
          <span className="text-xl font-bold text-amber-400">₹{auditResult.estimated_impact_in_INR.toLocaleString('en-IN')}</span>
        </InfoCard>
        <InfoCard title="Confidence Score">
           <div className="w-full bg-slate-700 rounded-full h-2.5">
              <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${auditResult.confidence_score}%` }}></div>
          </div>
          <span className="text-lg font-semibold text-cyan-300 mt-1">{auditResult.confidence_score}%</span>
        </InfoCard>
      </div>

      <section>
        <h3 className="text-lg font-semibold text-slate-200 mb-2">Explanation</h3>
        <ul className="list-disc list-inside space-y-1 text-slate-300 bg-slate-900 p-4 rounded-lg border border-slate-700">
          {auditResult.explanation.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
      </section>
      
      <section>
        <h3 className="text-lg font-semibold text-slate-200 mb-2">Supporting Evidence</h3>
        <div className="space-y-3">
          {auditResult.supporting_evidence.map((item, index) => <EvidenceItem key={index} evidence={item} />)}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-200 mb-2">Suggested Remediation</h3>
        <ul className="list-disc list-inside space-y-1 text-slate-300 bg-slate-900 p-4 rounded-lg border border-slate-700">
          {auditResult.remediation_suggested.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
      </section>

      {auditResult.missing_documents_or_fields.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-red-400 mb-2">Missing Information</h3>
          <ul className="list-disc list-inside space-y-1 text-red-300 bg-red-900/20 p-4 rounded-lg border border-red-700/50">
            {auditResult.missing_documents_or_fields.map((item, index) => <li key={index}>{item}</li>)}
          </ul>
        </section>
      )}
    </div>
  );
};