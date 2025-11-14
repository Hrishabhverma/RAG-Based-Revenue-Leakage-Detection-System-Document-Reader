
import React from 'react';
import type { Verdict } from '../../types';

interface VerdictBadgeProps {
  verdict: Verdict;
}

export const VerdictBadge: React.FC<VerdictBadgeProps> = ({ verdict }) => {
  const baseClasses = 'px-3 py-1 text-sm font-bold rounded-full inline-block';
  
  const styles: Record<Verdict, string> = {
    'LEAKAGE': 'bg-red-500/20 text-red-300',
    'POSSIBLE_LEAKAGE': 'bg-amber-500/20 text-amber-300',
    'NO_LEAKAGE': 'bg-green-500/20 text-green-300',
    'INSUFFICIENT_EVIDENCE': 'bg-slate-500/20 text-slate-300',
  };

  return (
    <span className={`${baseClasses} ${styles[verdict] || styles.INSUFFICIENT_EVIDENCE}`}>
      {verdict.replace('_', ' ')}
    </span>
  );
};
