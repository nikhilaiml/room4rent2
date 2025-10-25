'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating summaries of documents.
 *
 * It includes:
 * - `generateDocumentSummary`: A function to generate a summary of a document.
 * - `DocumentSummaryInput`: The input type for the `generateDocumentSummary` function.
 * - `DocumentSummaryOutput`: The output type for the `generateDocumentSummary` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DocumentSummaryInputSchema = z.object({
  documentContent: z
    .string()
    .describe('The content of the document to be summarized.'),
});
export type DocumentSummaryInput = z.infer<typeof DocumentSummaryInputSchema>;

const DocumentSummaryOutputSchema = z.object({
  summary: z.string().describe('The generated summary of the document.'),
});
export type DocumentSummaryOutput = z.infer<typeof DocumentSummaryOutputSchema>;

export async function generateDocumentSummary(
  input: DocumentSummaryInput
): Promise<DocumentSummaryOutput> {
  return documentSummaryFlow(input);
}

const documentSummaryPrompt = ai.definePrompt({
  name: 'documentSummaryPrompt',
  input: {schema: DocumentSummaryInputSchema},
  output: {schema: DocumentSummaryOutputSchema},
  prompt: `Summarize the following document, highlighting the key points and arguments:\n\n{{{documentContent}}}`,
});

const documentSummaryFlow = ai.defineFlow(
  {
    name: 'documentSummaryFlow',
    inputSchema: DocumentSummaryInputSchema,
    outputSchema: DocumentSummaryOutputSchema,
  },
  async input => {
    const {output} = await documentSummaryPrompt(input);
    return output!;
  }
);
