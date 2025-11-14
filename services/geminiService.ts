
import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { AuditResult } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const auditSystemInstruction = `
You are the RAG-powered Enterprise Revenue Auditor. Your role is to automatically detect leakage by comparing all relevant documents retrieved via the RAG pipeline.

You must ALWAYS:
- Use ONLY the retrieved documents as evidence.
- Provide citations from retrieved text segments.
- Respond in strict JSON format.
- Give a verdict, impact, explanation, and citations.
- Provide conservative estimates.
- Be evidence-first and audit-focused.
- Never invent document IDs, amounts, or clauses.
- If evidence is missing, state INSUFFICIENT_EVIDENCE.
- If there's a partial mismatch, produce POSSIBLE_LEAKAGE.
- If everything matches, declare NO_LEAKAGE.

You must output EXACTLY the JSON schema provided. Never produce non-JSON output or use unsupported assumptions. If unsure, choose INSUFFICIENT_EVIDENCE.
`;

const generalSystemInstruction = `
You are a helpful AI assistant. Your task is to analyze the provided documents to answer the user's query. The documents are provided as the initial context in the user's first message.

- Answer questions based *only* on the information within the provided documents.
- If the documents do not contain the answer, state that the information is not available in the provided context.
- You can summarize parts of the document or the entire document if asked.
- Be conversational and helpful.
- Structure your response in clear, readable markdown. Do not use HTML tags.
`;

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        verdict: { 
          type: Type.STRING, 
          description: "The final verdict of the audit.", 
          enum: ["LEAKAGE", "POSSIBLE_LEAKAGE", "NO_LEAKAGE", "INSUFFICIENT_EVIDENCE"] 
        },
        estimated_impact_in_INR: { 
          type: Type.NUMBER, 
          description: "Estimated financial loss in Indian Rupees. Must be 0 if not computable from evidence." 
        },
        confidence_score: { 
          type: Type.NUMBER, 
          description: "Confidence score from 0 to 100 on the verdict." 
        },
        supporting_evidence: {
            type: Type.ARRAY,
            description: "A list of exact excerpts from source documents that support the verdict.",
            items: {
                type: Type.OBJECT,
                properties: {
                    doc_id: { type: Type.STRING, description: "The ID of the source document." },
                    source_type: { type: Type.STRING, description: "The type of the source document (e.g., Contract, Invoice)." },
                    excerpt: { type: Type.STRING, description: "The exact quote from the document." },
                    offset: { type: Type.NUMBER, description: "Page number or character offset of the excerpt." }
                },
                required: ["doc_id", "source_type", "excerpt"]
            }
        },
        explanation: {
            type: Type.ARRAY,
            description: "A step-by-step reasoning for the verdict in bullet points.",
            items: { type: Type.STRING }
        },
        remediation_suggested: {
            type: Type.ARRAY,
            description: "Practical finance/audit actions to resolve the issue.",
            items: { type: Type.STRING }
        },
        missing_documents_or_fields: {
            type: Type.ARRAY,
            description: "A list of any documents or fields needed for a complete audit.",
            items: { type: Type.STRING }
        }
    },
    required: ["verdict", "estimated_impact_in_INR", "confidence_score", "supporting_evidence", "explanation", "remediation_suggested", "missing_documents_or_fields"]
};


export const runAudit = async (query: string, documents: string): Promise<AuditResult> => {
    const prompt = `
        **USER QUERY:**
        ${query}

        **RETRIEVED DOCUMENTS:**
        ${documents}

        **TASK:**
        Analyze the retrieved evidence and produce a structured audit decision based on your system instructions.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                systemInstruction: auditSystemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.1,
            }
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return result as AuditResult;
    } catch (error) {
        console.error("Error calling Gemini API for audit:", error);
        throw new Error("Failed to get a valid audit response from the AI model.");
    }
};

export const startChat = (): Chat => {
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: generalSystemInstruction,
            temperature: 0.7,
        }
    });
    return chat;
};
