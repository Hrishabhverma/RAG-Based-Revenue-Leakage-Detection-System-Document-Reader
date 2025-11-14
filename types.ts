
export type Verdict = "LEAKAGE" | "POSSIBLE_LEAKAGE" | "NO_LEAKAGE" | "INSUFFICIENT_EVIDENCE";

export interface SupportingEvidence {
  doc_id: string;
  source_type: string;
  excerpt: string;
  offset: number;
}

export interface AuditResult {
  verdict: Verdict;
  estimated_impact_in_INR: number;
  confidence_score: number;
  supporting_evidence: SupportingEvidence[];
  explanation: string[];
  remediation_suggested: string[];
  missing_documents_or_fields: string[];
}

export type ChatMessage = {
  role: 'user' | 'model';
  content: string;
};
