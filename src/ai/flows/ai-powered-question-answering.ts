'use server';
/**
 * @fileOverview AI-Powered Question Answering flow for the ScholarSage app.
 *
 * - aiPoweredQuestionAnswering - A function that answers questions about user documents.
 * - AiPoweredQuestionAnsweringInput - The input type for the aiPoweredQuestionAnswering function.
 * - AiPoweredQuestionAnsweringOutput - The return type for the aiPoweredQuestionAnswering function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiPoweredQuestionAnsweringInputSchema = z.object({
  query: z.string().describe('The question to ask about the documents.'),
  documentContent: z.string().describe('The content of the documents to answer the question from.'),
});
export type AiPoweredQuestionAnsweringInput = z.infer<typeof AiPoweredQuestionAnsweringInputSchema>;

const AiPoweredQuestionAnsweringOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
  citations: z.array(z.string()).describe('The citations for the answer.'),
});
export type AiPoweredQuestionAnsweringOutput = z.infer<typeof AiPoweredQuestionAnsweringOutputSchema>;

export async function aiPoweredQuestionAnswering(input: AiPoweredQuestionAnsweringInput): Promise<AiPoweredQuestionAnsweringOutput> {
  return aiPoweredQuestionAnsweringFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPoweredQuestionAnsweringPrompt',
  input: {schema: AiPoweredQuestionAnsweringInputSchema},
  output: {schema: AiPoweredQuestionAnsweringOutputSchema},
  prompt: `You are an AI assistant that answers questions about documents.

  You are given a question and the content of the documents.

  You must answer the question based on the content of the documents.

  You must also provide citations to the specific documents from which the answers are derived.

  Question: {{{query}}}
  Documents: {{{documentContent}}}

  Answer and Citations:`,
});

const aiPoweredQuestionAnsweringFlow = ai.defineFlow(
  {
    name: 'aiPoweredQuestionAnsweringFlow',
    inputSchema: AiPoweredQuestionAnsweringInputSchema,
    outputSchema: AiPoweredQuestionAnsweringOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
