// This file implements the semantic search flow using GenAI.
'use server';

/**
 * @fileOverview Implements semantic search using GenAI to find relevant information in documents.
 *
 * - semanticSearch - A function that performs semantic search on documents.
 * - SemanticSearchInput - The input type for the semanticSearch function.
 * - SemanticSearchOutput - The return type for the semanticSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SemanticSearchInputSchema = z.object({
  query: z.string().describe('The search query in natural language.'),
  documents: z.array(z.string()).describe('The list of documents to search through.'),
});
export type SemanticSearchInput = z.infer<typeof SemanticSearchInputSchema>;

const SemanticSearchOutputSchema = z.object({
  results: z.array(
    z.object({
      document: z.string().describe('The content of the document.'),
      relevanceScore: z.number().describe('The relevance score of the document to the query.'),
      summary: z.string().describe('A summary of the document relevant to the search query.'),
    })
  ).
  describe('The search results, including the document content, relevance score, and summary.'),
});
export type SemanticSearchOutput = z.infer<typeof SemanticSearchOutputSchema>;

export async function semanticSearch(input: SemanticSearchInput): Promise<SemanticSearchOutput> {
  return semanticSearchFlow(input);
}

const semanticSearchPrompt = ai.definePrompt({
  name: 'semanticSearchPrompt',
  input: {schema: SemanticSearchInputSchema},
  output: {schema: SemanticSearchOutputSchema},
  prompt: `You are a search assistant that helps users find relevant information in their documents.

  Given the following search query:
  {{query}}

  And the following documents:
  {{#each documents}}
  Document {{@index}}: {{{this}}}
  {{/each}}

  Return a list of search results, including the document content, relevance score (0-1), and a summary of the document relevant to the search query.
  The relevance score indicates how relevant the document is to the search query. 1 means the document is very relevant, and 0 means the document is not relevant at all.
  `,
});

const semanticSearchFlow = ai.defineFlow(
  {
    name: 'semanticSearchFlow',
    inputSchema: SemanticSearchInputSchema,
    outputSchema: SemanticSearchOutputSchema,
  },
  async input => {
    const {output} = await semanticSearchPrompt(input);
    return output!;
  }
);
