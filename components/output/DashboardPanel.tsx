import React from 'react';
import type { AuditResult } from '../../types';
import { VerdictBadge } from '../ui/VerdictBadge';
import { InfoCard } from '../ui/InfoCard';
import { RadialProgress } from '../ui/RadialProgress';

interface DashboardPanelProps {
  auditResult: AuditResult | null;
}

const getImpactColor = (impact: number) => {
    if (impact > 50000) return 'text-red-400';
    if (impact > 0) return 'text-amber-400';
    return 'text-green-400';
}

export const DashboardPanel: React.FC<DashboardPanelProps> = ({ auditResult }) => {
  if (!auditResult) {
    return <div className="text-center text-slate-400">No data to display on dashboard.</div>;
  }
  
  const citedDocs = [...new Set(auditResult.supporting_evidence.map(e => e.doc_id))];

  return (
    <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-100">Executive Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoCard title="Verdict">
                <VerdictBadge verdict={auditResult.verdict} />
            </InfoCard>
            <InfoCard title="Estimated Financial Impact">
                <span className={`text-3xl font-bold ${getImpactColor(auditResult.estimated_impact_in_INR)}`}>
                    ₹{auditResult.estimated_impact_in_INR.toLocaleString('en-IN')}
                </span>
            </InfoCard>
             <InfoCard title="Audit Confidence">
                <RadialProgress score={auditResult.confidence_score} />
            </InfoCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section>
                <h3 className="text-lg font-semibold text-slate-200 mb-2">Key Findings</h3>
                <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 h-full">
                    <ul className="list-disc list-inside space-y-2 text-slate-300">
                        {auditResult.explanation.length > 0 
                            ? auditResult.explanation.map((item, index) => <li key={index}>{item}</li>)
                            : <li>No specific findings detailed.</li>
                        }
                    </ul>
                </div>
            </section>
            <section>
                <h3 className="text-lg font-semibold text-slate-200 mb-2">Cited Documents</h3>
                <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 h-full">
                    {citedDocs.length > 0 ? (
                        <ul className="space-y-2">
                           {citedDocs.map((docId, index) => (
                                <li key={index} className="flex items-center text-slate-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400 mr-3 flex-shrink-0"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                    <span>{docId}</span>
                                </li>
                           ))}
                        </ul>
                    ) : (
                        <p className="text-slate-400">No documents cited in this audit.</p>
                    )}
                </div>
            </section>
        </div>
    </div>
  );
};
