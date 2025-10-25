'use server';

/**
 * @fileOverview Citation extraction flow.
 *
 * - extractCitations - A function that handles the citation extraction process.
 * - CitationExtractionInput - The input type for the extractCitations function.
 * - CitationExtractionOutput - The return type for the extractCitations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CitationExtractionInputSchema = z.object({
  documentText: z
    .string()
    .describe('The text content of the document for citation extraction.'),
});
export type CitationExtractionInput = z.infer<typeof CitationExtractionInputSchema>;

const CitationExtractionOutputSchema = z.object({
  citations: z
    .array(z.string())
    .describe('A list of citations extracted from the document.'),
});
export type CitationExtractionOutput = z.infer<typeof CitationExtractionOutputSchema>;

export async function extractCitations(input: CitationExtractionInput): Promise<CitationExtractionOutput> {
  return citationExtractionFlow(input);
}

const citationExtractionPrompt = ai.definePrompt({
  name: 'citationExtractionPrompt',
  input: {schema: CitationExtractionInputSchema},
  output: {schema: CitationExtractionOutputSchema},
  prompt: `You are an expert in academic writing and citation analysis.

  Your task is to extract a list of citations from the given document text.
  Each citation should be formatted according to standard academic citation styles (e.g., APA, MLA, Chicago).
  Ensure that the extracted citations are accurate and complete, including all necessary information such as author, title, publication year, etc.

  Document Text: {{{documentText}}}

  Citations:`, // The model will append its citation list to this prompt
});

const citationExtractionFlow = ai.defineFlow(
  {
    name: 'citationExtractionFlow',
    inputSchema: CitationExtractionInputSchema,
    outputSchema: CitationExtractionOutputSchema,
  },
  async input => {
    const {output} = await citationExtractionPrompt(input);
    return output!;
  }
);
