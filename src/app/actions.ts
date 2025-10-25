"use server";

import { semanticSearch } from '@/ai/flows/semantic-search-gen-ai';
import type { SemanticSearchOutput } from '@/ai/flows/semantic-search-gen-ai';
import { generateDocumentSummary } from '@/ai/flows/document-summary-generation';
import type { DocumentSummaryOutput } from '@/ai/flows/document-summary-generation';
import { extractCitations } from '@/ai/flows/citation-extraction';
import type { CitationExtractionOutput } from '@/ai/flows/citation-extraction';
import { aiPoweredQuestionAnswering } from '@/ai/flows/ai-powered-question-answering';
import type { AiPoweredQuestionAnsweringOutput } from '@/ai/flows/ai-powered-question-answering';

import { getDocument, getDocuments } from '@/lib/documents';

export async function handleSearch(query: string): Promise<SemanticSearchOutput | { error: string }> {
  if (!query) {
    return { error: 'Search query cannot be empty.' };
  }
  try {
    const documents = await getDocuments();
    const documentContents = documents.map(doc => `Document ID: ${doc.id}\nTitle: ${doc.title}\nContent: ${doc.content}`);
    const results = await semanticSearch({ query, documents: documentContents });
    return results;
  } catch (e: any) {
    console.error('Search failed:', e);
    return { error: e.message || 'An unexpected error occurred during search.' };
  }
}

export async function handleGenerateSummary(documentId: string): Promise<DocumentSummaryOutput | { error: string }> {
  try {
    const doc = await getDocument(documentId);
    if (!doc) {
      return { error: 'Document not found.' };
    }
    const result = await generateDocumentSummary({ documentContent: doc.content });
    return result;
  } catch (e: any) {
    console.error('Summary generation failed:', e);
    return { error: e.message || 'An unexpected error occurred during summary generation.' };
  }
}

export async function handleExtractCitations(documentId: string): Promise<CitationExtractionOutput | { error: string }> {
  try {
    const doc = await getDocument(documentId);
    if (!doc) {
      return { error: 'Document not found.' };
    }
    const result = await extractCitations({ documentText: doc.content });
    return result;
  } catch (e: any) {
    console.error('Citation extraction failed:', e);
    return { error: e.message || 'An unexpected error occurred during citation extraction.' };
  }
}

export async function handleQuestion(documentId: string, query: string): Promise<AiPoweredQuestionAnsweringOutput | { error: string }> {
  if (!query) {
    return { error: 'Question cannot be empty.' };
  }
  try {
    const doc = await getDocument(documentId);
    if (!doc) {
      return { error: 'Document not found.' };
    }
    const result = await aiPoweredQuestionAnswering({ query, documentContent: doc.content });
    return result;
  } catch (e: any) {
    console.error('Q&A failed:', e);
    return { error: e.message || 'An unexpected error occurred during Q&A.' };
  }
}
